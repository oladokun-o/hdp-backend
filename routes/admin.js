const express = require("express");
const router = express.Router();

router.post("/login", function (req, res, next) {

});


router.post("/logout", function (req, res) {
  req.logout();
  res.status(200).send("logged out!");
});

module.exports = router;