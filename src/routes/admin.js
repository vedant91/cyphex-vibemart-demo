/**
 * VibeMart — Admin Routes
 * 
 * VULNERABILITIES:
 *   - CWE-78:  OS Command Injection in ping utility (POST /ping)
 *   - CWE-306: No authentication on admin endpoints
 *   - CWE-200: System info disclosure (GET /info)
 */

const express = require('express');
const router = express.Router();
const { execSync } = require('child_process');
const os = require('os');

// VULN (CWE-306): No authentication middleware on admin routes!

// POST /api/admin/ping
// VULN (CWE-78): Command Injection — user-supplied host passed to exec
router.post('/ping', (req, res) => {
  const { host } = req.body;

  if (!host) {
    return res.status(400).json({ error: 'Host parameter required' });
  }

  try {
    // VULN: Direct OS command injection
    const cmd = `ping -c 1 ${host}`;
    const output = execSync(cmd, { timeout: 5000 }).toString();
    res.json({ host, output });
  } catch (err) {
    res.status(500).json({ error: 'Ping failed', details: err.message });
  }
});

// GET /api/admin/info
// VULN (CWE-200): Exposing sensitive system information
router.get('/info', (req, res) => {
  res.json({
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    memory_total: os.totalmem(),
    memory_free: os.freemem(),
    uptime: os.uptime(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PATH: process.env.PATH,
      HOME: process.env.HOME || process.env.USERPROFILE,
    },
    cwd: process.cwd(),
    pid: process.pid,
    node_version: process.version,
  });
});

// GET /api/admin/users — dump all users (no auth)
router.get('/users', (req, res) => {
  const db = require('../db');
  // VULN: Exposes all user data including passwords
  res.json({ users: db.users });
});

module.exports = router;
