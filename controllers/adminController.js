const UserModel = require("../models/userModel.js")
const AuthModel = require("../models/authModel.js")

/**
 *  Get user profile from Clerk
 * @param {*} req 
 * @param {*} res 
 */
const getAllUser = async (req, res) => {
  try {
    const { data, error } = await UserModel.getAllUsers();
    if (error) throw error;
    return res.status(200).json({ code: 200, message: "Success", data: data });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ code: 500, message: "Failed to retrieve users" });
  }
};

/**
 *  Get user profile from Clerk
 * @param {*} req 
 * @param {*} res 
 */
const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await UserModel.getUserById(id);

    if (error) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }

    return res.status(200).json({ code: 200, message: "Success", data: data });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ code: 500, message: "Failed to retrieve user" });
  }
};

/**
 * Update user profile in Clerk
 * @param {*} req 
 * @param {*} res 
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, first_name, last_name, job_title, company_id, role } = req.body;

    // Update User in Clerk (Optional)
    let updateParam = {};
    if (username) updateParam.username = username;
    if (password) updateParam.password = password;
    if (Object.keys(updateParam).length > 0) {
      await AuthModel.updateUser(id, updateParam);
    }

    // Update email of user in Clerk (Optional)
    if (email) {
      const userResponse = await AuthModel.getUser(id);
      await AuthModel.updateEmail(id, userResponse?.primaryEmailAddressId, email);     
    }
    
    // Update User in Supabase
    const { data, error } = await UserModel.updateUserById(id, { email, first_name, last_name, job_title, company_id, role });
    if (error) throw error;
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }

    // Success
    return res.status(200).json({
      code: 200,
      message: "Profile updated successfully",
    });
  } catch (error) {
    let errorMessage = error.message;
    if(error?.errors && Array.isArray(error.errors)) errorMessage = error.errors[0].message;

    console.error("Error updating user profile:", error);
    return res.status(500).json({ code: 500, message: "Failed to update user profile", error: errorMessage });
  }
};

const deleteUser = async(req, res)=> {
  try {
      const { id } = req.params;
  
      // Remove an acocunt in Clerk
      await AuthModel.removeUser(id);

      // Delete the user in Supabase along
      const { error } = await UserModel.deleteUser(id);
      if (error) throw error;
  
      // Success
      return res.status(200).json({
        code: 200,
        message: "User deleted successfully",
      });
  
    } catch (error) {
      let errorMessage = error.message;
      if(error?.errors && Array.isArray(error.errors)) errorMessage = error.errors[0].message;
  
      console.error("Error deleting user:", error);
      return res.status(500).json({
        code: 500,
        message: "Delete failed",
        error: errorMessage,
      });
    }
}

module.exports = { getAllUser, getUser, updateUser, deleteUser };
