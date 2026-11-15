import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Database,
  Layers,
  Network,
  Zap,
  ShieldCheck,
  Cloud,
  RefreshCw,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  Trash2,
  FileCode,
  ArrowRight
} from 'lucide-react';

export const DatabaseManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'relational' | 'nosql' | 'graph' | 'cache' | 'transactions' | 'cloud'>('relational');
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Relational Tab
  const [sqlSchema, setSqlSchema] = useState<string>('');
  const [copiedSql, setCopiedSql] = useState(false);

  // NoSQL Tab
  const [selectedCollection, setSelectedCollection] = useState('activity_logs');
  const [nosqlDocs, setNosqlDocs] = useState<any[]>([]);

  // Graph Tab
  const [graphData, setGraphData] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [cypherQuery, setCypherQuery] = useState('MATCH (f:Faculty)-[:TEACHES]->(c:Class) RETURN f, c');
  const [cypherResult, setCypherResult] = useState<any>(null);
  const [cypherRunning, setCypherRunning] = useState(false);

  // Cache Tab
  const [cacheStats, setCacheStats] = useState<any>(null);

  // Transaction Lab
  const [simResult, setSimResult] = useState<any>(null);
  const [simRunning, setSimRunning] = useState(false);

  // Cloud Guide
  const [cloudGuide, setCloudGuide] = useState<any>(null);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const [ovRes, sqlRes, graphRes, cacheRes, cloudRes] = await Promise.all([
        api.getDatabaseOverview(),
        api.getRelationalSchema(),
        api.getGraphData(50),
        api.getCacheStats(),
        api.getCloudGuide()
      ]);
      setOverview(ovRes);
      setSqlSchema(sqlRes.sql);
      setGraphData(graphRes);
      setCacheStats(cacheRes);
      setCloudGuide(cloudRes);
      loadNoSqlDocs('activity_logs');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadNoSqlDocs = async (collName: string) => {
    setSelectedCollection(collName);
    try {
      const res = await api.getNoSqlDocuments(collName, 15);
      setNosqlDocs(res.documents);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecuteCypher = async (q?: string) => {
    const queryToRun = q || cypherQuery;
    setCypherRunning(true);
    try {
      const res = await api.executeCypher(queryToRun);
      setCypherResult(res);
    } catch (err: any) {
      setCypherResult({ error: err.message });
    } finally {
      setCypherRunning(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await api.clearCache();
      const updated = await api.getCacheStats();
      setCacheStats(updated);
      alert('Redis Cache flushed successfully.');
    } catch (err: any) {
      alert(`Cache flush error: ${err.message}`);
    }
  };

  const handleSimulateTransaction = async (mode: 'success' | 'fail_duplicate') => {
    setSimRunning(true);
    setSimResult(null);
    try {
      const res = await api.simulateTransaction(mode);
      setSimResult(res);
      // Reload cache and overview
      const [ovRes, cacheRes] = await Promise.all([api.getDatabaseOverview(), api.getCacheStats()]);
      setOverview(ovRes);
      setCacheStats(cacheRes);
    } catch (err: any) {
      setSimResult({ success: false, error: err.message });
    } finally {
      setSimRunning(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Database Architecture & Subsystems</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200 uppercase">
              Multi-Model
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrating Relational (SQL), NoSQL Document Store, Neo4j Graph Relationships, Redis In-Memory Caching, and ACID Transactions
          </p>
        </div>
        <button
          onClick={loadOverview}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Status</span>
        </button>
      </div>

      {/* Database Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2">
        {[
          { id: 'relational', label: '1. Relational (PostgreSQL / MySQL)', icon: Layers },
          { id: 'nosql', label: '2. NoSQL (MongoDB)', icon: Database },
          { id: 'graph', label: '3. Graph Engine (Neo4j)', icon: Network },
          { id: 'cache', label: '4. Redis Caching', icon: Zap },
          { id: 'transactions', label: '5. ACID Transaction Lab', icon: ShieldCheck, badge: 'Interactive' },
          { id: 'cloud', label: '6. Cloud DB Deployment', icon: Cloud },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full uppercase ${isActive ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: RELATIONAL DATABASE */}
      {activeTab === 'relational' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">Relational Schema & Foreign Key Integrity</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict ANSI SQL:2016 tables with Primary Keys, Foreign Keys, Referential Constraints, and Composite Unique Indexes.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {overview?.components?.relational?.activeTables?.map((t: any) => (
                <div key={t.name} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="font-mono font-bold text-xs text-slate-900 block truncate">{t.name}</span>
                  <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                    <div>Rows: <span className="font-bold text-indigo-600">{t.count}</span></div>
                    <div>PK: <span className="font-mono">{t.primaryKey}</span></div>
                    <div>Foreign Keys: <span className="font-bold">{t.foreignKeys}</span></div>
                    <div>Unique Constraints: <span className="font-bold">{t.uniqueConstraints}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SQL DDL Script Box */}
          <div className="bg-slate-900 rounded-2xl p-5 text-slate-100 shadow-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-200 font-mono">schema.sql (Production PostgreSQL / MySQL DDL)</span>
              </div>
              <button
                onClick={handleCopySql}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center space-x-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSql ? 'Copied!' : 'Copy DDL'}</span>
              </button>
            </div>
            <pre className="text-xs font-mono text-indigo-100/90 overflow-x-auto max-h-96 p-2 leading-relaxed">
              {sqlSchema}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 2: NOSQL DATABASE */}
      {activeTab === 'nosql' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">MongoDB Document Store</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Document collections storing asynchronous activity logs, real-time student notifications, and attendance event audit trails.
            </p>

            <div className="flex items-center space-x-2 mt-4">
              {['activity_logs', 'notifications', 'attendance_events'].map((coll) => (
                <button
                  key={coll}
                  onClick={() => loadNoSqlDocs(coll)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                    selectedCollection === coll
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  db.{coll}
                </button>
              ))}
            </div>
          </div>

          {/* Documents JSON Explorer */}
          <div className="bg-slate-900 rounded-2xl p-5 text-slate-100 shadow-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-emerald-400 font-mono">
                db.{selectedCollection}.find().sort(&#123; timestamp: -1 &#125;).limit(15)
              </span>
              <span className="text-xs text-slate-400 font-mono">{nosqlDocs.length} documents fetched</span>
            </div>
            <pre className="text-xs font-mono text-emerald-100/90 overflow-x-auto max-h-96 p-2 leading-relaxed">
              {JSON.stringify(nosqlDocs, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: GRAPH DATABASE (NEO4J) */}
      {activeTab === 'graph' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Neo4j Graph Relationship Engine & Cypher Simulator</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Models interconnected relationships between Department, Faculty, Student, Course, and Class nodes.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-[11px] font-bold">
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">Nodes: {graphData?.totalNodes}</span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">Edges: {graphData?.totalEdges}</span>
              </div>
            </div>

            {/* Quick Cypher Templates */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Pre-Loaded Cypher Queries:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'MATCH (f:Faculty)-[:TEACHES]->(c:Class) RETURN f, c',
                  'MATCH (s:Student)-[:ENROLLED_IN]->(c:Class) RETURN s, c',
                  'MATCH (d:Department)-[:OFFERS]->(c:Course) RETURN d, c',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setCypherQuery(q);
                      handleExecuteCypher(q);
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Cypher Query Runner Input */}
            <div className="mt-4 flex items-center space-x-2">
              <input
                type="text"
                value={cypherQuery}
                onChange={(e) => setCypherQuery(e.target.value)}
                placeholder="Enter Cypher statement..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => handleExecuteCypher()}
                disabled={cypherRunning}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Run Cypher</span>
              </button>
            </div>
          </div>

          {/* Cypher Result Console */}
          {cypherResult && (
            <div className="bg-slate-900 rounded-2xl p-5 text-slate-100 shadow-xl border border-slate-800">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-indigo-400 font-mono">Query Result</span>
                <span className="text-xs text-slate-400 font-mono">
                  Matched {cypherResult.rowsMatched || 0} rows • {cypherResult.executionTimeMs}ms
                </span>
              </div>
              <pre className="text-xs font-mono text-indigo-100 overflow-x-auto max-h-72 leading-relaxed">
                {JSON.stringify(cypherResult.data, null, 2)}
              </pre>
            </div>
          )}

          {/* Interactive Graph Node Browser */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Graph Node Explorer</h3>
            <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto p-1">
              {graphData?.nodes?.map((node: any) => {
                const colorMap: any = {
                  department: 'bg-slate-100 text-slate-800 border-slate-300',
                  course: 'bg-amber-50 text-amber-800 border-amber-200',
                  faculty: 'bg-blue-50 text-blue-800 border-blue-200',
                  class: 'bg-purple-50 text-purple-800 border-purple-200',
                  student: 'bg-emerald-50 text-emerald-800 border-emerald-200'
                };

                return (
                  <button
                    key={node.id}
                    onClick={async () => {
                      const res = await api.getNodeNeighbors(node.id);
                      setSelectedNode(res);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      colorMap[node.group] || 'bg-slate-100'
                    }`}
                  >
                    <span className="font-bold">:{node.label}</span> {node.displayName}
                  </button>
                );
              })}
            </div>

            {selectedNode && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <h4 className="font-bold text-slate-900">
                  Inspecting Node: {selectedNode.targetNode.displayName} (Degree: {selectedNode.degree})
                </h4>
                <div className="mt-2 text-slate-600">
                  <span className="font-semibold text-slate-700">Connected Neighbors ({selectedNode.neighbors.length}):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNode.neighbors.map((n: any) => (
                      <span key={n.id} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px]">
                        :{n.label} {n.displayName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: REDIS CACHING */}
      {activeTab === 'cache' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Redis In-Memory Cache Performance</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Caches aggregated dashboard stats and reports with automatic TTL eviction and invalidation on attendance submission.
              </p>
            </div>
            <button
              onClick={handleClearCache}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Flush Redis Cache</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Cache Hits</span>
              <span className="text-2xl font-black text-emerald-600 block mt-1">{cacheStats?.metrics?.hits || 0}</span>
              <span className="text-[11px] text-slate-400">Zero database query latency</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Cache Misses</span>
              <span className="text-2xl font-black text-amber-600 block mt-1">{cacheStats?.metrics?.misses || 0}</span>
              <span className="text-[11px] text-slate-400">Fetched from primary DB</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Hit Ratio</span>
              <span className="text-2xl font-black text-indigo-600 block mt-1">{cacheStats?.metrics?.hitRatioPercent || '0%'}</span>
              <span className="text-[11px] text-slate-400">Cache efficiency metric</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Active Cache Keys</span>
              <span className="text-2xl font-black text-slate-900 block mt-1">{cacheStats?.metrics?.activeKeysCount || 0}</span>
              <span className="text-[11px] text-slate-400">Keys residing in memory</span>
            </div>
          </div>

          {/* Cached Keys List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Live Redis Key Space</h3>
            <div className="space-y-2">
              {(!cacheStats?.keys || cacheStats.keys.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No keys currently cached (Navigate dashboards or run reports to populate cache).</p>
              ) : (
                cacheStats.keys.map((k: any) => (
                  <div key={k.key} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-800">{k.key}</span>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                      <span>TTL: <span className="font-mono font-semibold text-indigo-600">{k.remainingTtlSeconds}s</span></span>
                      <span>Size: <span className="font-mono">{k.sizeBytes} B</span></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TRANSACTION SIMULATION LAB */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">ACID Transaction Management & Verification Lab</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Interact with the relational transaction engine to test atomic commit and rollback behavior upon integrity constraint violations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-emerald-950 text-sm">Scenario A: Successful Transaction (ACID Commit)</h3>
                  <p className="text-xs text-emerald-800 mt-1">
                    Opens transaction snapshot, inserts record with valid foreign keys and unique constraints, commits atomically to disk, and updates event logs.
                  </p>
                </div>
                <button
                  onClick={() => handleSimulateTransaction('success')}
                  disabled={simRunning}
                  className="mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors disabled:opacity-50"
                >
                  {simRunning ? 'Executing...' : 'Run ACID Commit Test'}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-red-950 text-sm">Scenario B: Duplicate Attendance (ACID Rollback)</h3>
                  <p className="text-xs text-red-800 mt-1">
                    Intentionally simulates an attempt to save duplicate attendance for an existing student/class/subject/date. Triggers immediate exception, rolls back transaction, and guarantees zero database corruption.
                  </p>
                </div>
                <button
                  onClick={() => handleSimulateTransaction('fail_duplicate')}
                  disabled={simRunning}
                  className="mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors disabled:opacity-50"
                >
                  {simRunning ? 'Executing...' : 'Run ACID Rollback Test'}
                </button>
              </div>
            </div>
          </div>

          {/* Simulation Output */}
          {simResult && (
            <div className={`p-5 rounded-2xl border shadow-sm ${
              simResult.committed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-red-50 border-red-200 text-red-950'
            }`}>
              <div className="flex items-center space-x-2">
                {simResult.committed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
                <h4 className="font-bold text-sm">
                  {simResult.committed ? 'Transaction Committed Successfully' : 'Transaction Rolled Back (Atomicity Maintained)'}
                </h4>
              </div>
              <p className="text-xs mt-2 font-medium">
                {simResult.message || simResult.explanation}
              </p>
              <div className="mt-3 p-3 bg-white/70 rounded-xl font-mono text-[11px] space-y-1">
                <div>Transaction ID: {simResult.transactionId}</div>
                {simResult.errorType && <div>Violation: {simResult.errorType}</div>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: CLOUD DATABASE DEPLOYMENT */}
      {activeTab === 'cloud' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">{cloudGuide?.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{cloudGuide?.description}</p>
          </div>

          <div className="space-y-4">
            {cloudGuide?.supportedCloudProviders?.map((p: any, idx: number) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">{p.layer}</h3>
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    Cloud Ready
                  </span>
                </div>

                <div className="mt-3 text-xs text-slate-600 space-y-2">
                  <div>
                    <span className="font-bold text-slate-700">Supported Cloud Providers:</span>{' '}
                    {p.providers.join(' • ')}
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Environment Variables:</span>{' '}
                    <span className="font-mono text-slate-800">{p.envVariables.join(', ')}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block mb-1">Example Connection URI:</span>
                    <div className="p-2.5 bg-slate-900 text-indigo-200 font-mono text-[11px] rounded-xl overflow-x-auto">
                      {p.sampleUri}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
