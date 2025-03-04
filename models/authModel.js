const clerkClient = require("../config/clerkClient.js");

// interface ClerkAccount {
//   username: string;
//   email: string;
//   password: string;
// }

/**
 * Create user in Clerk
 * @param username
 * @param email
 * @param password
 * @returns User || null
 */
const signUpUser = async (username, email, password) => {
    const data = await clerkClient.users.createUser({
        username: username,
        emailAddress: [email],
        password,
    })
    return data;
};

/**
 * Get user in Clerk
 * @param userId
 * @returns {*}
 */
const getUser = async (userId) => {
    const data = await clerkClient.users.getUser(userId);
    return data;
};

/**
 * Update user account in Clerk
 * @param userId
 * @param `{ username, password }`
 * @returns {*}
 */
const updateUser = async (userId, updateParam) => {
    const data = await clerkClient.users.updateUser(userId, updateParam);
    return data;
};

/**
 * Update primary email of user account in Clerk
 * @param emailId
 * @returns {*}
 */
const updateEmail = async (userId, emailId, newEmailAddress) => {
    // Bind new email to user
    const createResponse = await clerkClient.emailAddresses.createEmailAddress({
        userId: userId,
        emailAddress: newEmailAddress,
        primary: true,
        verified: true,
      })
      
    // Remove old email
    const deleteResponse = await clerkClient.emailAddresses.deleteEmailAddress(emailId);
    return createResponse;
};

/**
 * Change password of account in Clerk
 * @param userId
 * @returns {*}
 */
const changePassword = async (userId, newPassword) => {
    const data = await clerkClient.users.updateUser(userId, { password: newPassword })
    return data;
};

/**
 * Remove user in Clerk
 * @param userId
 * @returns {*}
 */
const removeUser = async (userId) => {
    const data = await clerkClient.users.deleteUser(userId)
    return data;
};

/**
 * Create a user session
 * @param session_id
 * @returns {*}
 */
const createSession = async (session_id, template) => {
    const data = await clerkClient.sessions.getToken(
        session_id,
        template
    );    
    return data;
};

/**
 * Fetch user session by session id
 * @param session_id
 * @returns {*}
 */
const getSession = async (session_id) => {
    const data = await clerkClient.sessions.getSession(
        session_id,
    );    
    return data;
};


/**
 * Fetch user by email from Clerk
 * @param email
 * @returns `{ data[] } || {} || null`
 */
const getUserList = async (email) => {
    const data = await clerkClient.users.getUserList({ emailAddress: [email] });
    return data;
};

module.exports = { signUpUser, getUser, updateUser, updateEmail, changePassword, removeUser, createSession, getSession, getUserList };