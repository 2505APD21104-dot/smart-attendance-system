import { relationalDb } from './relational.js';

class GraphDatabase {
  constructor() {
    this.nodes = [];
    this.edges = [];
  }

  // Synchronizes graph nodes and relationships directly from the relational database state
  syncFromRelational() {
    const departments = relationalDb.select('departments');
    const users = relationalDb.select('users');
    const facultyList = relationalDb.select('faculty');
    const studentList = relationalDb.select('students');
    const courses = relationalDb.select('courses');
    const classes = relationalDb.select('classes');
    const enrollments = relationalDb.select('class_enrollments');

    const nodes = [];
    const edges = [];

    // 1. Department Nodes
    departments.forEach(dept => {
      nodes.push({
        id: `dept_${dept.id}`,
        label: 'Department',
        properties: {
          id: dept.id,
          code: dept.code,
          name: dept.name
        },
        displayName: `${dept.code} - ${dept.name}`,
        group: 'department'
      });
    });

    // 2. Course Nodes
    courses.forEach(c => {
      nodes.push({
        id: `course_${c.id}`,
        label: 'Course',
        properties: {
          id: c.id,
          code: c.code,
          name: c.name,
          credits: c.credits,
          semester: c.semester
        },
        displayName: `${c.code} (${c.name})`,
        group: 'course'
      });

      // Edge: Department OFFERS Course
      edges.push({
        id: `e_dept_course_${c.id}`,
        source: `dept_${c.department_id}`,
        target: `course_${c.id}`,
        type: 'OFFERS',
        properties: { since: '2020' }
      });
    });

    // 3. Faculty Nodes
    facultyList.forEach(fac => {
      const u = users.find(usr => usr.id === fac.user_id) || {};
      const fullName = `${u.first_name || 'Prof.'} ${u.last_name || 'Faculty'}`;
      nodes.push({
        id: `fac_${fac.id}`,
        label: 'Faculty',
        properties: {
          id: fac.id,
          userId: fac.user_id,
          employeeId: fac.employee_id,
          name: fullName,
          designation: fac.designation,
          qualification: fac.qualification
        },
        displayName: fullName,
        group: 'faculty'
      });

      // Edge: Faculty BELONGS_TO Department
      edges.push({
        id: `e_fac_dept_${fac.id}`,
        source: `fac_${fac.id}`,
        target: `dept_${fac.department_id}`,
        type: 'BELONGS_TO',
        properties: { role: fac.designation }
      });
    });

    // 4. Class Nodes
    classes.forEach(cls => {
      nodes.push({
        id: `class_${cls.id}`,
        label: 'Class',
        properties: {
          id: cls.id,
          name: cls.name,
          semester: cls.semester,
          section: cls.section,
          schedule: cls.schedule_time,
          room: cls.room_no
        },
        displayName: `${cls.name} (${cls.room_no || 'TBA'})`,
        group: 'class'
      });

      // Edge: Faculty TEACHES Class
      edges.push({
        id: `e_fac_class_${cls.id}`,
        source: `fac_${cls.faculty_id}`,
        target: `class_${cls.id}`,
        type: 'TEACHES',
        properties: { schedule: cls.schedule_time }
      });

      // Edge: Class SCHEDULED_FOR Course
      edges.push({
        id: `e_class_course_${cls.id}`,
        source: `class_${cls.id}`,
        target: `course_${cls.course_id}`,
        type: 'SCHEDULED_FOR',
        properties: { semester: cls.semester }
      });
    });

    // 5. Student Nodes & Enrollments
    studentList.forEach(st => {
      const u = users.find(usr => usr.id === st.user_id) || {};
      const fullName = `${u.first_name || 'Student'} ${u.last_name || ''}`.trim();
      nodes.push({
        id: `student_${st.id}`,
        label: 'Student',
        properties: {
          id: st.id,
          userId: st.user_id,
          rollNumber: st.roll_number,
          registrationNo: st.registration_no,
          name: fullName,
          semester: st.semester,
          section: st.section
        },
        displayName: `${fullName} (${st.roll_number})`,
        group: 'student'
      });

      // Edge: Student BELONGS_TO Department
      edges.push({
        id: `e_student_dept_${st.id}`,
        source: `student_${st.id}`,
        target: `dept_${st.department_id}`,
        type: 'BELONGS_TO',
        properties: { batch: st.batch_year }
      });
    });

    // Edge: Student ENROLLED_IN Class
    enrollments.forEach(enr => {
      edges.push({
        id: `e_enr_${enr.id}`,
        source: `student_${enr.student_id}`,
        target: `class_${enr.class_id}`,
        type: 'ENROLLED_IN',
        properties: { enrolledDate: enr.enrolled_date }
      });
    });

    this.nodes = nodes;
    this.edges = edges;

    return {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      nodeTypes: ['Department', 'Faculty', 'Student', 'Course', 'Class'],
      relationshipTypes: ['BELONGS_TO', 'OFFERS', 'TEACHES', 'SCHEDULED_FOR', 'ENROLLED_IN']
    };
  }

