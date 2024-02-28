const db = require("../config/db");

const model = {
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
          const productValues = products.map((product) => [
            orderId,
            product.product_id,
            product.name,
            product.qty,
            product.amount,
            product.price,
          ]);

          connection.query(
            "INSERT INTO products (order_id, product_id, name, qty, amount, price) VALUES ?",
            [productValues],
            (err) => {
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
            }
          );
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

        connection.query(
          "DELETE FROM products WHERE order_id = ?",
          orderId,
          (err) => {
            if (err) {
              connection.rollback(() => {
                reject(err);
              });
              return;
            }

            connection.query(
              "DELETE FROM orders WHERE order_id = ?",
              orderId,
              (err) => {
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
              }
            );
          }
        );
      });
    });
  },
  getAllOrders: () => {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM orders";
      db.query(query, (error, orders) => {
        if (error) {
          reject(error);
          return;
        }
        // Now fetch products for each order
        const ordersWithProducts = orders.map(async (order) => {
          const products = await model.getProductsByOrderId(order.order_id);
          return { ...order, products };
        });
        Promise.all(ordersWithProducts)
          .then((result) => resolve(result))
          .catch((err) => reject(err));
      });
    });
  },
  getProductsByOrderId: (orderId) => {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM products WHERE order_id = ?";
      db.query(query, [orderId], (error, products) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(products);
      });
    });
  },
  updateOrder: (orderId, updatedOrder) => {
    return new Promise((resolve, reject) => {
      const query = "UPDATE orders SET ... WHERE order_id = ?"; // Update the query based on your database schema
      db.query(query, [updatedOrder, orderId], (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      });
    });
  },
  updateOrderStatus: (orderId, newStatus) => {
    return new Promise((resolve, reject) => {
      const query = "UPDATE orders SET status = ? WHERE order_id = ?";
      db.query(query, [newStatus, orderId], (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({ orderId, newStatus });
      });
    });
  },
};

module.exports = model;
