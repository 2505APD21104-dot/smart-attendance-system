import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, '../../data/relational_db.json');

// Table Schema Definitions with Constraints & Foreign Keys
export const RELATIONAL_SCHEMA = {
  departments: {
    primaryKey: 'id',
    uniqueKeys: [['code']],
    foreignKeys: [],
    columns: ['id', 'code', 'name', 'description', 'created_at']
  },
  users: {
    primaryKey: 'id',
    uniqueKeys: [['email'], ['username']],
    foreignKeys: [],
    columns: ['id', 'username', 'email', 'password_hash', 'role', 'first_name', 'last_name', 'avatar', 'created_at']
  },
  faculty: {
    primaryKey: 'id',
    uniqueKeys: [['user_id'], ['employee_id']],
    foreignKeys: [
      { column: 'user_id', refTable: 'users', refColumn: 'id' },
      { column: 'department_id', refTable: 'departments', refColumn: 'id' }
    ],
    columns: ['id', 'user_id', 'employee_id', 'department_id', 'qualification', 'designation', 'joining_date']
  },
  students: {
    primaryKey: 'id',
    uniqueKeys: [['user_id'], ['roll_number'], ['registration_no']],
    foreignKeys: [
      { column: 'user_id', refTable: 'users', refColumn: 'id' },
      { column: 'department_id', refTable: 'departments', refColumn: 'id' }
    ],
    columns: ['id', 'user_id', 'roll_number', 'registration_no', 'department_id', 'semester', 'section', 'batch_year']
  },
  courses: {
    primaryKey: 'id',
    uniqueKeys: [['code']],
    foreignKeys: [
      { column: 'department_id', refTable: 'departments', refColumn: 'id' }
    ],
    columns: ['id', 'code', 'name', 'department_id', 'credits', 'semester', 'type']
  },
  classes: {
    primaryKey: 'id',
    uniqueKeys: [],
    foreignKeys: [
      { column: 'course_id', refTable: 'courses', refColumn: 'id' },
      { column: 'department_id', refTable: 'departments', refColumn: 'id' },
      { column: 'faculty_id', refTable: 'faculty', refColumn: 'id' }
    ],
    columns: ['id', 'name', 'course_id', 'department_id', 'faculty_id', 'semester', 'section', 'academic_year', 'schedule_time', 'room_no']
  },
  class_enrollments: {
    primaryKey: 'id',
    uniqueKeys: [['class_id', 'student_id']],
    foreignKeys: [
      { column: 'class_id', refTable: 'classes', refColumn: 'id' },
      { column: 'student_id', refTable: 'students', refColumn: 'id' }
    ],
    columns: ['id', 'class_id', 'student_id', 'enrolled_date']
  },
  attendance_sessions: {
    primaryKey: 'id',
    uniqueKeys: [['class_id', 'subject_id', 'date']],
    foreignKeys: [
      { column: 'class_id', refTable: 'classes', refColumn: 'id' },
      { column: 'faculty_id', refTable: 'faculty', refColumn: 'id' },
      { column: 'subject_id', refTable: 'courses', refColumn: 'id' }
    ],
    columns: ['id', 'class_id', 'faculty_id', 'subject_id', 'date', 'session_time', 'total_students', 'present_count', 'absent_count', 'late_count', 'status', 'created_at']
  },
  attendance_records: {
    primaryKey: 'id',
    // Strict composite unique constraint: student cannot have more than 1 attendance record for the same class, subject, and date
    uniqueKeys: [['student_id', 'class_id', 'subject_id', 'date']],
    foreignKeys: [
      { column: 'session_id', refTable: 'attendance_sessions', refColumn: 'id' },
      { column: 'class_id', refTable: 'classes', refColumn: 'id' },
      { column: 'student_id', refTable: 'students', refColumn: 'id' },
      { column: 'subject_id', refTable: 'courses', refColumn: 'id' }
    ],
    columns: ['id', 'session_id', 'class_id', 'student_id', 'subject_id', 'date', 'status', 'remarks', 'marked_by', 'updated_at']
  },
  system_settings: {
    primaryKey: 'id',
    uniqueKeys: [['key']],
    foreignKeys: [],
    columns: ['id', 'key', 'value', 'description', 'updated_at']
  }
};

