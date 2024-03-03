const express = require("express");
const router = express.Router();
const productsModel = require("../models/products.model");
const defaultEmail = "billing@heavydutypub.com";
const EmailTransporter = require("../config/smtp");
const { readEmailTemplate, sendEmail } = require('../templates/mailsender');
const { templateUtils } = require("../utils/template");

// Send email function
const sendOrderEmail = async (to, subject, html) => {
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
      const filename = "order.template.html",
        replacements = {
          name: order.customer_name,
          from: `"Billing Team" <billing@heavydutypub.com>`,
          address: req.body.address,
          email: req.body.email,
          order_date: templateUtils.formatTimestamp(req.body.order_date),
          phone: req.body.phone,
          quantity: req.body.quantity,
          total_price: templateUtils.formatAmount(req.body.total_price),
          status: req.body.status,
          reply: ""
        };

      readEmailTemplate(filename, replacements)
        .then(async data => {
          // send to billing email
          const billingTeamEmail = await sendEmail("billing@heavydutypub.com", replacements.from, "New Order Notification", data.html);

          // send to user's email
          const userMail = await sendEmail(replacements.email, replacements.from, "Order Confirmation", data.html);

          // Check if emails were sent successfully
          if (billingTeamEmail && userMail) {
            res.status(200).json({ message: "Order placed successfully", status: 200 });
          } else {
            // If emails fail to send, delete the order
            deleteOrderAndProducts(orderId); // Assuming there's an order ID available
            res.status(500).json({ message: "Failed to send order confirmation emails" });
          }
        })
        .catch(error => {
          console.error('Error reading email template:', error);
        });
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

// get orders
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

// get orders by id
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

// contact form
router.post("/contact", async function (req, res, next) {
  try {
    const filename = "default.template.html",
      replacements = {
        name: req.body.name,
        from: `"Support (Heavy Duty Pub)" <support@heavydutypub.com>`,
        subject: req.body.subject,
        message: req.body.message,
        email: req.body.email,
        reply: ""
      };

    readEmailTemplate(filename, replacements)
      .then(async data => {
        // send to contact email
        const contactMail = await sendEmail("support@heavydutypub.com", replacements.from, "New message", data.html);
        if (contactMail) {
          console.log("Email sent successfully to support@heavydutypub.com");
          res.status(200).json({ message: 'Message sent successfully', status: 200 });

          // send to user's email
          const userMail = await sendEmail(replacements.email, replacements.from, "We'll get in touch", data.html);
          if (userMail) console.log("Email sent successfully to " + replacements.email);
        }
        else console.error("Couldn't send email to support@heavydutypub.com", contactMail.error);
      })
      .catch(error => {
        console.error('Error reading email template:', error);
      });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

module.exports = router;