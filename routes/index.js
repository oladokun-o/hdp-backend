var express = require("express");
var router = express.Router();
const productsModel = require("../models/products.model");
const authModel = require("../models/index.model");
const defaultEmail = "team@shoppingplatform.org";
const adminEmail = "shoppingplatform9@gmail.com";
const nodemailer = require("nodemailer");

// Create a transporter using Gmail SMTP
const EmailTransporter = nodemailer.createTransport({
  host: "server266.web-hosting.com",
  port: 465,
  secure: true,
  auth: {
    user: "team@shoppingplatform.org", // Replace with your Gmail email address
    pass: "KareyShopping2023", // Replace with your Gmail password or an App Password
  },
});

router.get("/products", async function (req, res, next) {
  //get all products
  const products = await productsModel.getAllProducts();
  if (products.length) {
    products.forEach((product) => {
      product.sub_img = JSON.parse(product.sub_img);
      product.attribute = JSON.parse(product.attribute);
      product.reviewsList = JSON.parse(product.reviewsList);
    });
    res.status(200).json({
      code: 200,
      message: "Success",
      data: products,
    });
  } else {
    res.status(200).json({
      code: 200,
      message: "No products found!",
      data: [],
    });
  }
});

router.get("/vendor/products", async function (req, res, next) {
  //get all products
  const products = await productsModel.getAllProductsForVendors();
  if (products.length) {
    // console.log(products);
    products.forEach((product) => {
      product.sub_img = JSON.parse(product.sub_img);
      product.attribute = JSON.parse(product.attribute);
      product.reviewsList = JSON.parse(product.reviewsList);
    });

    res.status(200).json({
      code: 200,
      message: "Success",
      data: products,
    });
  } else {
    res.status(200).json({
      code: 200,
      message: "No products found!",
      data: [],
    });
  }
});

router.get("/products/:id", async function (req, res, next) {
  //get product by id
  const product = await productsModel.getProductById(req.params.id);
  if (product.length) {
    product[0].sub_img = JSON.parse(product[0].sub_img);
    product[0].attribute = JSON.parse(product[0].attribute);
    product[0].reviewsList = JSON.parse(product[0].reviewsList);
    res.status(200).json({
      code: 200,
      message: "Success",
      data: product[0],
    });
  } else {
    res.status(500).json({
      code: 500,
      message: "Product with id not found!",
      data: [],
    });
  }
});

router.post("/products", async function (req, res, next) {
  let payload = {
    ...req.body,
    sub_img: JSON.stringify(req.body.sub_img),
    attribute: JSON.stringify(req.body.attribute),
    reviewsList: JSON.stringify(req.body.reviewsList)
  };
  // console.log(payload.attribute);
  const product = await productsModel.addProduct(payload);
  if (product.affectedRows > 0) {
    res.status(200).json({
      code: 200,
      message: "Success",
      data: {
        id: product.insertId,
        payload: payload,
      },
    });
  } else {
    res.status(500).json({
      code: 500,
      message: "Create product failed!",
      data: [],
    });
  }
});

router.get("/vendors/active", async function (req, res, next) {
  //get all vendors
  const vendors = await productsModel.getActiveVendors();
  if (vendors.length) {
    res.status(200).json({
      code: 200,
      message: "Success",
      data: vendors,
    });
  } else {
    res.status(500).json({
      code: 500,
      message: "No vendors found!",
      data: [],
    });
  }
});

router.get("/vendors", async function (req, res, next) {
  //get all vendors
  const vendors = await productsModel.getAllVendors();
  if (vendors.length) {
    res.status(200).json({
      code: 200,
      message: "Success",
      data: vendors,
    });
  } else {
    res.status(500).json({
      code: 500,
      message: "No vendors found!",
      data: [],
    });
  }
});

