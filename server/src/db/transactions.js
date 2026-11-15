import { relationalDb } from './relational.js';
import { nosqlDb } from './nosql.js';
import { redisCache } from './cache.js';

export class TransactionService {
  static async submitAttendanceSession({ classId, facultyId, subjectId, date, records, sessionTime = '09:00 AM - 10:00 AM', markedBy }) {
    if (!classId || !subjectId || !date || !Array.isArray(records) || records.length === 0) {
      throw new Error('Invalid input: classId, subjectId, date, and student records are required.');
    }

    const txId = relationalDb.beginTransaction();

    try {
      const existingSession = relationalDb.findOne('attendance_sessions', s =>
        s.class_id === classId && s.subject_id === subjectId && s.date === date,
        txId
      );

      if (existingSession) {
        throw new Error(`Attendance for class '${classId}', subject '${subjectId}' on date '${date}' has already been marked. Duplicate submission blocked.`);
      }

      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;

      for (const rec of records) {
        if (rec.status === 'Present') presentCount++;
        else if (rec.status === 'Absent') absentCount++;
        else if (rec.status === 'Late') lateCount++;
      }

      const sessionId = 'att_sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

      relationalDb.insert('attendance_sessions', {
        id: sessionId,
        class_id: classId,
        faculty_id: facultyId,
        subject_id: subjectId,
        date: date,
        session_time: sessionTime,
        total_students: records.length,
        present_count: presentCount,
        absent_count: absentCount,
        late_count: lateCount,
        status: 'Completed',
        created_at: new Date().toISOString()
      }, txId);

      for (const item of records) {
        const recordId = 'rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        relationalDb.insert('attendance_records', {
          id: recordId,
          session_id: sessionId,
          class_id: classId,
          student_id: item.studentId,
          subject_id: subjectId,
          date: date,
          status: item.status,
          remarks: item.remarks || '',
          marked_by: markedBy,
          updated_at: new Date().toISOString()
        }, txId);
      }

      const commitResult = relationalDb.commitTransaction(txId);

      redisCache.invalidatePattern('stats:');
      redisCache.invalidatePattern('report:');
      redisCache.invalidatePattern('student:');

      // Wrap NoSQL operations in try/catch to prevent Atlas downtime from breaking attendance
      try {
        await nosqlDb.insertOne('attendance_events', {
          eventType: 'ATTENDANCE_SESSION_CREATED',
          sessionId,
          classId,
          subjectId,
          date,
          totalRecords: records.length,
          counts: { presentCount, absentCount, lateCount },
          authorId: markedBy,
          timestamp: new Date().toISOString()
        });

        await nosqlDb.insertOne('activity_logs', {
          userId: markedBy,
          userRole: 'faculty',
          action: 'MARK_ATTENDANCE',
          module: 'Attendance',
          details: { sessionId, classId, subjectId, date, present: presentCount, absent: absentCount, late: lateCount },
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        });

        for (const rec of records) {
          if (rec.status === 'Absent') {
            await nosqlDb.insertOne('notifications', {
              recipientId: rec.studentId,
              recipientRole: 'student',
              title: 'Attendance Alert: Marked Absent',
              message: `You were marked Absent for class on ${date}. Please contact your faculty if this is an error.`,
              type: 'low_attendance',
              isRead: false,
              createdAt: new Date().toISOString()
            });
          }
        }
      } catch (dbErr) {
        console.warn('[Atlas Offline] Attendance committed to relational DB, but NoSQL logging failed:', dbErr.message);
      }

