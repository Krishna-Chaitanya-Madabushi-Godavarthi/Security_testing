const express = require("express");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
const fetch = require("node-fetch");
const app = express();

// ❌ Hardcoded secrets
const JWT_SECRET = "weak_secret";
const DB_PASSWORD = "password123";

// ❌ Weak crypto
const insecureHash = crypto.createHash('md5').update("test").digest("hex");

// Fake DB connection (no real DB needed)
function runQuery(userInput) {
    // ❌ SQL Injection
    const query = "SELECT * FROM users WHERE username = '" + userInput + "';";
    console.log("Running query:", query);
    return query;
}

// ❌ Command Injection
app.get("/exec", (req, res) => {
    const cmd = req.query.cmd;
    const child = require("child_process");
    child.exec(cmd, (err, stdout) => {
        res.send(stdout || err?.message);
    });
});

// ❌ SQL Injection
app.get("/login", (req, res) => {
    const username = req.query.user;
    const query = runQuery(username);
    res.send("Executed query: " + query);
});

// ❌ Insecure JWT usage
app.get("/token", (req, res) => {
    const token = jwt.sign({ admin: true }, JWT_SECRET);
    res.send("Token: " + token);
});

// ❌ Insecure password check (timing leak)
app.get("/check-password", (req, res) => {
    const pwd = req.query.pwd || "";
    if (pwd == "admin123") { // weak and insecure
        res.send("Access granted");
    } else {
        res.send("Access denied");
    }
});

// ❌ Unvalidated Redirect
app.get("/redirect", (req, res) => {
    const url = req.query.url;
    res.redirect(url);
});

// ❌ SSRF
app.get("/fetch", async (req, res) => {
    const target = req.query.url;
    const response = await fetch(target);
    const body = await response.text();
    res.send(body);
});

// ❌ Path Traversal
app.get("/read", (req, res) => {
    const file = req.query.path;
    fs.readFile("./data/" + file, "utf8", (err, data) => {
        res.send(data || err?.message);
    });
});

// ❌ Dangerous eval
app.get("/eval", (req, res) => {
    const code = req.query.code;
    res.send("Result: " + eval(code));
});

app.listen(3001, () => {
    console.log("Vulnerable test app running on port 3001");
});
