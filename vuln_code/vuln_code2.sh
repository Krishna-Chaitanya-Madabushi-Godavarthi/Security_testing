const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { exec } = require('child_process');

const app = express();
app.use(express.json());

// --- Hardcoded credentials (VULNERABLE) ---
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password123', // VULNERABLE
  database: 'testdb'
});

// --- SQL Injection ---
app.get('/user', (req, res) => {
  const userId = req.query.id;
  const query = "SELECT * FROM users WHERE id = " + userId; // VULNERABLE
  connection.query(query, (error, results) => {
    res.json(results);
  });
});

// --- Command Injection ---
app.get('/ping', (req, res) => {
  const host = req.query.host;
  exec('ping -c 4 ' + host, (error, stdout) => { // VULNERABLE
    res.send(stdout);
  });
});

// --- XSS ---
app.get('/search', (req, res) => {
  const searchTerm = req.query.q;
  res.send('<html><body>You searched for: ' + searchTerm + '</body></html>'); // VULNERABLE
});

// --- Path Traversal ---
app.get('/file', (req, res) => {
  const filename = req.query.name;
  fs.readFile('./files/' + filename, 'utf8', (err, data) => { // VULNERABLE
    res.send(data);
  });
});

// --- Insecure eval() usage ---
app.get('/calc', (req, res) => {
  const expression = req.query.expr;
  const result = eval(expression); // VULNERABLE
  res.send("Result: " + result);
});

// --- Weak Crypto (MD5) ---
app.get('/hash', (req, res) => {
  const input = req.query.text;
  const hash = crypto.createHash('md5').update(input).digest('hex'); // VULNERABLE
  res.send(hash);
});

// --- Open Redirect ---
app.get('/redirect', (req, res) => {
  const url = req.query.url;
  res.redirect(url); // VULNERABLE
});

// --- Insecure JWT Verification ---
app.post('/jwt-decode', (req, res) => {
  const token = req.body.token;
  const decoded = jwt.decode(token); // VULNERABLE: decode without verify
  res.json(decoded);
});

// --- Unsafe Deserialization ---
app.post('/deserialize', (req, res) => {
  const payload = req.body.data;
  const obj = JSON.parse(payload); // VULNERABLE IF attacker passes harmful JSON
  res.json(obj);
});

// --- No rate limiting → brute force vulnerability ---
app.post('/login', (req, res) => {
  const { user, pass } = req.body;

  if (user === "admin" && pass === "admin123") { // dummy
    res.send("Logged in");
  } else {
    res.send("Invalid credentials");
  }
});

// --- Sensitive Data Exposure ---
app.get('/debug', (req, res) => {
  res.json({ 
    secretKey: "supersecretvalue",  // VULNERABLE
    env: process.env
  });
});

// --- Broken Access Control (no auth check) ---
app.get('/admin-panel', (req, res) => {
  res.send("Welcome to admin panel"); // VULNERABLE: no auth
});

// --- CSRF Vulnerability (state-changing GET) ---
app.get('/delete-account', (req, res) => {
  const user = req.query.user;
  connection.query("DELETE FROM accounts WHERE username = '" + user + "'", () => { // VULNERABLE
    res.send("Account deleted");
  });
});

app.listen(3000, () => console.log("Vulnerable test app running on port 3000"));
