const { requireAuth } = require("@clerk/express");

module.exports = requireAuth(
    {
        secretKey: process.env.CLERK_SECRET_KEY,
      }
);