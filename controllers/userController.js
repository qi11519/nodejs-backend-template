const UserModel = require("../models/userModel.js")
const AuthModel = require("../models/authModel.js")

/**
 *  Get user profile from Supabase
 * @param {*} req 
 * @param {*} res 
 */
const getProfile = async (req, res) => {
  try {
    const { userId } = req.auth;

    // Query current user from Supabase
    const { data, error } = await UserModel.getUserById(userId);
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }

    // Pass back user (Without id)
    const { id, ...rest } = data;

    // Success
    res.status(200).json({
      code: 200,
      message: "Success",
      data: {
        user: { ...rest },
      }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(400).json({ code: 400, message: "Failed to get user profile", error: error.message });
  }
};

/**
 * Update user profile in Supabase
 * @param {*} req 
 * @param {*} res 
 */
const updateProfile = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { first_name, last_name, job_title, company_id } = req.body;
    
    // Update user by user id
    const { data, error } = await UserModel.updateUserById(userId, { first_name, last_name, job_title, company_id });
    if (error) throw error;
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }
    
    // Pass back user (Without id & user id)
    const { id, user_id, ...rest } = data;

    // Success
    res.json({
      code: 200,
      message: "Profile updated successfully",
      data: {
        user: { ...rest },
      }
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(400).json({ code: 400, message: "Failed to update user profile", error: error.message });
  }
};

/**
 *  Update user email from Clerk
 * @param {*} req 
 * @param {*} res 
 */
const updateEmail = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { email } = req.body;
    const userResponse = await AuthModel.getUser(userId);
    
    // Query current user from Supabase
    await AuthModel.updateEmail(userId, userResponse?.primaryEmailAddressId, email);

    // Update User in Supabase
    const { data, error } = await UserModel.updateUserById(userId, { email });
    if (error) throw error;
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(404).json({ code: 404, message: "Failed to update email address" });
    }

    // Success
    res.status(200).json({
      code: 200,
      message: "Success",
    });
  } catch (error) {
    let errorMessage = error.message;
    if(error?.errors && Array.isArray(error.errors)) errorMessage = error.errors[0].message;

    console.error("Error updating email address:", error);
    res.status(400).json({ code: 400, message: "Failed to update email address", error: errorMessage });
  }
};

/**
 * Change User Password from Clerk
 * @param {*} req 
 * @param {*} res 
 */
const changePassword = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { password } = req.body;
    
    // Query current user from Supabase
    await AuthModel.changePassword(userId, password);

    // Success
    res.status(200).json({
      code: 200,
      message: "Success",
    });
  } catch (error) {
    let errorMessage = error.message;
    if(error?.errors && Array.isArray(error.errors)) errorMessage = error.errors[0].message;

    console.error("Error changing password:", error);
    res.status(400).json({ code: 400, message: "Failed to change password", error: errorMessage });
  }
};

module.exports = { getProfile, updateProfile, updateEmail, changePassword };
