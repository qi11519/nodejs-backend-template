const clerkClient = require("../config/clerkClient.js");

/**
 *  Get user profile from Clerk
 * @param {*} req 
 * @param {*} res 
 */
const getProfile = async (req, res) => {
  try {
    const { userId } = req.auth;

    if (!userId) {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }

    const user = await clerkClient.users.getUser(userId);

    // Get User Success
    res.status(200).json({
      code: 200,
      message: "Success",
      data: {
        user: {
          id: user.id,
          username: user.username || "",
          email: user.emailAddresses[0]?.emailAddress || "",
        },
      }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(400).json({ code: 400, message: "Failed to get user profile", error: error.message });
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
    const { username } = req.body;

    const updatedUser = await clerkClient.users.updateUser(userId, { username });

    res.json({
      code: 200,
      message: "Profile updated successfully",
      data: {
        user: {
          id: updatedUser.id,
          username: updatedUser.username || "",
          email: updatedUser.emailAddresses[0]?.emailAddress || "",
        },
      }
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(400).json({ code: 400, message: "Failed to update user profile", error: error.message });
  }
};

module.exports = { getProfile, updateProfile };
