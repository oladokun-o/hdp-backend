var express = require("express");
var router = express.Router();
const authModel = require("../models/index.model");
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

// Create order route
router.post("/orders/new", async function (req, res, next) {
  let products = req.body.products.map(r => {
      return {
          product_id: r.product_id,
          name: r.name,
          qty: r.qty,
          amount: r.amount
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



//update order
router.put("/orders/:id", async function (req, res, next) {
  let payload = {
    newOrderStatus: req.body.newOrderStatus,
  };
  let type = req.body.type,
    order = req.body.order;

  if (type && type === 'confirm') {
    const vendor = await authModel.findVendorByStoreid(order.storeid);
    if (vendor.length) {
      //check if vendor wallet balance is less than order amount
      if (vendor[0].walletBalance <= order.paymentAmount) {
        //decline confirmation
        res.status(500).json({
          code: 500,
          message: "Insufficient wallet balance! Please top up.",
          data: [],
        });
      } else {
        //deduct wallet balance from vendor
        let newBalance = vendor[0].walletBalance - order.paymentAmount;
        const updatedVendor = await authModel.findAndUpdate(
          {
            walletBalance: newBalance,
          }
          , vendor[0].id);

        if (updatedVendor.affectedRows > 0) {
          //update order status
          const updatedorder = await productsModel.updateOrder(payload, order.orderId);
          if (updatedorder.affectedRows > 0) {
            res.status(200).json({
              code: 200,
              message: "Success",
              data: {
                id: req.params.id,
                payload: req.body,
              },
            });
          } else {
            res.status(500).json({
              code: 500,
              message: "Update order failed!",
              data: [],
            });
          }
        } else {
          console.log(updatedVendor, 'updatedVendor');
          res.status(500).json({
            code: 500,
            message: "An error occured! Please try again later.",
            data: [],
          });
        }
      }
    } else {
      res.status(500).json({
        code: 500,
        message: "An error occured! Please try again later.",
        data: [],
      });
    }
  } else {
    const order = await productsModel.updateOrder(payload, req.params.id);
    if (order.affectedRows > 0) {
      res.status(200).json({
        code: 200,
        message: "Success",
        data: {
          id: req.params.id,
          payload: payload,
        },
      });
    } else {
      res.status(500).json({
        code: 500,
        message: "Update order failed!",
        data: [],
      });
    }
  }

});

//delete order
router.delete("/orders/:id", async function (req, res, next) {
  const order = await productsModel.deleteOrder(req.params.id);
  if (order.affectedRows > 0) {
    res.status(200).json({
      code: 200,
      message: "Success",
      data: {
        id: req.params.id,
      },
    });
  } else {
    res.status(500).json({
      code: 500,
      message: "Delete order failed!",
      data: [],
    });
  }
});

//complete order
router.post("/orders/:id/settle", async function (req, res, next) {
  try {
    let orders = req.body.orders;

    //deduct wallet balance from each user
    orders.forEach(async (order) => {
      const user = await authModel.findAdminById(order.userId);
      if (user.length) {
        // console.log(user[0].walletBalance, "wallet balance");
        let newBalance = user[0].walletBalance - order.paymentAmount;
        user[0].walletBalance = newBalance;
        const updatedUser = await authModel.updateAdmin(user[0], user[0].id);
        if (updatedUser.affectedRows > 0) {
          // console.log("user wallet balance updated");
          //deduct wallet balance from each vendor and add to their sales and profit balance
          const vendor = await authModel.findById(order.vendorId);
          if (vendor.length) {
            //send email to vendor of new order
            let html = `
                        <p>Dear ${vendor[0].storename},</p>
                        <p>You have a new order!</p>
                        <p>Order quanity: ${order.productNo}</p>
                        <p>Order amount: ${order.paymentAmount}</p>
                        <a href="https://www.shoppingplatform.org/#/orders">View order</a>
                        <p>Thank you.</p>
                        <p>Regards,</p>
                        <p>Happy Sales! :)</p>
            `;
            EmailTransporter.sendMail(
              {
                from: defaultEmail,
                to: vendor[0].email,
                subject: "New order!",
                html: html,
              },
              (err, info) => {
                if (err) {
                  // console.log(err);
                } else {
                  // console.log(info);
                }
              }
            );
            //deduct amount from vendor wallet balance
            let newBalance = vendor[0].walletBalance// - order.paymentAmount;
            vendor[0].walletBalance = newBalance;
            // vendor[0].sales += order.productNo;

            //update vendor
            const updatedVendor = await authModel.findAndUpdate(
              vendor[0],
              vendor[0].id
            );
            if (updatedVendor.affectedRows > 0) {
              // console.log("vendor wallet balance updated");
              res.status(200).json({
                code: 200,
                message: "Settle order successful!",
                data: [],
              });
            } else {
              // console.log("vendor wallet balance update failed");
              res.status(500).json({
                code: 500,
                message: "Settle order failed!",
                data: [],
              });
            }
          } else {
            // console.log("vendor not found");
            res.status(500).json({
              code: 500,
              message: "Settle order failed!",
              data: [],
            });
          }
        } else {
          // console.log("user wallet balance update failed");
          res.status(500).json({
            code: 500,
            message: "Settle order failed!",
            data: [],
          });
        }
      } else {
        // console.log("user not found");
        res.status(500).json({
          code: 500,
          message: "Settle order failed!",
          data: [],
        });
      }
    });
  } catch (error) { }
});

module.exports = router;