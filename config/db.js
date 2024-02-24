
const mysql = require('mysql');

const connection = mysql.createConnection({
  // host: "server266.web-hosting.com",
  // port: 5522,
  // user: "shopjqoi",
  // password: "NobqsqrEJ8rh",
  // database: "shopjqoi_shopping platform",
  host: "localhost",
  port: 3306,
  user: "root",
  database: "shopjqoi_shopping platform"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("mysql connected");
})

module.exports = connection;
