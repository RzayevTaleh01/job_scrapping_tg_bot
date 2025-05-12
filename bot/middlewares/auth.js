module.exports = function isAllowed(userId, allowedUsers) {
    return allowedUsers.includes(userId);
};
