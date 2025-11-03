// server.js
import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Example route: Health check
app.get("/", (req, res) => {
  res.json({ status: "API Gateway is running" });
});

// Example proxy route: Call to Airtable or Fillout
app.post("/api/proxy", async (req, res) => {
  const { service, endpoint, method = "GET", data, params } = req.body;

  try {
    const baseUrls = {
      airtable: "https://api.airtable.com/v0",
      fillout: "https://api.fillout.com/v1",
    };

    const baseUrl = baseUrls[service];
    if (!baseUrl) return res.status(400).json({ error: "Unknown service" });

    const headers = {
      Authorization: `Bearer ${process.env[`${service.toUpperCase()}_API_KEY`]}`,
      "Content-Type": "application/json",
    };

    const response = await axios({
      url: `${baseUrl}${endpoint}`,
      method,
      headers,
      data,
      params,
    });

    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(error.response?.status || 500).json({
      error: "Failed to proxy the request",
      details: error.response?.data || error.message,
    });
  }
});

// Placeholder for future SQL integration
// Example: import db from './db.js' (to add PostgreSQL later)

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
