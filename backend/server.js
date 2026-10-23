
import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";

import connectDB from "./config/db.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "LibraDesk API is running",
  });
});
  
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/transactions", transactionRoutes);

// Handle unknown endpoints.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Handle malformed JSON and unexpected Express errors.
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body.",
    });
  }

  console.error("Express error:", error);

  return res.status(500).json({
    success: false,
    message: "An unexpected server error occurred.",
  });
});

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log("Routes registered:");
      console.log("GET/POST       /api/books");
      console.log("GET/PATCH/DELETE /api/books/:id");
      console.log("GET/POST       /api/members");
      console.log("GET/PATCH/DELETE /api/members/:id");
      console.log("GET/POST       /api/transactions");
      console.log("GET            /api/transactions/:id");
      console.log("PATCH          /api/transactions/:id/return");
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
