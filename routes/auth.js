const authModel = require("../models/index.model");
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const defaultEmail = "team@shoppingplatform.org";
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

router.post("/login", function (req, res, next) {
  passport.authenticate(
    "local",
    { session: false },
    function (err, user, info) {
      if (err) {
        res.status(500).send(err);
        console.log(err);
        return next(err);
      }

      if (!user) {
        console.log(info);
        return res.status(500).json({
          code: 500,
          message: info.message,
          data: {},
        });
      }

      const payload = {
        username: user.username,
        password: user.password,
      };
      console.log("payload", payload);
      const options = {
        subject: `${user.id}`,
        expiresIn: 3600,
      };
      const token = jwt.sign(payload, "tanjiro4life", options);

      if (user) {
        res
          .status(200)
          .send({ data: user, token: token, message: "Success", code: 200 });
      }
    }
  )(req, res, next);
});

router.post("/loginbyemail", async function (req, res, next) {
  let payload = {
    email: req.body.email,
    password: req.body.password,
  };

  const user = await authModel.findByEmail(payload.email);
  if (!user.length) {
    const isadmin = await authModel.findAdminByEmail(payload.email);

    if (isadmin.length) {
      if (isadmin[0].password === payload.password) {
        res.status(200).json({
          code: 200,
          message: "Success",
          data: isadmin[0],
        });
      } else {
        return res.status(500).json({
          code: 500,
          message: "Wrong password!",
          data: {},
        });
      }
    } else {
      return res.status(500).json({
        code: 500,
        message: "User with email not found!",
        data: {},
      });
    }
  } else if (user.length) {
    if (user[0].password === payload.password) {
      res.status(200).json({
        code: 200,
        message: "Success",
        data: user[0],
      });
    } else {
      return res.status(500).json({
        code: 500,
        message: "Wrong password!",
        data: {},
      });
    }
  } else {
    return res.status(500).json({
      code: 500,
      message: "User with email not found!",
      data: {},
    });
  }
});

//loginbyphone
router.post("/loginbyphone", async function (req, res, next) {
  let payload = {
    phone: req.body.phone,
    password: req.body.password,
  };

  const user = await authModel.findByPhone(payload.phone);
  if (!user.length) {
    const isadmin = await authModel.findAdminbyPhone(payload.phone);

    if (isadmin.length) {
      if (isadmin[0].password === payload.password) {
        res.status(200).json({
          code: 200,
          message: "Success",
          data: isadmin[0],
        });
      } else {
        return res.status(500).json({
          code: 500,
          message: "Wrong password!",
          data: {},
        });
      }
    } else {
      return res.status(500).json({
        code: 500,
        message: "User with phone not found!",
        data: {},
      });
    }
  } else if (user.length) {
    if (user[0].password === payload.password) {
      res.status(200).json({
        code: 200,
        message: "Success",
        data: user[0],
      });
    } else {
      return res.status(500).json({
        code: 500,
        message: "Wrong password!",
        data: {},
      });
    }
  } else {
    return res.status(500).json({
      code: 500,
      message: "User with phone not found!",
      data: {},
    });
  }
});

//get login otp by sending otp to email
router.post("/getloginbyotp", async function (req, res, next) {
  console.log(req.body);
  let payload = {
    email: req.body.email,
    password: req.body.password,
  };

  const user = await authModel.findByEmail(payload.email);
  const otp = Math.floor(1000 + Math.random() * 9000);

  if (!user.length) {
    const isadmin = await authModel.findAdminByEmail(payload.email);

    if (isadmin.length) {
      var otpupdated = await authModel.findAdminAndUpdatOTP(payload.email, otp);

      if (otpupdated) {
        const mailOptions = {
          from: defaultEmail,
          to: payload.email,
          subject: "OTP for login",
          text: `Your OTP is ${otp}`,
        };
        EmailTransporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.log("error sending email", err);
            res.status(500).send(err);
          } else {
            console.log("email sent", otp);
            res.status(200).json({
              code: 200,
              message: "Success",
              data: {
                otp_checked: true,
              },
            });
          }
        });
      } else {
        return res.status(500).json({
          code: 500,
          message: "OTP update failed! Please try again later!",
          data: {
            otp_checked: false,
          },
        });
      }
    } else {
      return res.status(500).json({
        code: 500,
        message: "User with email not found!",
        data: {},
      });
    }
  } else if (user.length) {
    console.log("user found, updating otp");
    var otpupdated = await authModel.findAndUpdateOTP(payload.email, otp);

    if (otpupdated.affectedRows > 0) {
      console.log("otp updated, sending email");
      const mailOptions = {
        from: defaultEmail,
        to: payload.email,
        subject: "OTP for login",
        text: `Your OTP is ${otp}`,
      };
      EmailTransporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
          res.status(500).send(err);
        } else {
          console.log("email sent", info);
          res.status(200).json({
            code: 200,
            message: "Success",
            data: {
              otp_checked: true,
            },
          });
        }
      });
    } else {
      console.log("otp update failed", otpupdated);
      return res.status(500).json({
        code: 500,
        message: "OTP update failed! Please try again later!",
        data: {
          otp_checked: false,
        },
      });
    }
  }
});

