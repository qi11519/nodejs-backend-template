const clerkClient = require("../config/clerkClient.js");

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
 * Fetch user by email from Clerk
 * @param email
 * @returns `{ data[] } || {} || null`
 */
const createSession = async (session_id, template) => {
    const data = await clerkClient.sessions.getToken(
        session_id,
        template
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

module.exports = { signUpUser, createSession, getUserList };