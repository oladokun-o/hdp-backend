const db = require("../config/db");

let model = {
  getAllProducts: () => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM products WHERE status = 1";
      db.query(sql, [], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  getAllProductsForVendors: () => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM products";
      db.query(sql, [], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  getProductById: (id) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM products WHERE id = ? AND status = 1";
      db.query(sql, [id], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  getAllVendors: () => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM vendors";
      db.query(sql, [], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  getActiveVendors: () => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM vendors WHERE approve_status = 1";
      db.query(sql, [], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  getVendorById: (id) => {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT * FROM vendors WHERE id = ? OR storeid = ? AND approve_status = 1";
      db.query(sql, [id, id], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  getVendorByStoreId: (id) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM vendors WHERE storeid = ?";
      db.query(sql, [id], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  getPaymentDetailsFromAdmin: (role = "admin") => {
    //select walletAddress and walletQrCode from first user with role = admin
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT walletAddress, walletQrCode, walletNetwork FROM admins WHERE role = ?";
      db.query(sql, [role], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  updateProduct: (data, id) => {
    return new Promise((resolve, reject) => {
      const sql = "UPDATE products SET ? WHERE id = ?";
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
  deleteProduct: (id) => {
    return new Promise((resolve, reject) => {
      const sql = "DELETE FROM products WHERE id = ?";
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
  addProduct: (data) => {
    return new Promise((resolve, reject) => {
      const sql = "INSERT INTO products SET ?";
      db.query(sql, [data], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });

      // db.query(sql, [data], (err, rows, fields) => {
      //   if (err) {
      //     reject(err);
      //   } else {
      //     resolve(rows);
      //   }
      // });
    });
  },
  getOrders: () => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM orders";
      db.query(sql, [], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });

      // db.query(sql, [], (err, rows, fields) => {
      //   if (err) {
      //     reject(err);
      //   } else {
      //     resolve(rows);
      //   }
      // });
    });
  },
  addOrder: (data) => {
    return new Promise((resolve, reject) => {
      const sql = "INSERT INTO orders SET ?";
      db.query(sql, [data], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });

      // db.query(sql, [data], (err, rows, fields) => {
      //   if (err) {
      //     reject(err);
      //   } else {
      //     resolve(rows);
      //   }
      // });
    });
  },
  deleteOrder: (id) => {
    return new Promise((resolve, reject) => {
      const sql = "DELETE FROM orders WHERE id = ?";
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
  updateOrder: (data, id) => {
    return new Promise((resolve, reject) => {
      const sql = "UPDATE orders SET ? WHERE orderId = ?";
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
  getOrdersById: (id) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM orders WHERE orderId = ?";
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
  addDepositToAdminWalletBalance: (amount, id) => {
    //find and update admin wallet balance
    console.log("amount", amount);
    return new Promise((resolve, reject) => {
      const sql = "UPDATE admins SET walletBalance = ? WHERE id = ?";
      db.query(sql, [amount, id], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
        // db.query(sql, [amount, id], (err, rows, fields) => {
        //   if (err) {
        //     reject(err);
        //   } else {
        //     resolve(rows);
        //   }
        // });
      });
    });
  },
  AddProductIdToVendorsListed: (listed_products, vendorId) => {
    console.log("listed_products", listed_products);
    return new Promise((resolve, reject) => {
      const sql = "UPDATE vendors SET listed_products = ? WHERE id = ?";
      db.query(sql, [listed_products, vendorId], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
        // db.query(sql, [id, id], (err, rows, fields) => {
        //   if (err) {
        //     reject(err);
        //   } else {
        //     resolve(rows);
        //   }
        // });
      });
    });
  },
  findPendingOrders: () => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM orders WHERE newOrderStatus = 'pending'";
      db.query(sql, [], (err, rows, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
        // db.query(sql, [], (err, rows, fields) => {
        //   if (err) {
        //     reject(err);
        //   } else {
        //     resolve(rows);
        //   }
        // });
      });
    });
  }
};

module.exports = model;
