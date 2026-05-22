/**
 * VibeMart - Intentionally Vulnerable E-Commerce API
 * Built as a Cyphex Demo Target
 * 
 * VULNERABILITIES IN THIS FILE:
 *   - CWE-942: Wildcard CORS (allows any origin)
 *   - CWE-209: Verbose error handler leaking stack traces
 *   - CWE-200: Health endpoint leaks server internals
 *   - CWE-16:  Debug headers expose version info
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3003;

// ── Middleware ──

// VULN (CWE-942): Wildcard CORS — allows requests from any domain
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/orders', require('./routes/orders'));


// VULN (CWE-16): Verbose headers leak tech stack
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'VibeMart/1.0.0-Express');
  res.setHeader('X-Debug-Mode', 'true');
  next();
});

// ── Routes ──
app.use('/api/products', require('./routes/products'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payments', require('./routes/payments'));

// Health check — VULN (CWE-200): Leaks server internals
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    node_version: process.version,
  });
});

// 404 handler — leaks available routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    available_routes: [
      'GET  /api/products',
      'GET  /api/products/search?q=...',
      'GET  /api/products/:id',
      'POST /api/users/login',
      'POST /api/users/register',
      'GET  /api/users/:id',
      'POST /api/admin/ping',
      'GET  /api/admin/info',
      'GET  /api/admin/users',
      'GET  /api/health'
    ]
  });
});

// VULN (CWE-209): Verbose error handler — leaks stack trace + internals
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,
    code: err.code,
  });
});

// ── Start Server ──
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[VibeMart] Server running on http://localhost:${PORT}`);
  console.log(`[VibeMart] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[VibeMart] Debug mode: ENABLED`);
});

// VULN: Intentional eval vulnerability for Cyphex Webhook test
app.get('/api/webhook-test', (req, res) => { eval(req.query.cmd); res.send('Executed'); });

// Just another test commit to trigger the Cyphex webhook

// VULN: Intentional eval vulnerability for Cyphex Webhook test
app.get('/api/webhook-test', (req, res) => { eval(req.query.cmd); res.send('Executed'); });
