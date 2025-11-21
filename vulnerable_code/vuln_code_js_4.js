const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const { spawn } = require("child_process");

const app = express();
app.use(bodyParser.json());

// ❌ Misconfigured CORS (allows any origin)
app.use(cors());

// ❌ Hardcoded API key
const API_KEY = "123456-SECRET-API-KEY";

// ❌ No authentication for admin panel
app.get("/admin", (req, res) => {
    res.send("Welcome to the admin panel. No authentication required!");
});

// ❌ Insecure cookie flags
app.get("/set-cookie", (req, res) => {
    res.cookie("sessionId", "abc123", { secure: false, httpOnly: false });
    res.send("Cookie set!");
});

// ❌ Brute-forceable login + weak checks
app.post("/simple-login", (req, res) => {
    if (req.body.username === "admin" && req.body.password === "password") {
        return res.send("Logged in!");
    }
    res.status(401).send("Unauthorized");
});

// ❌ Prototype Pollution
app.post("/pollute", (req, res) => {
    const input = req.body;
    Object.assign({}, input);  // naive merge
    Object.assign(global, input); // VERY dangerous
    res.send("Polluted: " + JSON.stringify(input));
});

// ❌ ReDoS via catastrophic regex
app.get("/search", (req, res) => {
    const q = req.query.q || "";
    const regex = new RegExp("^(" + q + ")+$"); // Vulnerable
    res.send("Matched: " + regex.test("a".repeat(50000)));
});

// ❌ Insecure file upload
const upload = multer({ dest: "./uploads/" });
app.post("/upload", upload.single("file"), (req, res) => {
    res.send("File uploaded: " + req.file.originalname);
});

// ❌ Unsafe Deserialization
app.post("/deserialize", (req, res) => {
    try {
        const data = JSON.parse(req.body.payload); // Could be malicious input
        res.send("Deserialized: " + JSON.stringify(data));
    } catch (e) {
        res.status(400).send("Invalid JSON");
    }
});

// ❌ Path Injection using spawn
app.get("/run", (req, res) => {
    const script = req.query.script; // user controlled
    const process = spawn("sh", [script]); // dangerous
    let output = "";

    process.stdout.on("data", (data) => output += data);
});

// ❌ Sensitive data leaks through stack traces
app.get("/debug", (req, res) => {
    try {
        throw new Error("Testing error leak");
    } catch (err) {
        res.send(err.stack); // sensitive
app.listen(3002, () => console.log("Vulnerable App 5 running on port 3002"));
    }
});


