
const db = require("../config/db");

let model = {
    getUsers: (users, cb) => {
        return db.query("SELECT * FROM users", cb);
    },
    getUser: (id, cb) => {
        return db.query("SELECT * FROM users WHERE id=?", [id], cb)
    },
    updateUser: (input, cb) => {
        let data = {
            username: input.username,
            email: input.email,
            password: input.password,
            is_active: input.is_active,            
            read: input.read,
            update: input.update,
            delete: input.delete
        }
        return db.query("UPDATE users SET ? WHERE id=?", [data, input.id], cb)
    },
    deleteUser: (id, cb) => {
        return db.query("DELETE FROM users WHERE id=?", [id], cb);
    }
}

module.exports = model;
