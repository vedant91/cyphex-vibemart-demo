/**
 * VibeMart — User Routes
 * 
 * VULNERABILITIES:
 *   - CWE-89:  SQL Injection in login (POST /login)
 *   - CWE-639: IDOR — any user can fetch any other user's profile (GET /:id)
 *   - CWE-522: Passwords stored/returned in plaintext
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/users/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  const sql = 'SELECT * FROM users WHERE username = ?';
  const results = db.query(sql, [username]) || [];

if (results.length === 0) {
    return res.status(401).json({ error: 'User not found' });
  }

  const user = results[0];
  if (user.password !== password) {
    return res.status(401).json({
      error: 'Invalid password',
      // VULN: Confirms user exists (enumeration)
      hint: `User '${username}' exists but password is incorrect`
    });
  }

  // VULN (CWE-522): Returning password in response
  res.json({
    message: 'Login successful',
    user: user,
    token: 'fake-jwt-' + Buffer.from(JSON.stringify(user)).toString('base64')
  });
});

// POST /api/users/register
router.post('/register', (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const newUser = {
    id: db.users.length + 1,
    username,
    password, // VULN (CWE-256): Storing plaintext password
    email,
    role: 'user'
  };
  db.users.push(newUser);

  res.status(201).json({ message: 'User created', user: newUser });
});

// GET /api/users/:id
// VULN (CWE-639): IDOR — No authentication check. Any user can see any profile.
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = db.users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // VULN: Returns full user object including password
  res.json(user);
});

module.exports = router;
