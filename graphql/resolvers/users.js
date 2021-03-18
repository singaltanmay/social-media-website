const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { UserInputError } = require('apollo-server')

const User = require('../../models/User');
const { SECRET_KEY } = require('../../config')

module.exports = {
    Mutation : {
        async register(_,{registerInput : {username, password, confirmPassword, email}}, context, info){

            const oldUser = await User.findOne({username});
            if(oldUser){
                throw new UserInputError('Username is taken', {
                    errors : {
                        username : "This username is taken"
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
            
            const token = jwt.sign({
                id : res.id,
                email : res.email,
                username: res.username 
            }, SECRET_KEY, {expiresIn: '1h'});

            return {
                ...res._doc,
                id: res.id,
                token
            }
        }
    }
}