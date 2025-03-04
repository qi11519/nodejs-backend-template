const AuthModel = require("../models/authModel.js")
const UserModel = require("../models/userModel.js")

/**
 * Signup - Create a new user
 * @param {*} req 
 * @param {*} res 
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Sign up new acocunt in Clerk
    const newUser = await AuthModel.signUpUser(username, email, password);
    if (!newUser || !newUser.id) {
      throw new Error({ errors: [ { message: "Failed to create user" } ] });
    }

    // Append the account in Supabase along
    const { data, error } = await UserModel.createUser(newUser);
    if (error) throw error;

    // Success
    return res.status(200).json({
      code: 200,
      message: "Registered successfully",
    });

  } catch (error) {
    let errorMessage = error.message;
    if(error?.errors && Array.isArray(error.errors)) errorMessage = error.errors[0].message;

    console.error("Error registering new user:", error);
    return res.status(500).json({
      code: 500,
      message: "Registration failed",
      error: errorMessage,
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

    // Create a session token for the user
    const token = await AuthModel.createSession(session_id, "supabase");

    // Get the user from this session(for user info)
    const session = await AuthModel.getSession(session_id);
    const { data, error } = await UserModel.getUserById(session?.userId);
    if (error) throw error;
    if (!data) {
      return res.status(400).json({ code: 400, message: "Invalid session" });
    }
    // If token is used by another email/not the session owner
    if(email !== data.email){
      return res.status(400).json({ code: 400, message: "Invalid session" });
    }

    // Success
    return res.status(200).json({
      code: 200,
      message: "Login successful",
      data: {
        token: token?.jwt,
        user_id: session?.userId,
      }
    });
  } catch (error) {
    let errorMessage = error.message;
    if(error?.errors && Array.isArray(error.errors)) errorMessage = error.errors[0].message;

    console.error("Error logging in:", error);
    return res.status(500).json({
      code: 500, 
      message: "Login Failed", 
      error: errorMessage, 
    });
  }
};

module.exports = { register, login };
