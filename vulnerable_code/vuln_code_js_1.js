// ❌ Hardcoded secret (CodeQL: hardcoded credentials)
const DB_PASSWORD = "SuperSecret123!"; 

const http = require("http");
const url = require("url");
const child_process = require("child_process");
const fs = require("fs");

// Fake DB function ❌ SQL Injection
function insecureQuery(userInput) {
    const query = "SELECT * FROM users WHERE name = '" + userInput + "';";
    console.log("Running query:", query); // CodeQL should flag this
    return query;
}

http.createServer((req, res) => {
    const parsed = url.parse(req.url, true);
    const username = parsed.query.username || "";
    const file = parsed.query.file || "";
    const cmd = parsed.query.cmd || "";

    // ❌ SQL Injection trigger
    const result = insecureQuery(username);

    // ❌ Path Traversal
    fs.readFile("./uploads/" + file, "utf8", (err, data) => {
        if (err) {
            console.error("File error:", err);
        }
        // respond anyway
        res.writeHead(200, { "Content-Type": "application/json" });

        // ❌ Command Injection
        child_process.exec(cmd, (err, stdout) => {
            res.end(JSON.stringify({
                sql_result: result,
                file_content: data || "",
                cmd_output: stdout ||_