router.post("/vendors/apply", async function (req, res, next) {
  //generate storeid and check against any existing vendor with the same storeid
  const generatedId = () => Math.floor(100000 + Math.random() * 900000);
  var storeId = generatedId();
  let payload = {
    img: req.body.img,
    storename: req.body.storename,
    mobile: req.body.phone,
    tid: req.body.tid,
    front_img: req.body.front_img,
    reverse_img: req.body.reverse_img,
    address: req.body.address,
    category: req.body.category,
    approve_status: 1,
    walletPassword: req.body.walletPassword,
    role: "vendor",
    storeId: storeId,
    fullname: req.body.fullname,
    id: req.body.id,
    email: req.body.email,
  };
  const updateVendorApplication = await authModel.findAndUpdate(
    payload,
    req.body.id
  );

  if (updateVendorApplication.affectedRows > 0) {
    //send email to vendor that they are approved
    let html = `
                <p>Dear ${req.body.username},</p>
                <p>Your vendor account has been approved!.</p>
                <p>Thank you.</p>
                <p>Regards,</p>
                <p>Happy Sales! :)</p>`;
    EmailTransporter.sendMail(
      {
        from: defaultEmail,
        to: req.body.email,
        subject: "Vendor account approved!",
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
    res.status(200).json({
      code: 200,
      message: "Success",
      data: {
        id: req.params.id,
        payload: payload,
      },
    });
  } else {
    // console.log(updateVendorApplication);
    res.status(500).json({
      code: 500,
      message: "Applcation failed! Please try again later.",
      data: [],
    });
  }
});

router.get("/vendors/:id", async function (req, res, next) {
  //get vendor by id
  const vendor = await productsModel.getVendorById(req.params.id);
  if (vendor.length) {
    res.status(200).json({
      code: 200,
      message: "Success",
      data: vendor[0],
    });
  } else {
    res.status(500).json({
      code: 500,
      message: "Vendor with id not found!",
      data: [],
    });
  }
});

router.get("/vendors/store/:id", async function (req, res, next) {
  //get vendor by storeid
  const vendor = await productsModel.getVendorByStoreId(req.params.id);
  if (vendor.length) {
    res.status(200).json({
      code: 200,
      message: "Success",
      data: vendor[0],
    });
  } else {
    res.status(500).json({
      code: 500,
      message: "Vendor with id not found!",
      data: [],
    });
  }
});

router.post("/vendors/:id/list", async function (req, res, next) {
  //get listed products by vendor id and update listed_products
  const vendor = await productsModel.getVendorById(req.body.vendorId);
  if (vendor.length) {
    let listed_products = JSON.parse(vendor[0].listed_products);
    listed_products = listed_products.includes(req.body.productId)
      ? listed_products
      : [...listed_products, req.body.productId];
    // console.log(listed_products);
    const updatedVendor = await productsModel.AddProductIdToVendorsListed(
      JSON.stringify(listed_products),
      req.body.vendorId
    );
    if (updatedVendor.affectedRows > 0) {
      res.status(200).json({
        code: 200,
        message: "Success",
        data: {
          id: req.params.id,
          payload: listed_products,
        },
      });
    } else {
      res.status(500).json({
        code: 500,
        message: "Listing failed!",
        data: [],
      });
    }
  } else {
    res.status(500).json({
      code: 500,
      message: "Vendor with id not found!",
      data: [],
    });
  }
});

router.post("/vendors/:id/unlist", async function (req, res, next) {
  //get listed products by vendor id and update listed_products
  const vendor = await productsModel.getVendorById(req.body.vendorId);
  if (vendor.length) {
    let listed_products = JSON.parse(vendor[0].listed_products);
    listed_products = listed_products.filter(
      (product) => product !== req.body.productId
    );

    const updatedVendor = await productsModel.AddProductIdToVendorsListed(
      JSON.stringify(listed_products),
      req.body.vendorId
    );
    if (updatedVendor.affectedRows > 0) {
      res.status(200).json({
        code: 200,
        message: "Success",
        data: {
          id: req.params.id,
          payload: listed_products,
        },
      });
    } else {
      res.status(500).json({
        code: 500,
        message: "Unlisting failed!",
        data: [],
      });
    }
  } else {
    res.status(500).json({
      code: 500,
      message: "Vendor with id not found!",
      data: [],
    });
  }
});

router.get("/paymentdetails", async function (req, res, next) {
  //get payment details
  const paymentDetails = await productsModel.getPaymentDetailsFromAdmin();
  if (paymentDetails.length) {
    res.status(200).json({
      code: 200,
      message: "Success",
      data: paymentDetails[0],
    });
  } else {
    res.status(500).json({
      code: 500,
      message: "Payment details not found!",
      data: [],
    });
  }
});

router.post("/user/depositPayment", async function (req, res, next) {
  //send details to all admins email
  let payload = {
    amount: req.body.amount,
    user: req.body.user,
    voucherImg: req.body.voucherImg,
    walletAddress: req.body.walletAddress,
    walletType: req.body.walletType,
  };
  //create email template
  let html = `
                <p>There is a an update from user with id ${payload.user.id}.</p>
                <p>Here are the details:</p>
                <p>Amount: ${payload.amount}</p>
                <p>User id: ${payload.user.id}</p>
                <p>Name: ${payload.user.name}</p>
                <p>User email: ${payload.user.email}</p>
                <p><a href="https://www.shoppingplatform.org/#/mymsg">Approve now</a></p>
                <p>Please check the attachment for the payment voucher.</p>
                <p>Thank you.</p>
                <p>Regards,</p>
                <p>System :)</p>`;
  //send email to all admins
  const admins = await authModel.getAdminByRole("admin");
  if (admins.length) {
    admins.forEach((admin) => {
      EmailTransporter.sendMail(
        {
          from: defaultEmail,
          to: admin.email,
          subject: "New message!",
          html: html,
          attachments: [
            {
              filename: "voucher.png",
              content: payload.voucherImg.split("base64,")[1],
              encoding: "base64",
            },
          ],
        },
        (err, info) => {
          if (err) {
            // console.log(err);
          } else {
            // console.log(info);
          }
        }
      );
    });
    res.status(200).json({
      code: 200,
      message: "Success",
      data: [],
    });
    //create transaction
    let transaction = {
      amount: payload.amount,
      userId: admins[0].id,
      description: "Wallet deposit transaction",
      status: "pending",
      transactionDate: new Date(),
      transactionType: "deposit",
      vendorId: payload.user.id,
      walletType: payload.walletType,
    };
    const newTransaction = await authModel.createWalletTransaction(transaction);
    if (newTransaction.affectedRows > 0) {
      // console.log("transaction created");
    } else {
      // console.log("transaction creation failed");
    }
  } else {
    res.status(500).json({
      code: 500,
      message: "No admins found!",
      data: [],
    });
  }
});

//withdraw payment
router.post("/user/withdrawPayment", async function (req, res, next) {
  let payload = {
    amount: req.body.amount,
    user: req.body.user,
    walletAddress: req.body.walletAddress,
    walletType: req.body.walletType,
  };
  //create email template
  let html = `
                <p>There is a an update from user with id ${payload.user.id} to withdraw.</p>
                <p>Here are the details:</p>
                <p>Amount: ${payload.amount}</p>
                <p>User id: ${payload.user.id}</p>
                <p>Name: ${payload.user.name}</p>
                <p>User email: ${payload.user.email}</p>
                <p>Wallet address: ${payload.walletAddress}</p>
                <p>Thank you.</p>
                <p>Regards,</p>
                <p>System :)</p>`;
  //send email to all admins
  const admins = await authModel.getAllAdmins();
  if (admins.length) {
    admins.forEach((admin) => {
      EmailTransporter.sendMail(
        {
          from: defaultEmail,
          to: admin.email,
          subject: "New message!",
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
    });
    res.status(200).json({
      code: 200,
      message: "Success",
      data: [],
    });

    let transaction = {
      amount: payload.amount,
      userId: admins[0].id,
      description: "Wallet withdraw transaction",
      status: "pending",
      transactionDate: new Date(),
      transactionType: "withdrawal",
      vendorId: payload.user.id,
      walletType: payload.walletType,
    };
    const newTransaction = await authModel.createWalletTransaction(transaction);
    if (newTransaction.affectedRows > 0) {
      // console.log("transaction created");
    } else {
      // console.log("transaction creation failed");
    }
  } else {
    res.status(500).json({
      code: 500,
      message: "No admins found!",
      data: [],
    });
  }
});

//update admin
router.put("/admins/:id", async function (req, res, next) {
  let payload = { ...req.body };
  const admin = await authModel.updateAdmin(payload, req.params.id);
  if (admin.affectedRows > 0) {
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
      message: "Update admin failed!",
      data: [],
    });
  }
});

//update vendor
router.put("/vendors/:id", async function (req, res, next) {
  let payload = { ...req.body };
  // console.log(payload);
  const vendor = await authModel.findAndUpdate(payload, req.params.id);
  if (vendor.affectedRows > 0) {
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
      message: "Update vendor failed!",
      data: [],
    });
  }
});

