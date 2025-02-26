require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

const { createClerkClient, clerkMiddleware } = require("@clerk/express");

const app = express();

// Middleware
app.use(cors()); // CORS
app.use(helmet()); // Security Middleware
app.use(morgan("dev")); // HTTP Request Logger
app.use(express.json());

app.use(clerkMiddleware());

// Register all routes under /api
const apiRoutes = require("./src/routes/api");
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("E-signature backend is running...");
});

/**
 * Sample of clerk client usage 
 * Go to https://clerk.com/docs/quickstarts/setup-clerk for documentation
 */ 
// app.get("/all-user", async (req, res) => {
//   const allUsers = await clerkClient.users.getUserList();
//   res.json(allUsers);
// });

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
