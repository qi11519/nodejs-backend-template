const { clerkMiddleware } = require("@clerk/express");
const supabaseClient = require("../config/supabase.js");

// Authentication
const authMiddleware = (req, res, next) => {
  clerkMiddleware()(req, res, (err) => {
    if (err) return next(err);

    // Unauthenticated (Since request has no auth info)
    if (!req.auth?.userId) {
      return res.status(401).json({ code: 401, message: "Unauthorized", error:"From authMiddleware" });
    }
    
    // Proceed if authenticated
    next(); 
  });
};

// Check account role if they have access
const checkRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      // Get user auth
      const { userId } = req.auth;
      if (!userId) {
        return res.status(401).json({ code: 401, message: "Unauthorized" });
      }

      // Fetch user role from Supabase
      const { data, error } = await supabaseClient
        .from("User")
        .select("role")
        .eq("user_id", userId)
        .single();
        
      // If no user or no access
      if (error || !data) {
        return res.status(403).json({ code: 403, message: "Access denied" });
      }
      if (data.role !== requiredRole) {
        return res.status(403).json({ code: 403, message: "Access denied" });
      }

      // Proceed if role is correct
      next();
    } catch (error) {
      console.error("Role check error:", error);
      res.status(500).json({ code: 500, message: "Internal server error" });
    }
  };
};

module.exports = { authMiddleware, checkRole };