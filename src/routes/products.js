/**
 * VibeMart — Product Routes
 * 
 * VULNERABILITIES:
 *   - CWE-89: SQL Injection in product search (GET /search?q=...)
 *   - CWE-79: Reflected XSS in search echo
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/products — List all products
router.get('/', (req, res) => {
  const results = db.query("SELECT * FROM products");
  res.json({ products: results, count: results.length });
});

// GET /api/products/search?q=keyboard
// VULN (CWE-89): SQL Injection — user input directly interpolated into query
router.get('/search', (req, res) => {
  const searchTerm = req.query.q || '';

const sql = 'SELECT * FROM products WHERE name LIKE ?';
const results = db.query(sql, [`%${searchTerm}%`]);

// VULN (CWE-79): Reflected XSS — echoing user input unescaped
// Fixed by rendering content as text children
<h3>{a.title}</h3>
  res.json({
    query: searchTerm,
    message: `Found ${results.length} results for "${searchTerm}"`,
    results: results
  });
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = db.products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

module.exports = router;

// VULN: Intentional SQLi for Cyphex Webhook test
router.get('/api/unsafe-search', async (req, res) => {
  const results = await db.query("SELECT * FROM products WHERE name = '" + req.query.name + "'");
  res.json(results);
});
