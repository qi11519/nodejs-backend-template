const { clerkMiddleware } = require("@clerk/express");

const authMiddleware = (req, res, next) => {
  clerkMiddleware()(req, res, (err) => {
    if (err) return next(err);

    // Unauthenticated (Since request has no auth info)
    if (!req.auth?.userId) {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }
    
    // Proceed if authenticated
    next(); 
  });
};

module.exports = authMiddleware;