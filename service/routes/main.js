
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('main');
});

router.post('/', function (req, res, next) {
  console.log(req.body['userId']);
  console.log(req.body['userPw']);
    res.render('main');
});

module.exports = router;