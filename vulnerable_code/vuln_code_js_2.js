const express = require('express');
const mysql = require('mysql');
const app = express();

// SQL Injection vulnerability
app.get('/user', (req, res) => {
  const userId = req.query.id;
  const query = "SELECT * FROM users WHERE id = " + userId; // VULNERABLE
  connection.query(query, (error, results) => {
    res.json(results);
  });
});

// Command Injection vulnerability
app.get('/ping', (req, res) => {
  const host = req.query.host;
  const exec = require('child_process').exec;
  exec('ping -c 4 ' + host, (error, stdout) => { // VULNERABLE
    res.send(stdout);
  });
});

// XSS vulnerability
app.get('/search', (req, res) => {
  const searchTerm = req.query.q;
  res.send('<html><body>You searched for: ' + searchTerm + '</body></html>'); // VULNERABLE
});

// Path Traversal vulnerability
app.get('/file', (req, res) => {
  const filename = req.query.name;
  const fs = require('fs');
  fs.readFile('./files/' + filename, 'utf8', (err, data) => { // VULNERABLE
    res.send(data);
  });
});

app.listen(3000);
