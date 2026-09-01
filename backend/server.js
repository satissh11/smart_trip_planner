const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend working fine"
  });
});

// Serve React frontend
const frontendPath = path.join(__dirname, "../frontend/dist");

app.use(express.static(frontendPath));

// React Router fallback - Express 5
app.get("/*splat", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});