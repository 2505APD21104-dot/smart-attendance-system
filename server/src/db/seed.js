import bcrypt from 'bcryptjs';
import { relationalDb } from './relational.js';
import { nosqlDb } from './nosql.js';
import { graphDb } from './graph.js';
import { redisCache } from './cache.js';

export async function seedDatabase() {
  console.log('Seeding Smart Attendance Management Database...');

  // Reset existing tables and collections
  relationalDb.resetTables();
  nosqlDb.reset();
  redisCache.flushAll();

  // 1. System Settings
  relationalDb.insert('system_settings', {
    id: 'set_min_att',
    key: 'min_attendance_percentage',
    value: '75',
    description: 'Mandatory minimum attendance threshold for examination eligibility (%)',
    updated_at: new Date().toISOString()
  });

  relationalDb.insert('system_settings', {
    id: 'set_acad_year',
    key: 'academic_year',
    value: '2024-2025',
    description: 'Current active academic year',
    updated_at: new Date().toISOString()
  });

  relationalDb.insert('system_settings', {
    id: 'set_inst_name',
    key: 'institution_name',
    value: 'Apex Institute of Technology & University',
    description: 'Official university title displayed across portal',
    updated_at: new Date().toISOString()
  });

  // 2. Departments
  const departments = [
    { id: 'dept_cse', code: 'CSE', name: 'Computer Science & Engineering', description: 'School of Computing and Information Systems' },
    { id: 'dept_it', code: 'IT', name: 'Information Technology', description: 'Department of Software Systems & Cloud Networks' },
    { id: 'dept_ece', code: 'ECE', name: 'Electronics & Communication', description: 'Department of Microelectronics, IoT and Telecommunications' },
    { id: 'dept_me', code: 'ME', name: 'Mechanical Engineering', description: 'Department of Robotics, Dynamics and Thermal Sciences' },
    { id: 'dept_ba', code: 'BA', name: 'Business Administration', description: 'Faculty of Management & Applied Analytics' }
  ];

  for (const dept of departments) {
    relationalDb.insert('departments', {
      ...dept,
      created_at: new Date().toISOString()
    });
  }

  // Common demo passwords hashed
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const facultyPasswordHash = await bcrypt.hash('Faculty@123', 10);
  const studentPasswordHash = await bcrypt.hash('Student@123', 10);

  // 3. Admin User
  const adminUser = relationalDb.insert('users', {
    id: 'usr_admin_1',
    username: 'admin',
    email: 'admin@apex.edu',
    password_hash: adminPasswordHash,
    role: 'admin',
    first_name: 'Dr. Eleanor',
    last_name: 'Vance',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    created_at: new Date().toISOString()
  });

  // 4. Faculty Users & Records
  const facultyData = [
    {
      user: { id: 'usr_fac_1', username: 'robert.chen', email: 'robert.chen@apex.edu', first_name: 'Dr. Robert', last_name: 'Chen', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
      fac: { id: 'fac_1', employee_id: 'FAC-CSE-001', department_id: 'dept_cse', qualification: 'Ph.D. Computer Science (Carnegie Mellon)', designation: 'Associate Professor', joining_date: '2019-08-15' }
    },
    {
      user: { id: 'usr_fac_2', username: 'sarah.miller', email: 'sarah.miller@apex.edu', first_name: 'Prof. Sarah', last_name: 'Miller', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
      fac: { id: 'fac_2', employee_id: 'FAC-CSE-002', department_id: 'dept_cse', qualification: 'M.Tech Software Engineering (Stanford)', designation: 'Assistant Professor', joining_date: '2021-01-10' }
    },
    {
      user: { id: 'usr_fac_3', username: 'ananya.roy', email: 'ananya.roy@apex.edu', first_name: 'Dr. Ananya', last_name: 'Roy', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
      fac: { id: 'fac_3', employee_id: 'FAC-IT-001', department_id: 'dept_it', qualification: 'Ph.D. Distributed Cloud Systems', designation: 'Professor & HOD', joining_date: '2016-07-01' }
    },
    {
      user: { id: 'usr_fac_4', username: 'david.kim', email: 'david.kim@apex.edu', first_name: 'Dr. David', last_name: 'Kim', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
      fac: { id: 'fac_4', employee_id: 'FAC-ECE-001', department_id: 'dept_ece', qualification: 'Ph.D. Embedded Systems & DSP', designation: 'Associate Professor', joining_date: '2018-09-01' }
    },
    {
      user: { id: 'usr_fac_5', username: 'elena.rostova', email: 'elena.rostova@apex.edu', first_name: 'Prof. Elena', last_name: 'Rostova', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
      fac: { id: 'fac_5', employee_id: 'FAC-ME-001', department_id: 'dept_me', qualification: 'M.S. Robotics and Automation', designation: 'Assistant Professor', joining_date: '2022-03-15' }
    }
  ];

  for (const item of facultyData) {
    relationalDb.insert('users', {
      ...item.user,
      password_hash: facultyPasswordHash,
      role: 'faculty',
      created_at: new Date().toISOString()
    });

    relationalDb.insert('faculty', {
      ...item.fac,
      user_id: item.user.id
    });
  }

  // 5. Courses
  const courses = [
    { id: 'crs_cs501', code: 'CS501', name: 'Data Structures & Algorithms', department_id: 'dept_cse', credits: 4, semester: 5, type: 'Theory & Lab' },
    { id: 'crs_cs502', code: 'CS502', name: 'Database Management Systems', department_id: 'dept_cse', credits: 4, semester: 5, type: 'Theory & Lab' },
    { id: 'crs_cs503', code: 'CS503', name: 'Software Engineering', department_id: 'dept_cse', credits: 3, semester: 5, type: 'Theory' },
    { id: 'crs_cs504', code: 'CS504', name: 'Computer Networks', department_id: 'dept_cse', credits: 3, semester: 5, type: 'Theory' },
    { id: 'crs_it501', code: 'IT501', name: 'Cloud Computing & DevOps', department_id: 'dept_it', credits: 4, semester: 5, type: 'Theory & Lab' },
    { id: 'crs_it502', code: 'IT502', name: 'Modern Web Architecture', department_id: 'dept_it', credits: 4, semester: 5, type: 'Theory & Lab' },
    { id: 'crs_ec501', code: 'EC501', name: 'Digital Signal Processing', department_id: 'dept_ece', credits: 4, semester: 5, type: 'Theory' },
    { id: 'crs_me501', code: 'ME501', name: 'Thermodynamics & Heat Transfer', department_id: 'dept_me', credits: 4, semester: 5, type: 'Theory' }
  ];

  for (const c of courses) {
    relationalDb.insert('courses', c);
  }

  // 6. Classes
  const classes = [
    { id: 'cls_cse_dbms', name: 'CSE-5A Database Management Systems', course_id: 'crs_cs502', department_id: 'dept_cse', faculty_id: 'fac_1', semester: 5, section: 'A', academic_year: '2024-2025', schedule_time: 'Mon, Wed, Fri 09:00 - 10:00 AM', room_no: 'Lab 301' },
    { id: 'cls_cse_dsa', name: 'CSE-5A Data Structures & Algorithms', course_id: 'crs_cs501', department_id: 'dept_cse', faculty_id: 'fac_2', semester: 5, section: 'A', academic_year: '2024-2025', schedule_time: 'Tue, Thu 10:00 - 11:30 AM', room_no: 'Hall 102' },
    { id: 'cls_cse_cn', name: 'CSE-5A Computer Networks', course_id: 'crs_cs504', department_id: 'dept_cse', faculty_id: 'fac_1', semester: 5, section: 'A', academic_year: '2024-2025', schedule_time: 'Mon, Wed 02:00 - 03:30 PM', room_no: 'Room 204' },
    { id: 'cls_it_cloud', name: 'IT-5B Cloud Computing & DevOps', course_id: 'crs_it501', department_id: 'dept_it', faculty_id: 'fac_3', semester: 5, section: 'B', academic_year: '2024-2025', schedule_time: 'Mon, Wed 11:00 AM - 12:30 PM', room_no: 'Cloud Lab 4' },
    { id: 'cls_it_web', name: 'IT-5B Modern Web Architecture', course_id: 'crs_it502', department_id: 'dept_it', faculty_id: 'fac_2', semester: 5, section: 'B', academic_year: '2024-2025', schedule_time: 'Tue, Fri 01:00 - 02:30 PM', room_no: 'Web Studio 2' }
  ];

  for (const cls of classes) {
    relationalDb.insert('classes', cls);
  }

  // 7. Students (40 realistic student profiles across CSE & IT)
  const studentNames = [
    { first: 'Alex', last: 'Johnson', roll: 'CS2024001', reg: 'REG2024101', dept: 'dept_cse', sem: 5, sec: 'A', email: 'alex.j@apex.edu' },
    { first: 'Priya', last: 'Sharma', roll: 'CS2024002', reg: 'REG2024102', dept: 'dept_cse', sem: 5, sec: 'A', email: 'priya.s@apex.edu' },
    { first: 'Marcus', last: 'Wright', roll: 'CS2024003', reg: 'REG2024103', dept: 'dept_cse', sem: 5, sec: 'A', email: 'marcus.w@apex.edu' },
    { first: 'Aaliyah', last: 'Khan', roll: 'CS2024004', reg: 'REG2024104', dept: 'dept_cse', sem: 5, sec: 'A', email: 'aaliyah.k@apex.edu' },
    { first: 'Ethan', last: 'Davis', roll: 'CS2024005', reg: 'REG2024105', dept: 'dept_cse', sem: 5, sec: 'A', email: 'ethan.d@apex.edu' },
    { first: 'Sophia', last: 'Martinez', roll: 'CS2024006', reg: 'REG2024106', dept: 'dept_cse', sem: 5, sec: 'A', email: 'sophia.m@apex.edu' },
    { first: 'Rohan', last: 'Verma', roll: 'CS2024007', reg: 'REG2024107', dept: 'dept_cse', sem: 5, sec: 'A', email: 'rohan.v@apex.edu' },
    { first: 'Liam', last: 'O\'Connor', roll: 'CS2024008', reg: 'REG2024108', dept: 'dept_cse', sem: 5, sec: 'A', email: 'liam.o@apex.edu' },
    { first: 'Zoe', last: 'Washington', roll: 'CS2024009', reg: 'REG2024109', dept: 'dept_cse', sem: 5, sec: 'A', email: 'zoe.w@apex.edu' },
    { first: 'Daniel', last: 'Lee', roll: 'CS2024010', reg: 'REG2024110', dept: 'dept_cse', sem: 5, sec: 'A', email: 'daniel.l@apex.edu' },
    { first: 'Chloe', last: 'Taylor', roll: 'CS2024011', reg: 'REG2024111', dept: 'dept_cse', sem: 5, sec: 'A', email: 'chloe.t@apex.edu' },
    { first: 'James', last: 'Wilson', roll: 'CS2024012', reg: 'REG2024112', dept: 'dept_cse', sem: 5, sec: 'A', email: 'james.w@apex.edu' },
    { first: 'Fatima', last: 'Zahra', roll: 'CS2024013', reg: 'REG2024113', dept: 'dept_cse', sem: 5, sec: 'A', email: 'fatima.z@apex.edu' },
    { first: 'Lucas', last: 'Brown', roll: 'CS2024014', reg: 'REG2024114', dept: 'dept_cse', sem: 5, sec: 'A', email: 'lucas.b@apex.edu' },
    { first: 'Ananya', last: 'Gupta', roll: 'CS2024015', reg: 'REG2024115', dept: 'dept_cse', sem: 5, sec: 'A', email: 'ananya.g@apex.edu' },
    // IT students (Section B)
    { first: 'Noah', last: 'Scott', roll: 'IT2024001', reg: 'REG2024201', dept: 'dept_it', sem: 5, sec: 'B', email: 'noah.s@apex.edu' },
    { first: 'Mia', last: 'Chen', roll: 'IT2024002', reg: 'REG2024202', dept: 'dept_it', sem: 5, sec: 'B', email: 'mia.c@apex.edu' },
    { first: 'Oliver', last: 'Smith', roll: 'IT2024003', reg: 'REG2024203', dept: 'dept_it', sem: 5, sec: 'B', email: 'oliver.s@apex.edu' },
    { first: 'Aria', last: 'Patel', roll: 'IT2024004', reg: 'REG2024204', dept: 'dept_it', sem: 5, sec: 'B', email: 'aria.p@apex.edu' },
    { first: 'Benjamin', last: 'Clark', roll: 'IT2024005', reg: 'REG2024205', dept: 'dept_it', sem: 5, sec: 'B', email: 'benjamin.c@apex.edu' },
    { first: 'Amara', last: 'Diallo', roll: 'IT2024006', reg: 'REG2024206', dept: 'dept_it', sem: 5, sec: 'B', email: 'amara.d@apex.edu' },
    { first: 'William', last: 'Turner', roll: 'IT2024007', reg: 'REG2024207', dept: 'dept_it', sem: 5, sec: 'B', email: 'william.t@apex.edu' },
    { first: 'Emily', last: 'Harris', roll: 'IT2024008', reg: 'REG2024208', dept: 'dept_it', sem: 5, sec: 'B', email: 'emily.h@apex.edu' },
    { first: 'Kabir', last: 'Das', roll: 'IT2024009', reg: 'REG2024209', dept: 'dept_it', sem: 5, sec: 'B', email: 'kabir.d@apex.edu' },
    { first: 'Hannah', last: 'Baker', roll: 'IT2024010', reg: 'REG2024210', dept: 'dept_it', sem: 5, sec: 'B', email: 'hannah.b@apex.edu' }
  ];

  const studentEntities = [];

  for (let i = 0; i < studentNames.length; i++) {
    const s = studentNames[i];
    const user = relationalDb.insert('users', {
      id: `usr_st_${i + 1}`,
      username: s.roll.toLowerCase(),
      email: s.email,
      password_hash: studentPasswordHash,
      role: 'student',
      first_name: s.first,
      last_name: s.last,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + i * 123456}?w=150`,
      created_at: new Date().toISOString()
    });

    const studentRec = relationalDb.insert('students', {
      id: `st_${i + 1}`,
      user_id: user.id,
      roll_number: s.roll,
      registration_no: s.reg,
      department_id: s.dept,
      semester: s.sem,
      section: s.sec,
      batch_year: '2022-2026'
    });

    studentEntities.push({ ...studentRec, name: `${s.first} ${s.last}` });
  }

  // 8. Enroll Students into Classes
  // CSE students enroll into CSE classes
  const cseStudents = studentEntities.filter(s => s.department_id === 'dept_cse');
  const itStudents = studentEntities.filter(s => s.department_id === 'dept_it');

  const cseClasses = classes.filter(c => c.department_id === 'dept_cse');
  const itClasses = classes.filter(c => c.department_id === 'dept_it');

  for (const st of cseStudents) {
    for (const cls of cseClasses) {
      relationalDb.insert('class_enrollments', {
        id: `enr_${st.id}_${cls.id}`,
        class_id: cls.id,
        student_id: st.id,
        enrolled_date: '2024-08-01'
      });
    }
  }

  for (const st of itStudents) {
    for (const cls of itClasses) {
      relationalDb.insert('class_enrollments', {
        id: `enr_${st.id}_${cls.id}`,
        class_id: cls.id,
        student_id: st.id,
        enrolled_date: '2024-08-01'
      });
    }
  }

  // 9. Generate Historical Attendance Sessions & Records
  // Generate attendance sessions for the past 14 instructional days
  const today = new Date();
  const pastDays = [];

  for (let d = 18; d >= 1; d--) {
    const past = new Date(today);
    past.setDate(today.getDate() - d);
    const dayOfWeek = past.getDay();
    // Exclude Sundays (0) and Saturdays (6)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const yyyy = past.getFullYear();
      const mm = String(past.getMonth() + 1).padStart(2, '0');
      const dd = String(past.getDate()).padStart(2, '0');
      pastDays.push(`${yyyy}-${mm}-${dd}`);
    }
  }

  // For each class, pick applicable days and record attendance
  let sessionCounter = 1;
  let recordCounter = 1;

  for (const cls of classes) {
    const enrolledForClass = relationalDb.select('class_enrollments', e => e.class_id === cls.id);
    const enrolledStudentIds = enrolledForClass.map(e => e.student_id);

    // Pick 10 sessions for each class
    const classDays = pastDays.slice(0, 10);

    for (const dateStr of classDays) {
      const sessionId = `sess_${sessionCounter++}`;
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;

      const stagedRecords = [];

      enrolledStudentIds.forEach((stId, idx) => {
        // Vary attendance rate per student:
        // Student 1 (Alex Johnson): High ~90%
        // Student 2 (Priya Sharma): High ~95%
        // Student 7 (Rohan Verma): Low ~60% (will test low attendance warnings!)
        // Student 12 (James Wilson): Low ~68%
        // Others normal: 80%
        let status = 'Present';
        const rand = (Math.sin(idx * 7 + sessionCounter * 13) + 1) / 2; // deterministic pseudo-random

        if (stId === 'st_7' || stId === 'st_12') {
          // Low attendance students
          if (rand > 0.55) status = 'Absent';
          else if (rand > 0.40) status = 'Late';
          else status = 'Present';
        } else if (stId === 'st_1' || stId === 'st_2') {
          // High attendance
          if (rand > 0.93) status = 'Late';
          else status = 'Present';
        } else {
          // General distribution
          if (rand > 0.88) status = 'Absent';
          else if (rand > 0.80) status = 'Late';
          else status = 'Present';
        }

        if (status === 'Present') presentCount++;
        else if (status === 'Absent') absentCount++;
        else if (status === 'Late') lateCount++;

        stagedRecords.push({
          id: `rec_${recordCounter++}`,
          session_id: sessionId,
          class_id: cls.id,
          student_id: stId,
          subject_id: cls.course_id,
          date: dateStr,
          status,
          remarks: status === 'Absent' ? 'Medical / Leave' : (status === 'Late' ? 'Transit delay' : ''),
          marked_by: cls.faculty_id === 'fac_1' ? 'usr_fac_1' : 'usr_fac_2',
          updated_at: new Date().toISOString()
        });
      });

      // Insert session
      relationalDb.insert('attendance_sessions', {
        id: sessionId,
        class_id: cls.id,
        faculty_id: cls.faculty_id,
        subject_id: cls.course_id,
        date: dateStr,
        session_time: cls.schedule_time.split(' ')[cls.schedule_time.split(' ').length - 2] || '09:00 AM',
        total_students: enrolledStudentIds.length,
        present_count: presentCount,
        absent_count: absentCount,
        late_count: lateCount,
        status: 'Completed',
        created_at: `${dateStr}T10:00:00.000Z`
      });

      // Insert records
      for (const rec of stagedRecords) {
        relationalDb.insert('attendance_records', rec);
      }
    }
  }

  // 10. Seed NoSQL Activity Logs, Events & Notifications
  nosqlDb.insertOne('activity_logs', {
    userId: 'usr_admin_1',
    userRole: 'admin',
    action: 'SYSTEM_INITIALIZATION',
    module: 'System',
    details: { message: 'Smart Attendance System database schema deployed and initialized with academic seed dataset.' },
    status: 'SUCCESS',
    timestamp: new Date().toISOString()
  });

  nosqlDb.insertOne('activity_logs', {
    userId: 'usr_fac_1',
    userRole: 'faculty',
    action: 'MARK_ATTENDANCE',
    module: 'Attendance',
    details: { classId: 'cls_cse_dbms', date: pastDays[0], totalMarked: 15 },
    status: 'SUCCESS',
    timestamp: new Date().toISOString()
  });

  // Seed Low Attendance Warning for Rohan Verma (st_7)
  nosqlDb.insertOne('notifications', {
    recipientId: 'st_7',
    recipientRole: 'student',
    title: 'Urgent: Low Attendance Warning',
    message: 'Your overall attendance has fallen to 60.0%, which is below the mandatory 75% threshold. Please meet your Academic Counselor immediately.',
    type: 'low_attendance',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  // Seed notification for Alex Johnson (st_1)
  nosqlDb.insertOne('notifications', {
    recipientId: 'st_1',
    recipientRole: 'student',
    title: 'Attendance Update',
    message: 'Attendance for Database Management Systems on ' + pastDays[0] + ' was recorded successfully.',
    type: 'attendance_submitted',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  // Welcome announcement
  nosqlDb.insertOne('notifications', {
    recipientId: 'all',
    recipientRole: 'all',
    title: 'Welcome to Apex Smart Attendance Portal',
    message: 'The new attendance system is active. Faculty members may submit attendance directly from the portal.',
    type: 'announcement',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  });

  // 11. Sync Graph Database nodes and relationships
  graphDb.syncFromRelational();

  console.log(`Database seeded successfully!`);
  console.log(`Relational: ${relationalDb.select('students').length} students, ${relationalDb.select('faculty').length} faculty, ${relationalDb.select('attendance_records').length} attendance records.`);
  console.log(`Graph: ${graphDb.nodes.length} nodes, ${graphDb.edges.length} relationships.`);
  console.log(`NoSQL: ${nosqlDb.find('activity_logs').length} logs, ${nosqlDb.find('notifications').length} notifications.`);
}