class RelationalDatabase {
  constructor() {
    this.tables = {};
    this.activeTransactions = new Map();
    this.init();
  }

  init() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.tables = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading relational DB file, initializing fresh:', err);
        this.resetTables();
      }
    } else {
      this.resetTables();
    }
  }

  resetTables() {
    this.tables = {};
    for (const tableName of Object.keys(RELATIONAL_SCHEMA)) {
      this.tables[tableName] = [];
    }
    this.persist();
  }

  persist() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.tables, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write relational DB file:', err);
    }
  }

  getTableData(tableName, txId = null) {
    if (txId && this.activeTransactions.has(txId)) {
      const tx = this.activeTransactions.get(txId);
      return tx.stagedTables[tableName] || this.tables[tableName] || [];
    }
    return this.tables[tableName] || [];
  }

  select(tableName, filterFn = null, txId = null) {
    const data = this.getTableData(tableName, txId);
    if (!filterFn) return [...data];
    return data.filter(filterFn);
  }

  findById(tableName, id, txId = null) {
    const data = this.getTableData(tableName, txId);
    return data.find(row => row.id === id) || null;
  }

  findOne(tableName, filterFn, txId = null) {
    const data = this.getTableData(tableName, txId);
    return data.find(filterFn) || null;
  }

  // Transaction Management
  beginTransaction() {
    const txId = 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    // Deep clone current tables snapshot
    const stagedTables = JSON.parse(JSON.stringify(this.tables));
    this.activeTransactions.set(txId, {
      id: txId,
      stagedTables,
      startTime: Date.now(),
      status: 'ACTIVE',
      operations: []
    });
    return txId;
  }

  commitTransaction(txId) {
    if (!this.activeTransactions.has(txId)) {
      throw new Error(`Transaction ${txId} does not exist or has already completed.`);
    }
    const tx = this.activeTransactions.get(txId);
    
    // Final integrity checks across all tables
    for (const [tableName, schema] of Object.entries(RELATIONAL_SCHEMA)) {
      const rows = tx.stagedTables[tableName] || [];
      
      // Check Primary Key Uniqueness
      const pkSet = new Set();
      for (const row of rows) {
        if (!row.id) {
          throw new Error(`Integrity Error: Missing Primary Key in ${tableName}`);
        }
        if (pkSet.has(row.id)) {
          throw new Error(`Integrity Error: Duplicate Primary Key '${row.id}' in table '${tableName}'`);
        }
        pkSet.add(row.id);
      }

      // Check Composite Unique Constraints
      for (const uniqueFields of schema.uniqueKeys) {
        const uniqueSet = new Set();
        for (const row of rows) {
          const keyVal = uniqueFields.map(f => row[f]).join(':::');
          if (uniqueSet.has(keyVal)) {
            throw new Error(`Unique Constraint Violation in table '${tableName}' on columns [${uniqueFields.join(', ')}]: value (${uniqueFields.map(f => row[f]).join(', ')}) already exists`);
          }
          uniqueSet.add(keyVal);
        }
      }

      // Check Foreign Key constraints
      for (const fk of schema.foreignKeys) {
        const refRows = tx.stagedTables[fk.refTable] || [];
        for (const row of rows) {
          const val = row[fk.column];
          if (val !== undefined && val !== null) {
            const exists = refRows.some(ref => ref[fk.refColumn] === val);
            if (!exists) {
              throw new Error(`Foreign Key Constraint Violation: table '${tableName}' column '${fk.column}' value '${val}' does not reference a valid record in '${fk.refTable}.${fk.refColumn}'`);
            }
          }
        }
      }
    }

    // Atomically commit staged tables to active database
    this.tables = tx.stagedTables;
    this.persist();
    this.activeTransactions.delete(txId);

    return {
      success: true,
      transactionId: txId,
      operationsCount: tx.operations.length
    };
  }

  rollbackTransaction(txId) {
    if (!this.activeTransactions.has(txId)) {
      return { success: false, message: `Transaction ${txId} not found` };
    }
    this.activeTransactions.delete(txId);
    return {
      success: true,
      transactionId: txId,
      message: 'Transaction rolled back successfully. No changes were committed.'
    };
  }

  // Relational Insert with immediate validation
  insert(tableName, row, txId = null) {
    const schema = RELATIONAL_SCHEMA[tableName];
    if (!schema) throw new Error(`Table ${tableName} does not exist in schema.`);

    const targetTables = txId && this.activeTransactions.has(txId)
      ? this.activeTransactions.get(txId).stagedTables
      : this.tables;

    const rows = targetTables[tableName];

    // Check PK
    if (!row.id) {
      row.id = tableName.substring(0, 3) + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    }
    if (rows.some(r => r.id === row.id)) {
      throw new Error(`Duplicate Primary Key error: row with id ${row.id} already exists in ${tableName}`);
    }

    // Check Unique Keys
    for (const uniqueFields of schema.uniqueKeys) {
      const match = rows.find(r => uniqueFields.every(f => r[f] === row[f]));
      if (match) {
        throw new Error(`Duplicate record prevented! A record with [${uniqueFields.join(', ')}] = [${uniqueFields.map(f => row[f]).join(', ')}] already exists in ${tableName}`);
      }
    }

    // Check Foreign Keys
    for (const fk of schema.foreignKeys) {
      const val = row[fk.column];
      if (val !== undefined && val !== null) {
        const refRows = targetTables[fk.refTable] || [];
        const exists = refRows.some(ref => ref[fk.refColumn] === val);
        if (!exists) {
          throw new Error(`Foreign Key Error: ${tableName}.${fk.column} referencing ${fk.refTable}.${fk.refColumn} with value '${val}' not found`);
        }
      }
    }

    rows.push(row);

    if (txId && this.activeTransactions.has(txId)) {
      this.activeTransactions.get(txId).operations.push({ type: 'INSERT', table: tableName, id: row.id });
    } else {
      this.persist();
    }

    return row;
  }

  update(tableName, id, updates, txId = null) {
    const targetTables = txId && this.activeTransactions.has(txId)
      ? this.activeTransactions.get(txId).stagedTables
      : this.tables;

    const rows = targetTables[tableName];
    const index = rows.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Record with id ${id} not found in ${tableName}`);
    }

    const updatedRow = { ...rows[index], ...updates };

    // Check Unique Keys against other rows
    const schema = RELATIONAL_SCHEMA[tableName];
    for (const uniqueFields of schema.uniqueKeys) {
      const match = rows.find((r, i) => i !== index && uniqueFields.every(f => r[f] === updatedRow[f]));
      if (match) {
        throw new Error(`Update violation: unique constraint failed on [${uniqueFields.join(', ')}] for ${tableName}`);
      }
    }

    rows[index] = updatedRow;

    if (txId && this.activeTransactions.has(txId)) {
      this.activeTransactions.get(txId).operations.push({ type: 'UPDATE', table: tableName, id });
    } else {
      this.persist();
    }

    return updatedRow;
  }

  delete(tableName, id, txId = null) {
    const targetTables = txId && this.activeTransactions.has(txId)
      ? this.activeTransactions.get(txId).stagedTables
      : this.tables;

    // Check for foreign key references pointing to this id before deleting
    for (const [otherTable, schema] of Object.entries(RELATIONAL_SCHEMA)) {
      for (const fk of schema.foreignKeys) {
        if (fk.refTable === tableName && fk.refColumn === 'id') {
          const dependentRows = (targetTables[otherTable] || []).filter(r => r[fk.column] === id);
          if (dependentRows.length > 0) {
            throw new Error(`Cannot delete from '${tableName}' because it is referenced by ${dependentRows.length} record(s) in '${otherTable}.${fk.column}'`);
          }
        }
      }
    }

    const rows = targetTables[tableName];
    const index = rows.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Record with id ${id} not found in ${tableName}`);
    }

    const deleted = rows.splice(index, 1)[0];

    if (txId && this.activeTransactions.has(txId)) {
      this.activeTransactions.get(txId).operations.push({ type: 'DELETE', table: tableName, id });
    } else {
      this.persist();
    }

    return deleted;
  }

  // Generates equivalent PostgreSQL / MySQL DDL SQL schema
  generateSqlDdl() {
    let sql = `-- ==========================================================\n`;
    sql += `-- Smart Attendance Management System - Relational DDL Schema\n`;
    sql += `-- Compatible with PostgreSQL 14+ / MySQL 8.0+\n`;
    sql += `-- Generated on ${new Date().toISOString()}\n`;
    sql += `-- ==========================================================\n\n`;

    sql += `CREATE TABLE IF NOT EXISTS departments (\n`;
    sql += `  id VARCHAR(64) PRIMARY KEY,\n`;
    sql += `  code VARCHAR(20) NOT NULL UNIQUE,\n`;
    sql += `  name VARCHAR(150) NOT NULL,\n`;
    sql += `  description TEXT,\n`;
    sql += `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
    sql += `);\n\n`;

    sql += `CREATE TABLE IF NOT EXISTS users (\n`;
    sql += `  id VARCHAR(64) PRIMARY KEY,\n`;
    sql += `  username VARCHAR(64) NOT NULL UNIQUE,\n`;
    sql += `  email VARCHAR(120) NOT NULL UNIQUE,\n`;
    sql += `  password_hash VARCHAR(255) NOT NULL,\n`;
    sql += `  role VARCHAR(30) NOT NULL CHECK (role IN ('admin', 'faculty', 'student')),\n`;
    sql += `  first_name VARCHAR(100) NOT NULL,\n`;
    sql += `  last_name VARCHAR(100) NOT NULL,\n`;
    sql += `  avatar VARCHAR(255),\n`;
    sql += `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
    sql += `);\n\n`;

    sql += `CREATE TABLE IF NOT EXISTS faculty (\n`;
    sql += `  id VARCHAR(64) PRIMARY KEY,\n`;
    sql += `  user_id VARCHAR(64) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,\n`;
    sql += `  employee_id VARCHAR(50) NOT NULL UNIQUE,\n`;
    sql += `  department_id VARCHAR(64) NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,\n`;
    sql += `  qualification VARCHAR(100),\n`;
    sql += `  designation VARCHAR(100),\n`;
    sql += `  joining_date DATE\n`;
    sql += `);\n\n`;

    sql += `CREATE TABLE IF NOT EXISTS students (\n`;
    sql += `  id VARCHAR(64) PRIMARY KEY,\n`;
    sql += `  user_id VARCHAR(64) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,\n`;
    sql += `  roll_number VARCHAR(50) NOT NULL UNIQUE,\n`;
    sql += `  registration_no VARCHAR(50) NOT NULL UNIQUE,\n`;
    sql += `  department_id VARCHAR(64) NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,\n`;
    sql += `  semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),\n`;
    sql += `  section VARCHAR(10) NOT NULL,\n`;
    sql += `  batch_year VARCHAR(20) NOT NULL\n`;
    sql += `);\n\n`;

    sql += `CREATE TABLE IF NOT EXISTS courses (\n`;
    sql += `  id VARCHAR(64) PRIMARY KEY,\n`;
    sql += `  code VARCHAR(30) NOT NULL UNIQUE,\n`;
    sql += `  name VARCHAR(150) NOT NULL,\n`;
    sql += `  department_id VARCHAR(64) NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,\n`;
    sql += `  credits INT NOT NULL DEFAULT 3,\n`;
    sql += `  semester INT NOT NULL,\n`;
    sql += `  type VARCHAR(30) DEFAULT 'Theory'\n`;
    sql += `);\n\n`;

    sql += `CREATE TABLE IF NOT EXISTS classes (\n`;
    sql += `  id VARCHAR(64) PRIMARY KEY,\n`;
    sql += `  name VARCHAR(100) NOT NULL,\n`;
    sql += `  course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,\n`;
    sql += `  department_id VARCHAR(64) NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,\n`;
    sql += `  faculty_id VARCHAR(64) NOT NULL REFERENCES faculty(id) ON DELETE RESTRICT,\n`;
    sql += `  semester INT NOT NULL,\n`;
    sql += `  section VARCHAR(10) NOT NULL,\n`;
    sql += `  academic_year VARCHAR(20) NOT NULL,\n`;
    sql += `  schedule_time VARCHAR(100),\n`;
    sql += `  room_no VARCHAR(50)\n`;
    sql += `);\n\n`;

    sql += `CREATE TABLE IF NOT EXISTS class_enrollments (\n`;
    sql += `  id VARCHAR(64) PRIMARY KEY,\n`;
    sql += `  class_id VARCHAR(64) NOT NULL REFERENCES classes(id) ON DELETE CASCADE,\n`;
    sql += `  student_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,\n`;
    sql += `  enrolled_date DATE DEFAULT CURRENT_DATE,\n`;
    sql += `  CONSTRAINT uq_class_student UNIQUE (class_id, student_id)\n`;
    sql += `);\n\n`;

    sql += `CREATE TABLE IF NOT EXISTS attendance_sessions (\n`;
    sql += `  id VARCHAR(64) PRIMARY KEY,\n`;
    sql += `  class_id VARCHAR(64) NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,\n`;
    sql += `  faculty_id VARCHAR(64) NOT NULL REFERENCES faculty(id) ON DELETE RESTRICT,\n`;
    sql += `  subject_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,\n`;
    sql += `  date DATE NOT NULL,\n`;
    sql += `  session_time VARCHAR(50),\n`;
    sql += `  total_students INT NOT NULL DEFAULT 0,\n`;
    sql += `  present_count INT NOT NULL DEFAULT 0,\n`;
    sql += `  absent_count INT NOT NULL DEFAULT 0,\n`;
    sql += `  late_count INT NOT NULL DEFAULT 0,\n`;
    sql += `  status VARCHAR(30) DEFAULT 'Completed',\n`;
    sql += `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n`;
    sql += `  CONSTRAINT uq_session_class_sub_date UNIQUE (class_id, subject_id, date)\n`;
    sql += `);\n\n`;

    sql += `CREATE TABLE IF NOT EXISTS attendance_records (\n`;
    sql += `  id VARCHAR(64) PRIMARY KEY,\n`;
    sql += `  session_id VARCHAR(64) NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,\n`;
    sql += `  class_id VARCHAR(64) NOT NULL REFERENCES classes(id) ON DELETE CASCADE,\n`;
    sql += `  student_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,\n`;
    sql += `  subject_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,\n`;
    sql += `  date DATE NOT NULL,\n`;
    sql += `  status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late')),\n`;
    sql += `  remarks VARCHAR(255),\n`;
    sql += `  marked_by VARCHAR(64) REFERENCES users(id),\n`;
    sql += `  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n`;
    sql += `  CONSTRAINT uq_attendance_student_session UNIQUE (student_id, class_id, subject_id, date)\n`;
    sql += `);\n\n`;

    sql += `-- Indexes for High Performance Attendance Analytics\n`;
    sql += `CREATE INDEX idx_attendance_records_lookup ON attendance_records (student_id, date, status);\n`;
    sql += `CREATE INDEX idx_attendance_records_class ON attendance_records (class_id, date);\n`;
    sql += `CREATE INDEX idx_students_roll ON students (roll_number);\n`;
    sql += `CREATE INDEX idx_classes_faculty ON classes (faculty_id);\n\n`;

    return sql;
  }
}

export const relationalDb = new RelationalDatabase();