  getGraphData(limit = 100) {
    if (this.nodes.length === 0) {
      this.syncFromRelational();
    }
    return {
      nodes: this.nodes.slice(0, limit),
      edges: this.edges.slice(0, limit * 2),
      totalNodes: this.nodes.length,
      totalEdges: this.edges.length,
      summary: {
        departments: this.nodes.filter(n => n.label === 'Department').length,
        faculty: this.nodes.filter(n => n.label === 'Faculty').length,
        students: this.nodes.filter(n => n.label === 'Student').length,
        courses: this.nodes.filter(n => n.label === 'Course').length,
        classes: this.nodes.filter(n => n.label === 'Class').length,
        relationships: this.edges.length
      }
    };
  }

  // Traverses neighbors of a specific node
  getNodeNeighbors(nodeId) {
    if (this.nodes.length === 0) this.syncFromRelational();
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return null;

    const outgoing = this.edges.filter(e => e.source === nodeId);
    const incoming = this.edges.filter(e => e.target === nodeId);

    const relatedNodeIds = new Set([
      ...outgoing.map(e => e.target),
      ...incoming.map(e => e.source)
    ]);

    const neighbors = this.nodes.filter(n => relatedNodeIds.has(n.id));

    return {
      targetNode: node,
      degree: outgoing.length + incoming.length,
      inDegree: incoming.length,
      outDegree: outgoing.length,
      relationships: [...outgoing, ...incoming],
      neighbors
    };
  }

  // Cypher Query Simulator for evaluation & educational insight
  executeCypher(query) {
    if (this.nodes.length === 0) this.syncFromRelational();
    const cleanQuery = query.trim();

    // Query 1: MATCH (f:Faculty)-[:TEACHES]->(c:Class)
    if (/MATCH\s*\(f:Faculty\)-.*[:TEACHES].*->\(c:Class\)/i.test(cleanQuery)) {
      const matchEdges = this.edges.filter(e => e.type === 'TEACHES');
      const results = matchEdges.map(e => {
        const f = this.nodes.find(n => n.id === e.source);
        const c = this.nodes.find(n => n.id === e.target);
        return {
          faculty: f?.properties?.name,
          facultyEmployeeId: f?.properties?.employeeId,
          className: c?.properties?.name,
          room: c?.properties?.room,
          schedule: c?.properties?.schedule
        };
      });
      return {
        query: cleanQuery,
        executionTimeMs: 1.4,
        rowsMatched: results.length,
        data: results
      };
    }

    // Query 2: MATCH (s:Student)-[:ENROLLED_IN]->(c:Class)
    if (/MATCH\s*\(s:Student\)-.*[:ENROLLED_IN].*->\(c:Class\)/i.test(cleanQuery)) {
      const matchEdges = this.edges.filter(e => e.type === 'ENROLLED_IN').slice(0, 50);
      const results = matchEdges.map(e => {
        const s = this.nodes.find(n => n.id === e.source);
        const c = this.nodes.find(n => n.id === e.target);
        return {
          student: s?.properties?.name,
          rollNumber: s?.properties?.rollNumber,
          className: c?.properties?.name
        };
      });
      return {
        query: cleanQuery,
        executionTimeMs: 2.1,
        rowsMatched: results.length,
        data: results
      };
    }

    // Query 3: MATCH (d:Department)-[:OFFERS]->(c:Course)
    if (/MATCH\s*\(d:Department\)-.*[:OFFERS].*->\(c:Course\)/i.test(cleanQuery)) {
      const matchEdges = this.edges.filter(e => e.type === 'OFFERS');
      const results = matchEdges.map(e => {
        const d = this.nodes.find(n => n.id === e.source);
        const c = this.nodes.find(n => n.id === e.target);
        return {
          department: d?.properties?.name,
          deptCode: d?.properties?.code,
          courseCode: c?.properties?.code,
          courseName: c?.properties?.name,
          credits: c?.properties?.credits
        };
      });
      return {
        query: cleanQuery,
        executionTimeMs: 1.1,
        rowsMatched: results.length,
        data: results
      };
    }

    // Default general search across nodes
    const words = cleanQuery.replace(/[(),:-><]/g, ' ').split(/\s+/).filter(w => w.length > 2);
    const matchedNodes = this.nodes.filter(n =>
      words.some(w =>
        n.label.toLowerCase().includes(w.toLowerCase()) ||
        n.displayName.toLowerCase().includes(w.toLowerCase())
      )
    ).slice(0, 30);

    return {
      query: cleanQuery,
      executionTimeMs: 3.2,
      rowsMatched: matchedNodes.length,
      data: matchedNodes.map(n => ({
        id: n.id,
        label: n.label,
        displayName: n.displayName,
        properties: n.properties
      }))
    };
  }
}

export const graphDb = new GraphDatabase();
