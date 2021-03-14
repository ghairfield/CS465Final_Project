var express = require("express");

var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  let key = process.env.GOOGLE_API;
  res.render("index", {
    title: "Joi Ride",
    google_key: key,
  });
});

// about page
router.get("/about", function (req, res, next) {
  res.render("about", { title: "about page" });
});

module.exports = router;
