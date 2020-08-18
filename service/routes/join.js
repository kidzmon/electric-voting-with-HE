/*join.js*/
var express = require('express');
var router = express.Router();

var mysqlDB = require('../mysql-db');

router.get('/', function (req, res, next) {
    res.render('join');
});

router.post('/', function (req, res, next) {
  console.log(req.body)
    var userId = req.body['userId'];
    var userName = req.body['name'];
    var userPw = req.body['userPw'];
    var userPwRe = req.body['userPwRe'];
    if (userPw == userPwRe) {
        mysqlDB.query('insert into test_user values(?,?,?)', [userId, userPw, userName], function (err, rows, fields) {
            if (!err) {
                res.render('welcome');
            } else {
                res.send('err : ' + err);
            }
        });
    }else{
        res.send('password not match!');
    }
});

module.exports = router;