const { createClerkClient } = require("@clerk/backend");

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  jwtKey: process.env.CLERK_JWT_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
});

module.exports = clerkClient;