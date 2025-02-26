const { getAuth } = require("@clerk/express");
const clerkClient = require("../config/clerkClient.js");

/**
 * Signup - Create a new user
 * @param {*} req 
 * @param {*} res 
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const newUser = await clerkClient.users.createUser({
      username: username,
      emailAddress: [email],
      password,
    })
    
    res.status(201).json({
      code: 201,
      message: "User created successfully",
      data: {
        userId: newUser.id,
      },
    });

  } catch (error) {
    console.error("Error registering:", error);
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
    const { email } = req.body;

    console.log("req.auth", req.auth);
    

    // Find the user by email first
    const users = await clerkClient.users.getUserList({ emailAddress: [email] });

    // If no user
    if (users.data.length === 0) {
      return res.status(404).json({ code: 400, message: "User not found" });
    }

    // Found user
    const user = users.data[0];

    // Create a signIn token for the user
    const signIn = await clerkClient.signInTokens.createSignInToken({
      userId: user.id,
      expiresInSeconds: 60 * 60 * 24 * 7,
    });

    // Create a session token for the user
    // const session2 = await clerkClient.sessions.getToken(
    //   {template: "supabase"}
    // );

    const session = await clerkClient.sessions.getSessionList(
      { userId: signIn.userId }
    );

    console.log("session",session);
    

    res.json({
        code: 201,
        message: "Login successful",
        data: {
        // session: session,
        token: signIn.token,
        userId: user.id,
      }
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ code: 400, message: "Login Failed", error: error.message });
  }
};

module.exports = { register, login };
