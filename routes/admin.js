const express = require("express");
const router = express.Router();
const AdminModel = require("../models/admin.model");
const ProductsModel = require("../models/products.model");
const verifyToken = require("../middlewares/verifyToken");
// const bcrypt = require("bcrypt");
const authMiddleware = require('../middlewares/auth');
const adminController = require('../controllers/admin.controller');
const { readEmailTemplate, sendEmail } = require('../templates/mailsender');
const { templateUtils } = require("../utils/template");

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
    if (user) {
      if (password !== user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
    }
    // else {
    // Compare hashed passwords for non-superadmin users
    //   bcrypt.compare(password, user.password, (err, passwordMatch) => {
    //     if (err) {
    //       return res.status(500).json({ message: "Internal server error" });
    //     }

    //     if (!err && !passwordMatch) {
    //       return res.status(401).json({ message: "Invalid email or password" });
    //     };
    //   });
    // }

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

router.get("/getusers", async (req, res) => {
  try {
    const users = await AdminModel.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new user
router.post('/users/new', adminController.createUser);

// Update a user
router.put('/users/id', adminController.updateUser);

// Delete a user by ID
router.delete('/users/:id', adminController.deleteUser);

router.get("/orders", async (req, res) => {
  try {
    const orders = await ProductsModel.getAllOrders();
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/orders/:orderId", async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const deletedOrderInfo = await ProductsModel.getOrderById(orderId);

    // Delete associated products first
    let productsDeleted = await ProductsModel.deleteOrder(orderId);

    if (productsDeleted) {
      const replacements = {
        from: `"System HDP" <noreply@heavydutypub.com>`,
        subject: 'An order with id: ' + orderId + ' was deleted'
      };

      await sendEmail("ceo@heavydutypub.com", replacements.from, replacements.subject, `An order with id: ${orderId} was deleted.\n\nOrder Details:\n${JSON.stringify(deletedOrderInfo, null, 2)}`);

      res
        .status(200)
        .json({ message: "Order and associated products deleted successfully" });
    }
  } catch (error) {
    console.error("Error deleting order and associated products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/orders/:orderId/status", async (req, res) => {
  const orderId = req.params.orderId;
  const newStatus = req.body.status;

  try {
    // Update order status
    const updatedOrder = await ProductsModel.updateOrderStatus(orderId, newStatus);

    // Get updated order details
    const order = await ProductsModel.getOrderById(orderId);
    console.error('error', order);

    // Prepare email replacements
    const replacements = {
      name: order.customer_name,
      from: `"Billing Team" <billing@heavydutypub.com>`,
      address: order.address,
      order_date: templateUtils.formatTimestamp(order.order_date),
      quantity: order.quantity,
      total_price: templateUtils.formatAmount(order.total_price),
      status: order.status,
      products: order.products.map(p => `${p.name} ${p.qty} x ${templateUtils.formatAmount(p.price)}`).join('\n'),
      reply: "Your order has been updated"
    };

    // Read email template and send emails
    readEmailTemplate("updateorder.template.html", replacements)
      .then(async data => {
        // send to user's email
        const userMail = await sendEmail(order.email, replacements.from, "Your Order has been updated", data.html);

        // Check if email to user was sent successfully
        if (userMail) {
          // Respond with success
          res.status(200).json({ ...updatedOrder, message: "Order updated successfully" });
        } else {
          // Respond with partial success or failure
          res.status(500).json({ message: "Error sending email to user" });
        }
      })
      .catch(error => {
        console.error('Error reading email template or sending email to user:', error);
        // Respond with failure
        res.status(500).json({ message: "Error processing order update" });
      });
  } catch (error) {
    console.error("Error updating order status:", error);
    // Respond with failure
    res.status(500).json({ message: "Error updating order status", error: error });
  }
});


module.exports = router;