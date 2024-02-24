const db = require("../config/db");
const dateFormat = require('date-format')

let model = {
    getPosts: (cb) => {
        return db.query("SELECT * FROM posts", cb);
    },
    getUserPosts: (post, cb) => {
        return db.query("SELECT * FROM posts WHERE author=?", [post.username], cb)
    }, 
    getPost: (id, cb) => {
        return db.query("SELECT * FROM posts WHERE id=?", [id], cb)
    },
    addPost: (input, cb) => {
        let currentDate = dateFormat(new Date(), 'yyyy-mm-dd h:MM:ss');

        let data = {
            title: input.title,
            cover_image: input.cover_image,
            article: input.article,
            author: input.user,
            created_at: currentDate
        }
        return db.query("INSERT INTO posts SET ?", [data], cb)
    },
    updatePost: (input, cb) => {
        let data = {
            title: input.title,
            cover_image: input.cover_image,
            article: input.article
        }
        return db.query("UPDATE posts SET ? WHERE id=?", [data, input.id], cb)
    },
    deletePost: (id, cb) => {
        return db.query("DELETE FROM posts WHERE id=?", [id], cb);
    }
}

module.exports = model;
