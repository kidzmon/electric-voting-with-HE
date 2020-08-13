//password-change.js
var express = require('express');
var router = express.Router();

var mysql_db = require('../mysql-db');


router.get('/', function (req, res, next) {
    res.render('password-change');
});

router.post('/', function (req, res, next) {
    var userId = req.body['userId'];
    var userPw = req.body['userPw'];
    var userPwNew = req.body['userPwNew'];
    mysql_db.query('select * from test_user where id=? and pw=?', [userId, userPw], function (err, rows, fields) {
        if (!err) {
            if (rows[0] != undefined) {
                mysql_db.query('update test_user set pw=? where id=?', [userPwNew, userId], function (err, rows, fields) {
                    if (!err) {
                        res.send('password change success');
                    } else {
                        res.send('error : ' + err);
                    }
                });
            } else {
                res.send('no data');
            }

        } else {
            res.send('error : ' + err);
        }
    });

});

module.exports = router;