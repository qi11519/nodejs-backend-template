const clerkClient = require("../config/clerkClient.js");
const supabaseClient = require("../config/supabase.js");

/**
 *  Get user profile from Clerk
 * @param {*} req 
 * @param {*} res 
 */
const getAllUser = async (req, res) => {
  try {
    const { data, error } = await supabaseClient.from("User").select("*");

    if (error) throw error;
    res.json({ code: 200, message: "Success", data: data });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ code: 500, message: "Failed to retrieve users" });
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
    const { data, error } = await supabaseClient.from("User").select("*").eq("user_id", id).single();

    if (error) {
        return res.status(404).json({ code: 404, message: "User not found" });
    }

    res.json({ code: 200, message: "Success", data });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ code: 500, message: "Failed to retrieve user" });
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
    if (email) updateParam.emailAddress = email;
    if (password) updateParam.password = password;

    if (Object.keys(updateParam).length > 0) {
      const updatedUser = await clerkClient.users.updateUser(id, updateParam);
    }
    
    // Update User in Supabase
    const { data, error } = await supabaseClient
      .from("User")
      .update({
        first_name,
        last_name,
        job_title,
        company_id,
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", id)
      .select();

    if (error) throw error;
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }

    // Success
    res.json({
      code: 200,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(400).json({ code: 400, message: "Failed to update user profile", error: error.message });
  }
};

module.exports = { getAllUser, getUser, updateUser };
