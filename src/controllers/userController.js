const clerkClient = require("../config/clerkClient.js");
const supabaseClient = require("../config/supabase.js");

/**
 *  Get user profile from Clerk
 * @param {*} req 
 * @param {*} res 
 */
const getProfile = async (req, res) => {
  try {
    const { userId } = req.auth;

    // Query current user from Supabase
    const { data, error } = await supabaseClient
      .from("User")
      .select("*")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

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
 * Update user profile in Clerk
 * @param {*} req 
 * @param {*} res 
 */
const updateProfile = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { first_name, last_name, job_title, company_id } = req.body;
    
    const { data, error } = await supabaseClient
      .from("User")
      .update({
        first_name,
        last_name,
        job_title,
        company_id,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select();

    if (error) throw error;
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }

    // Pass back user (Without id & user id)
    const { id, user_id, ...rest } = data[0];

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

module.exports = { getProfile, updateProfile };
