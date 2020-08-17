
var express = require('express');
var router = express.Router();

var mysql_db = require('../mysql-db');


router.get('/', function (req, res, next) {
    res.render('login');
});

router.post('/', function (req, res, next) {
  console.log(req.body['userId']);
  console.log(req.body['userPw']);
    var userId = req.body['userId'];
    var userPw = req.body['userPw'];
    mysql_db.query('select * from test_user where id=\'' + userId + '\' and pw=\'' + userPw + '\'', function (err, rows, fields) {
        if (!err) {
            if (rows[0]!=undefined) {
                res.render('main');
            } else {
                res.send('no data');
            }

        } else {
            res.send('error : ' + err);
        }
    });
});

module.exports = router;