//update product
router.put("/products/:id", async function (req, res, next) {
  let payload = {
    ...req.body,
    sub_img: JSON.stringify(req.body.sub_img),
    attribute: JSON.stringify(req.body.attribute),
    reviewsList: JSON.stringify(req.body.reviewsList),
  };
  const product = await productsModel.updateProduct(payload, req.params.id);
  if (product.affectedRows > 0) {
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
      message: "Update product failed!",
      data: [],
    });
  }
});

//delete product
router.delete("/products/:id", async function (req, res, next) {
  const product = await productsModel.deleteProduct(req.params.id);
  if (product.affectedRows > 0) {
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
      message: "Delete product failed!",
      data: [],
    });
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

//get orders by vendor id
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

//add order
router.post("/orders", async function (req, res, next) {
  let payload = [...req.body];
  payload.forEach(async (order) => {
    order.paymentTransactionId = Math.floor(100000 + Math.random() * 900000);
    const newOrder = await productsModel.addOrder(order);
    if (newOrder.affectedRows > 0) {
      //don't send email
      res.status(200).json({
        code: 200,
        message: "Success",
        data: {
          id: newOrder.insertId,
          payload: payload,
        },
      });
    } else {
      // console.log(newOrder);
      res.status(500).json({
        code: 500,
        message: "Create order failed!",
        data: [],
      });
    }
  });
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
          const updatedorder= await productsModel.updateOrder(payload, order.orderId);
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

//add deposit to admin walletBalance
router.post("/admins/:id/deposit", async function (req, res, next) {
  let payload = { ...req.body };
  const admin = await productsModel.addDepositToAdminWalletBalance(
    payload.walletBalance,
    req.params.id
  );
  if (admin.affectedRows > 0) {
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
      message: "Add deposit to admin walletBalance failed!",
      data: [],
    });
  }
});

//approve vendor
router.put("/vendors/:id/approve", async function (req, res, next) {
  let payload = {
    // approve_status: 1,
    canlogin: 1,
    denied: 0,
  };
  const vendor = await authModel.findAndUpdate(payload, req.params.id);
  if (vendor.affectedRows > 0) {
    //send email to vendor that they are approved
    let html = `
                <p>Dear ${req.body.username},</p>
                <p>Your vendor account has been approved.</p>
                <p>Thank you.</p>
                <p>Regards,</p>
                <p>Happy Sales! :)</p>`;
    EmailTransporter.sendMail(
      {
        from: defaultEmail,
        to: req.body.email,
        subject: "Vendor account approved!",
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
      message: "Approve vendor failed!",
      data: [],
    });
  }
});

//deny vendor
router.put("/vendors/:id/deny", async function (req, res, next) {
  let payload = {
    approve_status: 0,
    canlogin: 0,
    denied: 1,
  };
  const vendor = await authModel.findAndUpdate(payload, req.params.id);
  if (vendor.affectedRows > 0) {
    //send email to vendor that they are denied
    let html = `
                <p>Dear ${req.body.name},</p>
                <p>Your vendor account has been denied.</p>
                <p>You can contact us for more information.</p>
                <p>Thank you.</p>
                <p>Regards,</p>
                <p>team :)</p>`;
    EmailTransporter.sendMail(
      {
        from: defaultEmail,
        to: req.body.email,
        subject: "Vendor account denied!",
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
      message: "Deny vendor failed!",
      data: [],
    });
  }
});

//update vendor
router.put("/vendors/:id", async function (req, res, next) {
  let payload = { ...req.body };
  const vendor = await authModel.findAndUpdate(payload, req.params.id);
  if (vendor.affectedRows > 0) {
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
      message: "Update vendor failed!",
      data: [],
    });
  }
});

