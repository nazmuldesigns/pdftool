import http from 'node:http';
import { getToolById, TOOLS_REGISTRY, DEFAULT_RETENTION_POLICY } from '@pdf-toolbox/shared';

const PORT = process.env.PORT || 8080;

interface JobStoreItem {
  id: string;
  toolId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  progress: number;
  outputUrl?: string;
  error?: string;
}

// In-memory / Cloud Run job state store
const jobStore = new Map<string, JobStoreItem>();

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  // Health endpoint
  if (url.pathname === '/health' || url.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: Date.now(),
      version: '1.0.0',
      totalRegisteredTools: TOOLS_REGISTRY.length,
      retentionPolicy: DEFAULT_RETENTION_POLICY
    }));
    return;
  }

  // Tools list endpoint
  if (url.pathname === '/api/tools') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(TOOLS_REGISTRY));
    return;
  }

  // Job creation endpoint: POST /api/jobs
  if (url.pathname === '/api/jobs' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { toolId, options } = payload;
        const tool = getToolById(toolId);

        if (!tool) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Tool ${toolId} not found` }));
          return;
        }

        const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const job: JobStoreItem = {
          id: jobId,
          toolId,
          status: 'queued',
          createdAt: Date.now(),
          progress: 0
        };

        jobStore.set(jobId, job);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(job));
      } catch (err: any) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'Invalid JSON body' }));
      }
    });
    return;
  }

  // Job status polling: GET /api/jobs/:id
  if (url.pathname.startsWith('/api/jobs/')) {
    const jobId = url.pathname.replace('/api/jobs/', '');
    const job = jobStore.get(jobId);

    if (!job) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Job not found or expired' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(job));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`[PDF-API] Orchestration API running on port ${PORT}`);
});
