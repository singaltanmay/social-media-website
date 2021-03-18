const postResolvers = require('./posts')
const userResolvers = require('./users')

exports = {
    Query:{
        ...postResolvers.Query
    }
}