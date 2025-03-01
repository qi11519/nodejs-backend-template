const clerkClient = require("../config/clerkClient.js");
const supabaseClient = require("../config/supabase.js");

/**
 * Signup - Create a new user
 * @param {*} req 
 * @param {*} res 
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Create new acocunt in Clerk
    const newUser = await clerkClient.users.createUser({
      username: username,
      emailAddress: [email],
      password,
    })
    if (!newUser || !newUser.id) {
      throw new Error("Failed to create user in Clerk");
    }

    // Create the account in Supabase along
    const { data, error } = await supabaseClient
      .from("User")
      .insert([
        {
          user_id: newUser.id,
          email: email,
          role: "user"
        },
      ]);
    if (error) throw error; 

    // Register Success
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
    
    // Find the user by email first
    const users = await clerkClient.users.getUserList({ emailAddress: [email] });

    // User not found
    if (users.data.length === 0) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }

    // Found user
    const user = users.data[0];

    // Create a session token for the user
    const session = await clerkClient.sessions.getToken(
        session_id,
        "supabase"
    );    

    // Login Success
    res.status(200).json({
      code: 200,
      message: "Login successful",
      data: {
        token: session.jwt,
        userId: user.id,
      }
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ code: 400, message: "Login Failed", error: error.message });
  }
};

module.exports = { register, login };
