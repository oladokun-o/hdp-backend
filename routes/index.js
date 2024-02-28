const express = require("express");
const router = express.Router();
const productsModel = require("../models/products.model");
const defaultEmail = "billing@heavydutypub.com";
const EmailTransporter = require("../config/smtp");

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    await EmailTransporter.sendMail({
      from: defaultEmail,
      to: to,
      subject: subject,
      html: html,
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

// Create order
router.post("/orders/new", async function (req, res, next) {
  let products = req.body.products.map(r => {
      return {
          product_id: r.product_id,
          name: r.name,
          qty: r.qty,
          amount: r.amount,
          price: r.price
      }
  }),
  order = {
      customer_name: req.body.customer_name,
      address: req.body.address,
      email: req.body.email,
      order_date: req.body.order_date,
      phone: req.body.phone,
      quantity: req.body.quantity,
      total_price: req.body.total_price,
      status: req.body.status,
  };

  // Create order logic here
  productsModel.createOrder(order, products)
      .then((orderId) => {
          SendMails(orderId); // Call SendMails after the order is successfully created
      })
      .catch(error => {
          res.status(500).json({ message: "Failed to create order", error: error });
      });

  // Define SendMails as an async function
  async function SendMails(orderId) {
      try {
          // Send order confirmation email to customer
          const customerEmailSubject = "Order Confirmation";
          const customerEmailHTML = `<p>Dear ${order.customer_name},</p>
          <p>Your order has been received successfully.</p>
          <p>Order Details:</p>
          <ul>
              ${products.map(product => `<li>${product.name}: ${product.qty}</li>`).join("")}
          </ul>
          <p>Total Price: ${order.total_price}</p>
          <p>Thank you for shopping with us.</p>`;
          const customerEmailSent = await sendEmail(order.email, customerEmailSubject, customerEmailHTML);

          // Send order notification email to billing admin
          const adminEmailSubject = "New Order Notification";
          const adminEmailHTML = `<p>Hello Admin,</p>
          <p>A new order has been received. Please check the dashboard for more details.</p>`;
          const adminEmailSent = await sendEmail(defaultEmail, adminEmailSubject, adminEmailHTML);

          // Check if emails were sent successfully
          if (customerEmailSent && adminEmailSent) {
              res.status(200).json({ message: "Order placed successfully", status: 200 });
          } else {
              // If emails fail to send, delete the order
              deleteOrderAndProducts(orderId); // Assuming there's an order ID available
              res.status(500).json({ message: "Failed to send order confirmation emails" });
          }
      } catch (error) {
          // If any error occurs while sending emails, delete the order
          deleteOrderAndProducts(orderId); // Assuming there's an order ID available
          res.status(500).json({ message: "Failed to send order confirmation emails", error: error });
      }
  }

  // Function to delete the order and associated products
  async function deleteOrderAndProducts(orderId) {
      try {
          // Delete order and associated products here
          await productsModel.deleteOrder(orderId);
      } catch (error) {
          console.error("Failed to delete order and products:", error);
      }
  }
});

//get orders
router.get("/orders", async function (req, res, next) {
  const orders = await productsModel.getOrders();
  if (orders.length) {
    res.status(200).json({
      code: 200,
      message: "Success",
      data: orders,
    });
  } else {
    res.status(200).json({
      code: 200,
      message: "No orders found!",
      data: [],
    });
  }
});

//get orders by id
router.get("/orders/:id", async function (req, res, next) {
  let orderIds = req.params.id;
  //convert to array
  orderIds = orderIds.split(",");
  //get orders and return as an array of all orders
  let orders = [];
  for (let i = 0; i < orderIds.length; i++) {
    const order = await productsModel.getOrdersById(orderIds[i]);
    if (order.length) {
      orders.push(order[0]);
    }
  } //end for loop
  if (orders.length) {
    res.status(200).json({
      code: 200,
      message: "Success",
      data: orders,
    });
  } else {
    res.status(200).json({
      code: 200,
      message: "No orders found!",
      data: [],
    });
  }
});

module.exports = router;