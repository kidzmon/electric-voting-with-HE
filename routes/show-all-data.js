var express = require('express')
var router = express.Router();

var mysqlDB = require('./mysql-db')

router.get('/',function(req,res,next){
  mysqlDB.query('select * from test_user',function(err,rows,fields){
    connection.end();
    if(!err){
      console.log(rows);
      console.log(fileds);
      var result = 'rows:'+JSON.stringify(rows)+'<br><br>'+'fileds:'+JSON.stringify(fields);
      res.send(result);
    }else{
      console.log('query error:'+err);
      res.send(err)
    }
  });
});

module.exports = router;