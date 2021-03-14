var express = require('express');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let key = process.env.GOOGLE_API;
  res.render('index', { 
    title: 'Joi Ride', 
    google_key: key });
});

module.exports = router;