//delete vendor
router.delete("/vendors/:id", async function (req, res, next) {
  const vendor = await authModel.deleteVendor(req.params.id);
  if (vendor.affectedRows > 0) {
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
      message: "Delete vendor failed!",
      data: [],
    });
  }
});

//settle order
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
  } catch (error) {}
});

router.get("/wallet/transactions", async function (req, res, next) {
  //get all transactions
  const transactions = await authModel.getWalletTransactions();
  if (transactions.length) {
    res.status(200).json({
      code: 200,
      message: "Success",
      data: transactions,
    });
  } else {
    res.status(200).json({
      code: 200,
      message: "No transactions found!",
      data: [],
    });
  }
});

//get transaction by id
router.get("/wallet/transactions/:id", async function (req, res, next) {
  //get transaction by id
  const transaction = await authModel.getWalletTransactionById(req.params.id);
  if (transaction.length) {
    res.status(200).json({
      code: 200,
      message: "Success",
      data: transaction[0],
    });
  } else {
    res.status(500).json({
      code: 500,
      message: "Transaction with id not found!",
      data: [],
    });
  }
});

//get transaction by user id
router.get("/wallet/transactions/user/:id", async function (req, res, next) {
  //get transaction by user id
  const transactions = await authModel.getWgetWalletTransactionByUserId(
    req.params.id
  );
  if (transactions.length) {
    res.status(200).json({
      code: 200,
      message: "Success",
      data: transactions,
    });
  } else {
    res.status(500).json({
      code: 500,
      message: "Transaction with id not found!",
      data: [],
    });
  }
});

