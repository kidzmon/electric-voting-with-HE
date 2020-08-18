
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('result');
});

router.post('/', function (req, res, next) {
    res.render('result');
});

module.exports = router;