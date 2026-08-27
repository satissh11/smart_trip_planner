const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("🚀 Backend is running successfully!");
});

// sample API route (tum apna add kar sakte ho)
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend working fine"
  });
});

// PORT (Railway requirement)
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});