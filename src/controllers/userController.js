const clerkClient = require("../config/clerkClient.js");

/**
 *  Get user profile from Clerk
 * @param {*} req 
 * @param {*} res 
 */
const getProfile = async (req, res) => {
  try {
    console.log("req.headers.authorization",req.headers.authorization);
    
    console.log("Auth Middleware Data:", req.auth); // Debugging

    const { userId, getToken } = req.auth; // Correctly extract user ID

    console.log("user", userId, getToken());
    

    if (!userId) {
      return res.status(401).json({ code: 401, error: "Unauthorized" });
    }

    const user = await clerkClient.users.getUser(userId);

    res.json({
      id: user.id,
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ code: 400, message: "Failed to get user profile", error: error.message });
  }
};

/**
 * Update user profile in Clerk
 * @param {*} req 
 * @param {*} res 
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { firstName, lastName } = req.body;

    const updatedUser = await clerkClient.users.updateUser(userId, { firstName, lastName });

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.emailAddresses[0].emailAddress,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Failed to update user profile" });
  }
};

module.exports = { getProfile, updateProfile };
