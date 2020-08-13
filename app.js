const express = require('express')
var bodyParser = require('body-parser')
const app = express()
const port = 3000

var loginRouter = require('./routes/login')
var joinRouter = require('./routes/join')
var passwordChangeRouter = require('./routes/password-change')
var showAllDataRouter = require('./routes/delete-account')
var deleteAccountRouter = require('./routes/delete-account')

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use('/login',loginRouter);
app.use('/join',joinRouter);
app.use('/password-change',passwordChangeRouter);
app.use('/show-all-data',showAllDataRouter);
app.use('/delete-account',deleteAccountRouter);

app.set('view engine','ejs');
app.get('/', (req, res)=>{
  res.send('Hello world!')
})
app.listen(port, ()=>{
  console.log(`Example app listening at http://localhost:${port}`)
});