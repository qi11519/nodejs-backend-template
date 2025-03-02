require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

const { clerkMiddleware } = require("@clerk/express");

const app = express();

// Middleware
app.use(cors()); // CORS
app.use(helmet()); // Security Middleware
app.use(morgan("dev")); // HTTP Request Logger
app.use(express.json());
app.use(clerkMiddleware());

// Register all routes under /api
const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ code: 200, message: "Backend server is running..." });
});

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