      return {
        success: true,
        sessionId,
        transactionId: txId,
        presentCount,
        absentCount,
        lateCount,
        totalStudents: records.length
      };
    } catch (err) {
      relationalDb.rollbackTransaction(txId);

      try {
        await nosqlDb.insertOne('activity_logs', {
          userId: markedBy || 'system',
          userRole: 'faculty',
          action: 'MARK_ATTENDANCE_FAILED',
          module: 'Attendance',
          details: { classId, subjectId, date, error: err.message },
          status: 'FAILED_ROLLEDBACK',
          timestamp: new Date().toISOString()
        });
      } catch (dbErr) {
        console.warn('[Atlas Offline] Failed to log attendance failure to Atlas:', dbErr.message);
      }

      throw err;
    }
  }

  static async updateAttendanceRecord({ recordId, newStatus, remarks, updatedBy, userRole = 'faculty' }) {
    const txId = relationalDb.beginTransaction();
    try {
      const existing = relationalDb.findById('attendance_records', recordId, txId);
      if (!existing) {
        throw new Error(`Attendance record ${recordId} not found.`);
      }

      const oldStatus = existing.status;
      const updated = relationalDb.update('attendance_records', recordId, {
        status: newStatus,
        remarks: remarks !== undefined ? remarks : existing.remarks,
        marked_by: updatedBy,
        updated_at: new Date().toISOString()
      }, txId);

      const session = relationalDb.findById('attendance_sessions', existing.session_id, txId);
      if (session) {
        let deltaPresent = 0;
        let deltaAbsent = 0;
        let deltaLate = 0;

        if (oldStatus === 'Present') deltaPresent--;
        if (oldStatus === 'Absent') deltaAbsent--;
        if (oldStatus === 'Late') deltaLate--;

        if (newStatus === 'Present') deltaPresent++;
        if (newStatus === 'Absent') deltaAbsent++;
        if (newStatus === 'Late') deltaLate++;

        relationalDb.update('attendance_sessions', session.id, {
          present_count: Math.max(0, session.present_count + deltaPresent),
          absent_count: Math.max(0, session.absent_count + deltaAbsent),
          late_count: Math.max(0, session.late_count + deltaLate)
        }, txId);
      }

      relationalDb.commitTransaction(txId);

      redisCache.invalidatePattern('stats:');
      redisCache.invalidatePattern('report:');
      redisCache.invalidatePattern('student:');

      try {
        await nosqlDb.insertOne('attendance_events', {
          eventType: 'ATTENDANCE_RECORD_CORRECTED',
          recordId,
          studentId: existing.student_id,
          date: existing.date,
          previousState: oldStatus,
          newState: newStatus,
          reason: remarks || 'Attendance record updated by authorized personnel',
          authorId: updatedBy,
          timestamp: new Date().toISOString()
        });

        await nosqlDb.insertOne('activity_logs', {
          userId: updatedBy,
          userRole,
          action: 'UPDATE_ATTENDANCE',
          module: 'Attendance',
          details: { recordId, oldStatus, newStatus, remarks },
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        });

        await nosqlDb.insertOne('notifications', {
          recipientId: existing.student_id,
          recipientRole: 'student',
          title: 'Attendance Record Updated',
          message: `Your attendance record for ${existing.date} was updated from ${oldStatus} to ${newStatus}.`,
          type: 'correction',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      } catch (dbErr) {
        console.warn('[Atlas Offline] Attendance updated in relational DB, but NoSQL logging failed:', dbErr.message);
      }

      return { success: true, updated };
    } catch (err) {
      relationalDb.rollbackTransaction(txId);
      throw err;
    }
  }

  static runTransactionSimulation({ mode }) {
    if (mode === 'fail_duplicate') {
      const records = relationalDb.select('attendance_records');
      if (records.length === 0) {
        throw new Error('No existing attendance records found to simulate duplicate on.');
      }
      const sample = records[0];
      const txId = relationalDb.beginTransaction();
      try {
        relationalDb.insert('attendance_records', {
          id: 'sim_dup_' + Date.now(),
          session_id: sample.session_id,
          class_id: sample.class_id,
          student_id: sample.student_id,
          subject_id: sample.subject_id,
          date: sample.date,
          status: 'Present'
        }, txId);

        relationalDb.commitTransaction(txId);
        return { success: true };
      } catch (err) {
        relationalDb.rollbackTransaction(txId);
        return {
          success: false,
          rolledBack: true,
          transactionId: txId,
          errorType: 'Duplicate Unique Constraint Violation',
          message: err.message,
          explanation: 'The relational database engine detected an attempt to insert a duplicate attendance for the same (student, class, subject, date) combination. The entire transaction was automatically rolled back, preserving database integrity.'
        };
      }
    } else {
      const txId = relationalDb.beginTransaction();
      try {
        const testDept = relationalDb.insert('departments', {
          id: 'test_dept_' + Date.now(),
          code: 'TEST' + Math.floor(Math.random() * 900 + 100),
          name: 'Transaction Lab Dept',
          description: 'Atomic creation test',
          created_at: new Date().toISOString()
        }, txId);

        relationalDb.commitTransaction(txId);
        return {
          success: true,
          committed: true,
          transactionId: txId,
          createdDepartment: testDept,
          message: 'Transaction successfully executed and committed. ACID atomicity confirmed.'
        };
      } catch (err) {
        relationalDb.rollbackTransaction(txId);
        throw err;
      }
    }
  }
}