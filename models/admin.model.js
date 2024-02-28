// admin.model.js
const db = require("../config/db");
const jwt = require("jsonwebtoken");

const model = {
  loginUser: (email) => {
    return new Promise((resolve, reject) => {
      // Query the database to retrieve the user based on the email
      const query = "SELECT * FROM admins WHERE email = ?";
      db.query(query, [email], (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        // Check if any user matches the provided email
        if (results.length === 0) {
          reject({ message: "Invalid email" });
          return;
        }
        const user = results[0];
        const userId = user.id;

        // Update login_time
        const updateLoginTimeQuery =
          "UPDATE admins SET login_time = CURRENT_TIMESTAMP WHERE id = ?";
        db.query(updateLoginTimeQuery, [userId], (error) => {
          if (error) {
            reject(error);
            return;
          }
          // Generate JWT token
          const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
            expiresIn: "1h",
          });
          // Save the token to the database
          const updateTokenQuery = "UPDATE admins SET token = ? WHERE id = ?";
          db.query(updateTokenQuery, [token, userId], (error) => {
            if (error) {
              reject(error);
              return;
            }
            // Resolve with the user data
            resolve(user);
          });
        });
      });
    });
  },
  getUserById: (userId) => {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM admins WHERE id = ?";
      db.query(query, [userId], (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        if (results.length === 0) {
          reject({ message: "User not found" });
          return;
        }
        resolve(results[0]);
      });
    });
  },
  logout: (userId) => {
    return new Promise((resolve, reject) => {
      // Update the token to null for the user with the given userId
      const updateTokenQuery = "UPDATE admins SET token = NULL WHERE id = ?";
      db.query(updateTokenQuery, [userId], (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  },
  getAllUsers: () => {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM admins";
      db.query(query, (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(results);
      });
    });
  },
};

module.exports = model;
