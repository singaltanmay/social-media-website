const {UserInputError, AuthenticationError} = require('apollo-server')

const Post = require('../../models/Post')
const checkAuth = require('../../util/checkAuth')

module.exports = {
    Mutation : {
        async createComment(_, {postId, body}, context){
            const {username} = checkAuth(context);
            if(!body || body.trim() === ''){
                 throw new UserInputError('Empty comment', {
                     errors: {
                         body: 'Comment body must not be empty'
                     }
                 })
            }

            const post = await Post.findById(postId);
            if (post) {
                const newComment = {
                    body,
                    username,
                    createdAt: new Date().toISOString()
                }
                post.comments.unshift(newComment)
                await post.save();
                return post;
            } else {
                throw new UserInputError('Parent post not found', {
                    errors: {
                        body: 'Comment can only be added to a valid Post'
                    }
                })
            }
      },
        async deleteComment(_, {postId, commentId}, context){
            const {username} = checkAuth(context);

            const post = await Post.findById(postId);
            if (post) {
                const commentIndex = post.comments.findIndex(c => c.id === commentId);
                if (commentIndex !== -1 && post.comments[commentIndex].username === username) {
                    post.comments.splice(commentIndex, 1);
                    await post.save();
                    return post;
                } else {
                    throw new AuthenticationError("User not authorized to perform this action");
                }
            } else {
                throw new UserInputError('Parent post not found');
            }
        }
    }
}