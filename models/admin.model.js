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
          db.query(updateTokenQuery, [token, userId], (error, gotuser) => {
            if (error) {
              reject(error);
              return;
            }
            // Resolve with the user data
            resolve({ ...user, token: user.token ? user.token : token});
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
  createUser: (userData) => {
    return new Promise((resolve, reject) => {
      // Extract username, email, and password from the userData object
      const { username, email, password } = userData;

      // Query to check if the user already exists
      const checkUserQuery = "SELECT * FROM admins WHERE email = ?";
      
      // Execute the query to check if the user already exists
      db.query(checkUserQuery, [email], (error, results) => {
        if (error) {
          reject(error);
          return;
        }

        // Check if a user with the provided email already exists
        if (results.length > 0) {
          reject({ message: 'User with this email already exists' });
          return;
        }
        
        // If the user does not exist, proceed to create the new user

        // Query to insert a new user into the database
        const insertUserQuery = "INSERT INTO admins (username, email, password) VALUES (?, ?, ?)";
        
        // Values to be inserted into the query
        const values = [username, email, password];

        // Execute the query to insert the new user
        db.query(insertUserQuery, values, (error, results) => {
          if (error) {
            reject(error);
            return;
          }
          
          // Retrieve the newly created user from the database
          const userId = results.insertId;
          model.getUserById(userId)
            .then(newUser => resolve(newUser))
            .catch(error => reject(error));
        });
      });
    });
  },
  deleteUser: (userId) => {
    return new Promise((resolve, reject) => {
      // Query to delete the user with the specified ID
      const query = "DELETE FROM admins WHERE id = ?";
      
      // Execute the query
      db.query(query, [userId], (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        
        // Check if any rows were affected (user was successfully deleted)
        if (results.affectedRows === 0) {
          reject({ message: "User not found or already deleted" });
          return;
        }
        
        // User successfully deleted
        resolve({ message: "User deleted successfully" });
      });
    });
  },
  updateUser: (userId, userData) => {
    return new Promise((resolve, reject) => {
      // Extract data from userData object
      const { username, email, password } = userData;

      // Query to update user information
      const query = "UPDATE admins SET username = ?, email = ?, password = ? WHERE id = ?";
      
      // Execute the query with the provided data
      db.query(query, [username, email, password, userId], (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        
        // Check if any rows were affected (user was successfully updated)
        if (results.affectedRows === 0) {
          reject({ message: "User not found or no changes made" });
          return;
        }
        
        // User information successfully updated
        resolve({ message: "User information updated successfully" });
      });
    });
  }
};

module.exports = model;
