const express = require("express");
const router = express.Router();
const AdminModel = require("../models/admin.model");
const verifyToken = require("../middlewares/verifyToken");
const bcrypt = require("bcrypt");
const authMiddleware = require('../middlewares/auth');

router.post("/login", async function (req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if the user exists in the database
    const user = await AdminModel.loginUser(email);

    // Verify password
    if (user.level === 'superadmin') {
      if (password !== user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
    } else {
      // Compare hashed passwords for non-superadmin users
      bcrypt.compare(password, user.password, (err, passwordMatch) => {
        if (err) {
          return res.status(500).json({ message: "Internal server error" });
        }

        if (!passwordMatch) {
          return res.status(401).json({ message: "Invalid email or password" });
        }
      });
    }

    // Proceed with authentication for superadmin and non-superadmin users
    res.status(200).json({
      status: 200,
      message: "Authentication successful",
      user: user
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/protected", verifyToken, function (req, res) {
  res.status(200).json({ message: "Protected route accessed successfully", user: req.user });
});

router.use(authMiddleware.authenticateToken);

router.get('/getuser/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await AdminModel.getUserById(userId);
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Failed to fetch user by ID' });
  }
});

router.post("/logout", async (req, res) => {
  try {
    // Call the logout function from the model
    await AdminModel.logout(req.body.id);
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Failed to logout", error: error.message });
  }
});

module.exports = router;