const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

// Security middlewares
const { xssSanitizer } = require("./middlewares/xssSanitizer");
const {
  skipCSRFForRoutes,
  csrfErrorHandler,
} = require("./middlewares/csrfProtection");

const app = express();

// === Database Initialization ===
// MongoDB is the active data store for runtime APIs.
require("./config/mongo.js");

// === Swagger Docs ===
const { swaggerUi, specs } = require("./config/swagger.js");

const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "https://awaaz-phi.vercel.app",
];

const envOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

// === Middlewares ===
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow tools/non-browser requests with no origin header.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// === Security Middlewares ===
app.use(xssSanitizer);

const csrfSkipRoutes = [
  "/api/auth", // JWT auth endpoints
  "/api/contributors", // Public read-only API
  "/api-docs", // Swagger documentation
  "/api/issues/analyze-image", // AI image analysis endpoint
  "/api/issues", // Issue submission endpoint
];
app.use(skipCSRFForRoutes(csrfSkipRoutes));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// === Rate Limiting ===
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// === Routes ===
const authRoutes = require("./routes/auth.js");
const issueRoutes = require("./routes/issues.js");
const profileRoutes = require("./routes/profileRoutes.js");
const contributionsRoutes = require("./routes/contributions.js");
const analyticsRoutes = require("./routes/analytics.js");

app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/contributors", contributionsRoutes);
app.use("/api/analytics", analyticsRoutes);

// === Swagger API Docs ===
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// === Error Handlers ===
app.use(csrfErrorHandler);

const errorHandler = require("./middlewares/errorHandler.js");
app.use(errorHandler);

module.exports = app;
