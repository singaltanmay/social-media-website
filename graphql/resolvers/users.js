const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {UserInputError} = require('apollo-server')

const User = require('../../models/User');
const {SECRET_KEY} = require('../../config')
const {validateRegisterInput, validateLoginInput} = require('../../util/validators')

function generateToken(user) {
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    }, SECRET_KEY, {expiresIn: '1h'});
}

module.exports = {
    Mutation: {
        async login(_, {username, password}) {
            const {errors, valid} = validateLoginInput(username, password);

            if (!valid) {
                throw new UserInputError('Errors', {errors});
            }

            const user = await User.findOne({username});

            if (!user) {
                const errx = 'User not found!'
                errors.general = errx;
                throw new UserInputError(errx, {errors});
            }

            const isMatch = bcrypt.compare(password, user.password);
            if (!isMatch) {
                const errx = 'Invalid credentials!'
                errors.general = errx;
                throw new UserInputError(errx, {errors});
            }

            const token = generateToken(user);
            return {
                ...user._doc,
                id: user.id,
                token
            }
        },
        async register(_, {registerInput: {username, password, confirmPassword, email}}, context, info) {

            const {errors, valid} = validateRegisterInput(username, email, password, confirmPassword)

            if (!valid) {
                throw new UserInputError('Errors', {errors});
            }

            const oldUser = await User.findOne({username});
            if (oldUser) {
                throw new UserInputError('Username is taken', {
                    errors: {
                        username: "This username is taken"
                    }
                })
            }

            password = await bcrypt.hash(password, 12)

            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            });

            const res = await newUser.save();

            const token = generateToken(res);

            return {
                ...res._doc,
                id: res.id,
                token
            }
        }
    }
}