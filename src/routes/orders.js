/**
 * VibeMart — Order Routes
 * 
 * "Vibe coded" by a developer who didn't think about security.
 * This file has MULTIPLE intentional vulnerabilities for Cyphex to find.
 */

const express = require('express');
const router = express.Router();
const { execSync } = require('child_process');
const db = require('../db');

// POST /api/orders/create
// VULN (CWE-89): SQL Injection — order data interpolated directly
router.post('/create', (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  
  const sql = `INSERT INTO orders (user_id, product_id, quantity) VALUES (${user_id}, ${product_id}, ${quantity})`;
  try {
    db.query(sql);
    res.json({ message: 'Order placed successfully', order: { user_id, product_id, quantity } });
  } catch(e) {
    res.status(500).json({ error: e.message, sql: sql }); // VULN: leaks SQL query in error
  }
});

// GET /api/orders/export?format=csv
// VULN (CWE-78): Command Injection — user controls the export command
router.get('/export', (req, res) => {
  const format = req.query.format || 'json';
  
  try {
    // VULN: Direct shell command injection via format parameter
    const output = execSync(`echo "Exporting orders as ${format}" && ls`).toString();
    res.json({ export: output, format: format });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/orders/receipt?id=1
// VULN (CWE-79): Reflected XSS — order ID echoed back unescaped in HTML
router.get('/receipt', (req, res) => {
  const orderId = req.query.id;
  
  // VULN: Directly embedding user input into HTML response
  res.send(`
    <html>
      <body>
        <h1>Order Receipt</h1>
        <p>Order ID: ${orderId}</p>
        <p>Thank you for your purchase!</p>
      </body>
    </html>
  `);
});

// GET /api/orders/lookup?email=user@test.com
// VULN (CWE-943): NoSQL/SQL Injection — email used in query without sanitization
router.get('/lookup', (req, res) => {
  const email = req.query.email;
  const sql = `SELECT * FROM orders WHERE user_email = '${email}'`;
  const results = db.query(sql);
  res.json({ orders: results, query_used: sql }); // VULN: exposes internal query
});

module.exports = router;
