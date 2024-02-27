const db = require("../config/db");

let model = {
  createOrder: (order, products) => {
    return new Promise((resolve, reject) => {
      let connection = db;
      connection.beginTransaction((err) => {
        if (err) {
          reject(err);
          return;
        }

        connection.query("INSERT INTO orders SET ?", order, (err, result) => {
          if (err) {
            connection.rollback(() => {
              reject(err);
            });
            return;
          }

          const orderId = result.insertId;
          const productValues = products.map(product => [orderId, product.product_id, product.name, product.qty, product.amount]);

          connection.query("INSERT INTO products (order_id, product_id, name, qty, amount) VALUES ?", [productValues], (err) => {
            if (err) {
              connection.rollback(() => {
                reject(err);
              });
              return;
            }

            connection.commit((err) => {
              if (err) {
                connection.rollback(() => {
                  reject(err);
                });
                return;
              }

              resolve(orderId);
            });
          });
        });
      });
    });
  },
  deleteOrder: (orderId) => {
    return new Promise((resolve, reject) => {
      let connection = db;
      connection.beginTransaction((err) => {
        if (err) {
          reject(err);
          return;
        }

        connection.query("DELETE FROM orders WHERE id = ?", orderId, (err, result) => {
          if (err) {
            connection.rollback(() => {
              reject(err);
            });
            return;
          }

          connection.query("DELETE FROM products WHERE order_id = ?", orderId, (err) => {
            if (err) {
              connection.rollback(() => {
                reject(err);
              });
              return;
            }

            connection.commit((err) => {
              if (err) {
                connection.rollback(() => {
                  reject(err);
                });
                return;
              }

              resolve();
            });
          });
        });
      });
    });
  }
};

module.exports = model;
