# vuln_app.py
import sqlite3
import os
from flask import Flask, request, jsonify

app = Flask(__name__)

# -------------------------
# SQL Injection Vulnerability
# -------------------------
@app.route("/user")
def get_user():
    user_id = request.args.get("id")
    query = f"SELECT * FROM users WHERE id = {user_id}"  # VULNERABLE
    conn = sqlite3.connect("dummy.db")
    cursor = conn.cursor()
    cursor.execute(query)
    result = cursor.fetchall()
    conn.close()
    return jsonify(result)

# -------------------------
# Command Injection Vulnerability
# -------------------------
@app.route("/ping")
def ping_host():
    host = request.args.get("host")
    response = os.popen(f"ping -c 4 {host}").read()  # VULNERABLE
    return response

# -------------------------
# Hardcoded Secret
# -------------------------
API_KEY = "DUMMY_SECRET_API_KEY"  # VULNERABLE

# -------------------------
# Path Traversal Vulnerability
# -------------------------
@app.route("/file")
def get_file():
    filename = request.args.get("name")
    with open(f"./files/{filename}", "r") as f:  # VULNERABLE
        content = f.read()
    return content

# -------------------------
# XSS Vulnerability
# -------------------------
@app.route("/search")
def search():
    term = request.args.get("q")
    return f"<html><body>You searched for: {term}</body></html>"  # VULNERABLE

if __name__ == "__main__":
    app.run(debug=True, port=5000)