//verify otp
router.post("/verifyloginotp", async function (req, res, next) {
  let payload = {
    email: req.body.email,
    otp: req.body.otp,
  };

  const user = await authModel.findByEmail(payload.email);

  if (!user.length) {
    const isadmin = await authModel.findAdminByEmail(payload.email);

    if (isadmin.length) {
      console.log(isadmin[0].token, payload.otp);
      if (isadmin[0].token === payload.otp) {
        res.status(200).json({
          code: 200,
          message: "Success",
          data: isadmin[0],
        });
      } else {
        return res.status(500).json({
          code: 500,
          message: "Wrong OTP!",
          data: {},
        });
      }
    } else {
      return res.status(500).json({
        code: 500,
        message: "User with email not found!",
        data: {},
      });
    }
  } else if (user.length) {
    console.log(payload, user[0].token);
    if (Number(user[0].token) === Number(payload.otp)) {
      res.status(200).json({
        code: 200,
        message: "Success",
        data: user[0],
      });
    } else {
      return res.status(500).json({
        code: 500,
        message: "Wrong OTP!",
        data: {},
      });
    }
  } else {
    return res.status(500).json({
      code: 500,
      message: "User with email not found!",
      data: {},
    });
  }
});

//generate otp and send to email
router.post("/getOTP", async function (req, res, next) {
  let payload = {
    email: req.body.email,
  };

  const user = await authModel.findByEmail(payload.email);

  //if user is found in vendors table, user exists return email already exists
  //if user is found in admins table, user exists return email already exists
  //if user is not found in both tables, user does not exist send otp to email

  if (!user.length) {
    const isadmin = await authModel.findAdminByEmail(payload.email);

    if (!isadmin.length) {
      var otp = Math.floor(1000 + Math.random() * 9000);
      console.log("otp", otp, payload.email);
      if (otp && payload.email) {
        const mailOptions = {
          from: defaultEmail,
          to: payload.email,
          subject: "OTP for registration",
          text: `Your OTP is ${otp}`,
        };
        EmailTransporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.log(err);
            res.status(500).send(err);
          } else {
            console.log("email sent", info);
            res.status(200).json({
              code: 200,
              message: "Success",
              data: {
                otp_checked: true,
                otp: otp,
              },
            });
          }
        });
      } else {
        console.log("otp update failed");
        return res.status(500).json({
          code: 500,
          message: "OTP update failed! Please try again later!",
          data: {
            otp_checked: false,
          },
        });
      }
    } else {
      return res.status(500).json({
        code: 500,
        message: "Email already exists!",
        data: {},
      });
    }
  } else if (user.length) {
    return res.status(500).json({
      code: 500,
      message: "Email already exists!",
      data: {},
    });
  }
});

//register user
router.post("/register", async function (req, res) {
  // Assuming you receive the user registration data from the frontend
  const { username, email, password, confirmPassword } = req.body;

  // Create a payload object with default values for Vendor fields
  const payload = {
    storeid: 0, // Set as needed or leave it as 0 if it's an empty field
    storename: "",
    goods_category_id: 0,
    name: "",
    img: "",
    browse: 0,
    score: 0,
    area_code: 0,
    mobile: "",
    contact: "",
    id_card: "",
    front_img: "",
    reverse_img: "",
    license_img: "",
    address: "",
    deposit: "",
    discount: "",
    remark: "",
    tid: "",
    category: "",
    sort: 0,
    isCollect: 0,
    products_num: 0,
    approve_status: 0,
    canlogin: 0,
    email: "", // Set as needed or leave it as an empty string
    walletBalance: 0, // Set as needed or leave it as 0 if it's an empty field
    walletPassword: "", // Set as needed or leave it as an empty string
    password: "", // Set as needed or leave it as an empty string
    token: "", // Set as needed or leave it as an empty string
  };

  // Populate the payload object with the received data
  payload.username = username;
  payload.email = email;
  payload.password = password;

  const newuser = await authModel.createVendor(payload);
  // if new user is created, send success message and email saying to wait for approval
  if (newuser.affectedRows > 0) {
    res.status(200).json({
      code: 200,
      message: "Success",
      data: newuser,
    });
    const mailOptions = {
      from: defaultEmail,
      to: email,
      subject: "Registration successful",
      text: `Your registration is successful. Please wait for approval.`,
    };

    EmailTransporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log("email sent", info);
      }
    });
    //send email to admin to approve
    const adminEmail = "shoppingplatform9@gmail.com";
    const adminMailOptions = {
      from: defaultEmail,
      to: adminEmail,
      subject: "New vendor registration",
      text: `A new vendor has registered. Please approve.`,
    };

    EmailTransporter.sendMail(adminMailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log("email sent", info);
      }
    });
  } else {
    console.log("registration failed", newuser);
    return res.status(500).json({
      code: 500,
      message: "Registration failed! Please try again later!",
      data: {},
    });
  }
});

router.post("/logout", function (req, res) {
  req.logout();
  res.status(200).send("logged out!");
});

module.exports = router;
