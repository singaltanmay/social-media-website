const {AuthenticationError} = require('apollo-server');
const jwt = require('jsonwebtoken');

const {SECRET_KEY} = require('../config')

module.exports = (context) => {
    const authHeader = context.req.headers.authorization;
    if (authHeader) {
        let token = authHeader.split('Bearer ');
        token = token[1];
        if (token) {
            try {
                return jwt.verify(token, SECRET_KEY);
            } catch (e) {
              throw new AuthenticationError("Invalid or expired token");
            }
        }
        throw new Error("Authentication token must be in the format 'Bearer [token]'")
    }
    throw new Error("Authorization header must be provided")
}