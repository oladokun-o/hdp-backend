
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: "www.heavydutypub.com",
  port: 3306,
  user: "heavydu2_developer",
  password: "d#8CLnR9bD8ihL3",
  database: "heavydu2_orders",
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("mysql connected");
})

module.exports = connection;
