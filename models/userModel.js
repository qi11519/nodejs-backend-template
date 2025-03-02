const supabaseClient = require("../config/supabase.js");

// interface User {
//   id: string;
//   user_id: string;
//   email: string;
//   first_name: string | null;
//   last_name: string | null;
//   job_title: string | null;
//   company_id: string;
//   role: "user" | "sender" | "admin" | "superadmin";
//   created_at: string;
//   updated_at: string;
// }

/**
 * Fetch a user by user_id from Supabase
 * @param userId - The Clerk User
 * @returns User || null
 */
const createUser = async (newUser) => { 
  const { data, error } = await supabaseClient
    .from("User")
    .insert([
      {
        user_id: newUser.id,
        email: newUser.emailAddresses[0].emailAddress,
        role: "user"
      },
    ]);

  return { data, error };
};

/**
 * Fetch a user by user_id from Supabase
 * @param userId - The Clerk user_id
 * @returns User || null
 */
const getUserById = async (user_id) => {
  const { data, error } = await supabaseClient
    .from("User")
    .select("*")
    .eq("user_id", user_id)
    .limit(1)
    .maybeSingle();
  
  return { data, error };
};

/**
 * Update a user profile in Supabase
 * @param user_id - The Clerk user_id
 * @param updates - { first_name, last_name, ...}
 * @returns User || null
 */
const updateUserById = async (user_id, updates) => {
  const { data, error } = await supabaseClient
    .from("User")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", user_id)
    .select()
    .maybeSingle();

  return { data, error };
};

/**
 * Get all users
 * @returns User[]
 */
const getAllUsers =  async () => {
    const { data, error } = await supabaseClient
        .from("User")
        .select("*");

    return { data, error };
}

module.exports = { createUser, getUserById, updateUserById, getAllUsers };