//get transaction by vendor id
router.get("/wallet/transactions/vendor/:id", async function (req, res, next) {
  //get transaction by vendor id
  const transactions = await authModel.getWalletTransactionByVendorId(
    req.params.id
  );
  if (transactions.length) {
    res.status(200).json({
      code: 200,
      message: "Success",
      data: transactions,
    });
  } else {
    res.status(500).json({
      code: 500,
      message: "Transaction with id not found!",
      data: [],
    });
  }
});

//new transaction
router.post("/wallet/transactions/new", async function (req, res, next) {
  let payload = { ...req.body };
  const transaction = await authModel.createWalletTransaction(payload);
  if (transaction.affectedRows > 0) {
    res.status(200).json({
      code: 200,
      message: "Success",
      data: {
        payload: payload,
      },
    });
  } else {
    res.status(500).json({
      code: 500,
      message: "Create transaction failed!",
      data: [],
    });
  }
});

//update transaction
router.put("/wallet/transactions/:id", async function (req, res, next) {
  let payload = { ...req.body };
  let id = req.params.id;
  //find transaction by id
  const transactionById = await authModel.getWalletTransactionById(id);
  if (transactionById.length) {
    //update transaction
    if (
      transactionById[0].status === "pending" &&
      transactionById[0].transactionType === "deposit" &&
      payload.status === "approved"
    ) {
      transactionById[0].status = "approved";
      payload.status = "approved";

      const transaction = await authModel.updateTransaction(
        payload,
        req.params.id
      );
      if (transaction.affectedRows > 0) {
        //update user wallet balance
        const user = await authModel.findById(transactionById[0].vendorId);
        if (user.length) {
          user[0].walletBalance += transactionById[0].amount;
          const updatedUser = await authModel.findAndUpdate(
            user[0],
            user[0].id
          );
          if (updatedUser.affectedRows > 0) {
            // console.log("user wallet balance updated");
            //send email to user that their deposit is approved
            let html = `
                <p>Dear ${user[0].username},</p>
                <p>Your deposit has been approved.</p>
                <p>Please check your wallet balance.</p>
                <p>Thank you.</p>
                <p>Regards,</p>
                <p>Happy Sales! :)</p>`;
            EmailTransporter.sendMail(
              {
                from: defaultEmail,
                to: user[0].email,
                subject: "Deposit approved!",
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
          } else {
            // console.log("user wallet balance update failed");
          }
        } else {
          // console.log("user not found");
        }
        res.status(200).json({
          code: 200,
          message: "Success",
          data: {
            payload: payload,
          },
        });
      } else {
        res.status(500).json({
          code: 500,
          message: "Update transaction failed!",
          data: [],
        });
      }
    } else if (
      transactionById[0].status === "pending" &&
      transactionById[0].transactionType === "withdrawal" &&
      payload.status === "approved"
    ) {
      transactionById[0].status = "approved";
      payload.status = "approved";

      const transaction = await authModel.updateTransaction(
        payload,
        req.params.id
      );
      if (transaction.affectedRows > 0) {
        //update user wallet balance
        const user = await authModel.findById(transactionById[0].vendorId);
        if (user.length) {
          user[0].walletBalance -= transactionById[0].amount;
          const updatedUser = await authModel.findAndUpdate(
            user[0],
            user[0].id
          );
          if (updatedUser.affectedRows > 0) {
            // console.log("user wallet balance updated");
            //send email to user that their deposit is approved
            let html = `
                <p>Dear ${user[0].username},</p>
                <p>Your withdrawal has been approved.</p>
                <p>Please check your wallet balance.</p>
                <p>Thank you.</p>
                <p>Regards,</p>
                <p>Happy Sales! :)</p>`;
            EmailTransporter.sendMail(
              {
                from: defaultEmail,
                to: user[0].email,
                subject: "Withdrawal approved!",
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
          } else {
            // console.log("user wallet balance update failed");
          }
        } else {
          // console.log("user not found");
        }
        res.status(200).json({
          code: 200,
          message: "Success",
          data: {
            payload: payload,
          },
        });
      } else {
        res.status(500).json({
          code: 500,
          message: "Update transaction failed!",
          data: [],
        });
      }
    } else if (
      transactionById[0].status === "pending" &&
      transactionById[0].transactionType === "withdrawal" || "deposit" &&
      payload.status === "canceled"
    ) {
      //update transaction
      transactionById[0].status = "canceled";
      payload.status = "canceled";

      const transaction = await authModel.updateTransaction(
        payload,
        req.params.id
      );
      if (transaction.affectedRows > 0) {
        //find user
        const user = await authModel.findById(transactionById[0].vendorId);
        if (user.length) {
          //send email to user that their deposit or wallet was canceled
          let html = `
                <p>Dear ${user[0].name ? user[0].name : "User"},</p>
                <p>Your ${transactionById[0].transactionType} has been canceled.</p>
                <p>Please contact us for more information.</p>
                <p>Thank you.</p>
                <p>Regards,</p>
                <p>Happy Sales! :)</p>`;
          EmailTransporter.sendMail(
            {
              from: defaultEmail,
              to: user[0].email,
              subject: transactionById[0].transactionType + " canceled!",
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
        } else {
          // console.log("user not found");
        }
        
        res.status(200).json({
          code: 200,
          message: "Success",
          data: {
            payload: payload,
          },
        });
      } else {
        res.status(500).json({
          code: 500,
          message: "Update transaction failed!",
          data: [],
        });
      }
    }
  } else {
    // console.log("transaction not found");
  }
});

//delete transaction
router.delete("/wallet/transactions/:id", async function (req, res, next) {
  const transaction = await authModel.deleteWalletTransaction(req.params.id);
  if (transaction.affectedRows > 0) {
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
      message: "Delete transaction failed!",
      data: [],
    });
  }
});

module.exports = router;

// Define a function to check and process orders eligible for profit transfer
async function processPendingProfitTransfers() {
  try {
    // Fetch orders that are 7 days or older since delivery
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const orders = await productsModel.findPendingOrders(sevenDaysAgo);

    for (const order of orders) {
      // Calculate profit amount (adjust this based on your business logic)
      const profitAmount = order.paymentAmount * 0.1;

      // Add profit to vendor's wallet balance
      const vendor = await authModel.findById(order.vendorId);
      vendor.walletBalance += profitAmount;
      vendor.sales += order.productNo;
      vendor.profit += profitAmount;
      await authModel.findAndUpdate(vendor, vendor.id);

      //send email to vendor that order is settled
      let html = `
                <p>Dear ${vendor.username},</p>
                <p> An order with id ${order.id} has been settled.</p>
                <p>Here are the details:</p>
                <p>Amount: ${order.paymentAmount}</p>
                <p>Profit: ${profitAmount}</p>
                <p>Wallet balance: ${vendor.walletBalance}</p>
                <p>Sales: ${vendor.sales}</p>
                <p>Thank you.</p>
                <p>Regards,</p>
                <p>Happy Sales! :)</p>`;
      EmailTransporter.sendMail(
        {
          from: defaultEmail,
          to: vendor.email,
          subject: "Order settled!",
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

      // Mark the order as processed
      order.newOrderStatus = "PROCESSED";
      await productsModel.updateOrder(order, order.id);

      // console.log(`Profit transfer successful for order ${order.id}`);
    }
  } catch (error) {
    console.error("Error processing profit transfers:", error);
  }
}

// Set up a cron job or background task to run `processPendingProfitTransfers` daily
// This depends on your server environment and the scheduling mechanism you prefer

// Example: Schedule the task to run every day at midnight
// const cron = require("node-cron");
// cron.schedule("0 0 * * *", () => {
//   processPendingProfitTransfers();
// });
