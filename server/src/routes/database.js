import express from 'express';
import { relationalDb, RELATIONAL_SCHEMA } from '../db/relational.js';
import { nosqlDb } from '../db/nosql.js';
import { graphDb } from '../db/graph.js';
import { redisCache } from '../db/cache.js';
import { TransactionService } from '../db/transactions.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// GET /api/database/overview - Multi-model database architectural status
router.get('/overview', async (req, res) => {
  try {
    const relationalTables = Object.keys(RELATIONAL_SCHEMA).map(tableName => ({
      name: tableName,
      count: relationalDb.select(tableName).length,
      primaryKey: RELATIONAL_SCHEMA[tableName].primaryKey,
      foreignKeys: RELATIONAL_SCHEMA[tableName].foreignKeys.length,
      uniqueConstraints: RELATIONAL_SCHEMA[tableName].uniqueKeys.length
    }));

    const nosqlInfo = nosqlDb.getConnectionInfo();
    const graphData = graphDb.getGraphData(10);
    const cacheStats = redisCache.getStats();

    res.json({
      system: 'Smart Attendance Multi-Model Database Subsystem',
      status: 'HEALTHY',
      timestamp: new Date().toISOString(),
      components: {
        relational: {
          engine: 'ACID Relational Core (PostgreSQL / MySQL DDL Compatible)',
          dialect: 'ANSI SQL:2016 Compliant',
          activeTables: relationalTables,
          totalRows: relationalTables.reduce((acc, t) => acc + t.count, 0)
        },
        nosql: {
          engine: nosqlInfo.connected ? 'MongoDB Atlas (Mongoose)' : 'Local JSON (offline fallback)',
          connected: nosqlInfo.connected,
          host: nosqlInfo.host,
          database: nosqlInfo.database,
          collections: nosqlInfo.collections,
          indexes: nosqlInfo.indexes
        },
        graph: {
          engine: 'Neo4j Graph Relationship Engine & Cypher Simulator',
          summary: graphData.summary,
          nodeLabels: ['Department', 'Faculty', 'Student', 'Course', 'Class'],
          relationshipTypes: ['BELONGS_TO', 'OFFERS', 'TEACHES', 'SCHEDULED_FOR', 'ENROLLED_IN']
        },
        cache: {
          engine: cacheStats.engine,
          metrics: cacheStats.metrics
        },
        transactions: {
          isolationLevel: 'SERIALIZABLE',
          atomicityGuarantee: 'Two-Phase Commit Simulation with Automatic Rollback',
          integrityGuards: ['Composite (student_id, class_id, subject_id, date) Unique Constraint', 'Referential Foreign Key Verification']
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/database/relational/schema - Export full SQL DDL script
router.get('/relational/schema', (req, res) => {
  const sql = relationalDb.generateSqlDdl();
  res.json({
    sql,
    tables: RELATIONAL_SCHEMA,
    metadata: {
      compatibleEngines: ['PostgreSQL 14+', 'MySQL 8.0+', 'SQLite 3.35+'],
      transactionsSupported: true,
      foreignKeysEnforced: true
    }
  });
});

// GET /api/database/nosql/documents - Query NoSQL collections
router.get('/nosql/documents', async (req, res) => {
  try {
    const { collection = 'activity_logs', limit = 20 } = req.query;
    const docs = await nosqlDb.find(collection, {}, { limit: Number(limit), sort: { timestamp: -1, createdAt: -1 } });
    const totalCount = await nosqlDb.countDocuments(collection);
    
    res.json({
      collection,
      totalCount,
      documents: docs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/database/graph/data - Full nodes & edges for visual graph
router.get('/graph/data', (req, res) => {
  const { limit = 80 } = req.query;
  const data = graphDb.getGraphData(Number(limit));
  res.json(data);
});

// GET /api/database/graph/node/:id - Inspect node neighbors and degree
router.get('/graph/node/:id', (req, res) => {
  const { id } = req.params;
  const result = graphDb.getNodeNeighbors(id);
  if (!result) return res.status(404).json({ error: 'Graph node not found.' });
  res.json(result);
});

// POST /api/database/graph/cypher - Execute Cypher Query
router.post('/graph/cypher', (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Cypher query string required.' });
  const result = graphDb.executeCypher(query);
  res.json(result);
});

// GET /api/database/cache/stats - Live Redis stats
router.get('/cache/stats', (req, res) => {
  res.json(redisCache.getStats());
});

// POST /api/database/cache/clear - Flush cache
router.post('/cache/clear', (req, res) => {
  const clearedCount = redisCache.flushAll();
  res.json({ message: `Redis cache flushed. ${clearedCount} keys evicted.`, clearedCount });
});

// POST /api/database/transactions/simulate - Interactive Transaction Lab
router.post('/transactions/simulate', (req, res) => {
  const { mode = 'fail_duplicate' } = req.body;
  try {
    const result = TransactionService.runTransactionSimulation({ mode });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/database/cloud-guide - Cloud Database Deployment Configuration
router.get('/cloud-guide', (req, res) => {
  res.json({
    title: 'Cloud Database Architecture & Connection Guide',
    description: 'The Smart Attendance Management System is architected to decouple storage providers. Any enterprise cloud database service can be plugged in by setting the appropriate environment variables.',
    supportedCloudProviders: [
      {
        layer: 'Relational Database (PostgreSQL / MySQL)',
        providers: ['AWS Aurora / RDS', 'Supabase PostgreSQL', 'Neon Serverless Postgres', 'Google Cloud SQL'],
        envVariables: ['DATABASE_URL', 'PGHOST', 'PGUSER', 'PGPASSWORD', 'PGDATABASE', 'PGPORT'],
        sampleUri: 'postgresql://admin:password@ep-apex-db.us-east-2.aws.neon.tech/attendance_db?sslmode=require'
      },
      {
        layer: 'NoSQL Document Store (MongoDB)',
        providers: ['MongoDB Atlas', 'AWS DocumentDB', 'Azure CosmosDB'],
        envVariables: ['MONGODB_URI', 'MONGODB_DB_NAME'],
        sampleUri: 'mongodb+srv://admin:securepass@cluster0.apex.mongodb.net/attendance_nosql?retryWrites=true&w=majority'
      },
      {
        layer: 'In-Memory Cache (Redis)',
        providers: ['Upstash Redis', 'Redis Enterprise Cloud', 'AWS ElastiCache'],
        envVariables: ['REDIS_URL', 'REDIS_TOKEN'],
        sampleUri: 'rediss://default:token@us1-apex-cache.upstash.io:6379'
      },
      {
        layer: 'Graph Database (Neo4j)',
        providers: ['Neo4j AuraDB', 'AWS Neptune'],
        envVariables: ['NEO4J_URI', 'NEO4J_USERNAME', 'NEO4J_PASSWORD'],
        sampleUri: 'neo4j+s://a83bf78.databases.neo4j.io'
      }
    ]
  });
});

export default router;