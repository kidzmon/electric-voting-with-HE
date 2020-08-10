const express = require('express')
var site1=express.createServer()
var site2=express.createServer()
var site_vhosts = []
var vhost;


const app = express()
const port = 3000

site_vhosts.push(express.vhost('example.com',site1))
site_vhosts.push(express.vhost('sub.example.com',site2))

vhost = express.createServer.apply(this, site_vhosts)

site1.listen(10000);
site2.listen(10001);
vhost.list(80);

app.get('/', (req, res)=>{
  res.send('Hello world!')
})

app.listen(port, ()=>{
  console.log(`Example app listening at http://localhost:${port}`)
})