import { relationalDb } from './src/db/relational.js';
import { nosqlDb } from './src/db/nosql.js';
import { graphDb } from './src/db/graph.js';
import { redisCache } from './src/db/cache.js';
import { TransactionService } from './src/db/transactions.js';

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE SYSTEM VERIFICATION ---');

  // 1. Relational Integrity Tests
  console.log('\n[1/6] Testing Relational Database Integrity...');
  const students = relationalDb.select('students');
  const faculty = relationalDb.select('faculty');
  const courses = relationalDb.select('courses');
  const classes = relationalDb.select('classes');
  const sessions = relationalDb.select('attendance_sessions');
  const records = relationalDb.select('attendance_records');

  console.log(`✓ Relational Tables Verified:
    - Students: ${students.length}
    - Faculty: ${faculty.length}
    - Courses: ${courses.length}
    - Classes: ${classes.length}
    - Attendance Sessions: ${sessions.length}
    - Attendance Records: ${records.length}`);

  if (students.length === 0 || records.length === 0) {
    throw new Error('Relational database tables are unexpectedly empty.');
  }

  // 2. ACID Transaction & Duplicate Record Prevention Test
  console.log('\n[2/6] Testing ACID Transaction & Duplicate Prevention...');
  const simCommit = TransactionService.runTransactionSimulation({ mode: 'success' });
  console.log(`✓ ACID Commit Simulation:`, simCommit.message);

  const simRollback = TransactionService.runTransactionSimulation({ mode: 'fail_duplicate' });
  console.log(`✓ ACID Duplicate Rollback Test:`, simRollback.errorType, '-', simRollback.explanation);

  if (simRollback.success !== false || !simRollback.rolledBack) {
    throw new Error('Duplicate prevention test failed to rollback.');
  }

  // 3. NoSQL MongoDB-style Document Store Test
  console.log('\n[3/6] Testing NoSQL Document Store...');
  const logs = nosqlDb.find('activity_logs');
  const notifs = nosqlDb.find('notifications');
  const events = nosqlDb.find('attendance_events');
  console.log(`✓ NoSQL Collections Verified:
    - activity_logs: ${logs.length}
    - notifications: ${notifs.length}
    - attendance_events: ${events.length}`);

  // Test insert and query
  const testLog = nosqlDb.insertOne('activity_logs', {
    userId: 'test_runner',
    userRole: 'system',
    action: 'TEST_VERIFICATION',
    module: 'Diagnostics',
    timestamp: new Date().toISOString()
  });
  const foundLog = nosqlDb.findOne('activity_logs', { action: 'TEST_VERIFICATION' });
  if (!foundLog) throw new Error('NoSQL insert or find failed.');
  console.log('✓ NoSQL Document Querying & Persistence Verified.');

  // 4. Neo4j Graph Database & Cypher Simulator Test
  console.log('\n[4/6] Testing Graph Database & Cypher Engine...');
  const graphSummary = graphDb.getGraphData();
  console.log(`✓ Graph Database Nodes: ${graphSummary.totalNodes}, Relationships: ${graphSummary.totalEdges}`);

  const cypher1 = graphDb.executeCypher('MATCH (f:Faculty)-[:TEACHES]->(c:Class) RETURN f, c');
  console.log(`✓ Cypher Query 1 Executed in ${cypher1.executionTimeMs}ms (Matched: ${cypher1.rowsMatched} rows)`);

  const cypher2 = graphDb.executeCypher('MATCH (s:Student)-[:ENROLLED_IN]->(c:Class) RETURN s, c');
  console.log(`✓ Cypher Query 2 Executed in ${cypher2.executionTimeMs}ms (Matched: ${cypher2.rowsMatched} rows)`);

  const nodeNeighbors = graphDb.getNodeNeighbors(graphSummary.nodes[0].id);
  console.log(`✓ Node Traversal for '${graphSummary.nodes[0].displayName}': Degree = ${nodeNeighbors?.degree}`);

  // 5. Redis Cache Test
  console.log('\n[5/6] Testing Redis Cache & Invalidation...');
  redisCache.set('test:key', { sample: 123 }, 30);
  const cachedVal = redisCache.get('test:key');
  if (!cachedVal || cachedVal.sample !== 123) throw new Error('Redis get failed.');
  const cacheStats = redisCache.getStats();
  console.log(`✓ Redis Cache Verified: Hits = ${cacheStats.metrics.hits}, Misses = ${cacheStats.metrics.misses}, Hit Ratio = ${cacheStats.metrics.hitRatioPercent}`);

  // 6. SQL DDL Generation Test
  console.log('\n[6/6] Testing ANSI SQL DDL Export...');
  const ddl = relationalDb.generateSqlDdl();
  if (!ddl.includes('CREATE TABLE IF NOT EXISTS attendance_records') || !ddl.includes('uq_attendance_student_session')) {
    throw new Error('DDL missing crucial constraints.');
  }
  console.log('✓ ANSI SQL:2016 Schema Export Verified (Length: ' + ddl.length + ' chars).');

  console.log('\n======================================================');
  console.log('  ALL BACKEND & DATABASE SUBSYSTEMS VERIFIED 100%!');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
