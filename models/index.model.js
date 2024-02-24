const db = require("../config/db");

let model = {
  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM vendors WHERE email = ?";
      db.query(sql, [email], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  findAdminByEmail: (email) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM admins WHERE email = ?";
      db.query(sql, [email], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  findByPhone: (phone) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM vendors WHERE mobile = ?";
      db.query(sql, [phone], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  findAdminbyPhone: (phone) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM admins WHERE phone = ?";
      db.query(sql, [phone], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  findById: (id) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM vendors WHERE id = ?";
      db.query(sql, [id], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  findVendorByStoreid: (storeid) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM vendors WHERE storeid = ?";
      db.query(sql, [storeid], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  findAdminById: (id) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM admins WHERE id = ?";
      db.query(sql, [id], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  findAndUpdateOTP: (email, otp) => {
    return new Promise((resolve, reject) => {
      const sql = "UPDATE vendors SET token = ? WHERE email = ?";
      db.query(sql, [otp, email], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  findAdminAndUpdatOTP: (email, otp) => {
    return new Promise((resolve, reject) => {
      const sql = "UPDATE admins SET token = ? WHERE email = ?";
      db.query(sql, [otp, email], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });

      // db.query(sql, [otp, email], (err, rows, fields) => {
      //   if (err) {
      //     reject(err);
      //   } else {
      //     resolve(rows);
      //   }
      // });
    });
  },
  createVendor: (data) => {
    return new Promise((resolve, reject) => {
      const sql = "INSERT INTO vendors SET ?";
      db.query(sql, [data], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  getAllAdmins: () => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM admins";
      db.query(sql, [], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  getAdminByRole: (role) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM admins WHERE role = ?";
      db.query(sql, [role], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });

      // db.query(sql, [role], (err, rows, fields) => {
      //   if (err) {
      //     reject(err);
      //   } else {
      //     resolve(rows);
      //   }
      // });
    });
  },
  updateAdmin: (data, id) => {
    return new Promise((resolve, reject) => {
      const sql = "UPDATE admins SET ? WHERE id = ?";
      db.query(sql, [data, id], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
      // db.query(sql, [data, id], (err, rows, fields) => {
      //   if (err) {
      //     reject(err);
      //   } else {
      //     resolve(rows);
      //   }
      // });
    });
  },
  findAndUpdate: (data, id) => {
    return new Promise((resolve, reject) => {
      const sql = "UPDATE vendors SET ? WHERE id = ?";
      db.query(sql, [data, id], (err, rows, fields) => {
        if (err) {
          console.log("error: ", err);
          reject(err);
        } else {
          console.log(rows, id);
          resolve(rows);
        }
      });

      // db.query(sql, [data, id], (err, rows, fields) => {
      //   if (err) {
      //     reject(err);
      //   } else {
      //     resolve(rows);
      //   }
      // });
    });
  },
  findAndDelete: (id) => {
    return new Promise((resolve, reject) => {
      const sql = "DELETE FROM vendors WHERE id = ?";
      db.query(sql, [id], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });

      // db.query(sql, [id], (err, rows, fields) => {
      //   if (err) {
      //     reject(err);
      //   } else {
      //     resolve(rows);
      //   }
      // });
    });
  },
  createWalletTransaction: (data) => {
    //create wallet transaction in wallettransactions table
    return new Promise((resolve, reject) => {
      const sql = "INSERT INTO wallettransactions SET ?";
      db.query(sql, [data], (err, rows, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  deleteWalletTransaction: (id) => {
    //delete wallet transaction in wallettransactions table
    return new Promise((resolve, reject) => {
      const sql = "DELETE FROM wallettransactions WHERE id = ?";
      db.query(sql, [id], (err, rows, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  getWalletTransactions: () => {
    //get wallet transactions in wallettransactions table
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM wallettransactions";
      db.query(sql, [], (err, rows, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  getWalletTransactionById: (id) => {
    //get wallet transaction in wallettransactions table
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM wallettransactions WHERE id = ?";
      db.query(sql, [id], (err, rows, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  getWgetWalletTransactionByUserId: (userId) => {
    //get wallet transaction in wallettransactions table
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM wallettransactions WHERE userId = ?";
      db.query(sql, [userId], (err, rows, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  getWalletTransactionByVenorId: (vendorId) => {
    //get wallet transaction in wallettransactions table
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM wallettransactions WHERE vendorId = ?";
      db.query(sql, [vendorId], (err, rows, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  updateTransaction: (data, id) => {
    //update wallet transaction in wallettransactions table
    return new Promise((resolve, reject) => {
      const sql = "UPDATE wallettransactions SET ? WHERE id = ?";
      db.query(sql, [data, id], (err, rows, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
};

module.exports = model;

