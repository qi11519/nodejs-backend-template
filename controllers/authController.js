const authModel = require("../models/authModel.js")
const userModel = require("../models/userModel.js")

/**
 * Signup - Create a new user
 * @param {*} req 
 * @param {*} res 
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Sign up new acocunt in Clerk
    const newUser = await authModel.signUpUser(username, email, password);
    if (!newUser || !newUser.id) {
      throw new Error("Failed to create user");
    }

    // Append the account in Supabase along
    const { data, error } = userModel.createUser(newUser);
    if (error) throw error;

    // Success
    res.status(201).json({
      code: 201,
      message: "Registered successfully",
    });

  } catch (error) {
    console.error("Error registering new user:", error);
    res.status(400).json({
      code: 400,
      message: "Registration failed",
      error: error.message,
    });
  }
};

/**
 * [ FOR TESTING ]
 * Login - Simulates a login by creating a session for a user
 * @param {*} req 
 * @param {*} res 
 */
const login = async (req, res) => {
  try {
    const { email, session_id } = req.body;

    if (!email || !session_id) {
      return res.status(400).json({
        code: 400,
        message: "Email and session_id are required",
      });
    }
    
    // Find the user by email first from Clerk
    const users = await authModel.getUserList(email);

    // User not found
    if (users?.data && (Array.isArray(users.data) && users.data.length === 0)) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }

    // Found user
    const user = users.data[0];

    // Create a session token for the user
    const session = await authModel.createSession(session_id, "supabase");

    // Success
    res.status(200).json({
      code: 200,
      message: "Login successful",
      data: {
        token: session?.jwt,
        userId: user.id,
      }
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ code: 400, message: "Login Failed", error: error.message });
  }
};

module.exports = { register, login };
