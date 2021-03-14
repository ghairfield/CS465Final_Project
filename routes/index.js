<<<<<<< HEAD
var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Joi Ride" });
});

// about page

=======
var express = require('express');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let key = process.env.GOOGLE_API;
  res.render('index', { 
    title: 'Joi Ride', 
    google_key: key });
>>>>>>> 379a47f0b61c9c216fcf8ecdef3f32b6fefd5c27
});

module.exports = router;
