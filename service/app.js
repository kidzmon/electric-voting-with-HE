var express = require('express')
var passport = require('passport')
var fs = require('fs')
var serviceServer = express()
var servicePort = 3000
var bodyParser = require('body-parser')
var context,encoder,evaluator,Morfix,cipherResult,encryptor;
var init = true
var result = Int32Array.from([1])
var stamp = require('console-stamp')(console, 'yyyy/mm/dd HH:MM:ss.l');

const candidate = [2,3,5]
async function seal (){
  if(init){
    const { Seal }= require('node-seal')
    Morfix = await Seal()
    const schemeType = Morfix.SchemeType.BFV
    const securityLevel = Morfix.SecurityLevel.tc128
    const polyModulusDegree = 8192
    const bitSizes = [43, 43, 44, 44, 44]
    const bitSize = 17

    const parms = Morfix.EncryptionParameters(schemeType)
    // Set the PolyModulusDegree
    parms.setPolyModulusDegree(polyModulusDegree)

    // Create a suitable set of CoeffModulus primes
    parms.setCoeffModulus(
      Morfix.CoeffModulus.Create(polyModulusDegree, Int32Array.from(bitSizes))
    )

    // Set the PlainModulus to a prime of bitSize 20.
    parms.setPlainModulus(
      Morfix.PlainModulus.Batching(polyModulusDegree, bitSize)
    )

    context = Morfix.Context(
      parms, // Encryption Parameters
      true, // ExpandModChain
      securityLevel // Enforce a security level
    )

    if (!context.parametersSet()) {
      throw new Error(
        'Could not set the parameters in the given context. Please try different encryption parameters.'
      )
    }
    encoder = Morfix.BatchEncoder(context)
    const publicFile=fs.readFileSync("pk.txt");
    var publicBase64Key=publicFile.toString()
    evaluator = Morfix.Evaluator(context)
    const UploadPublicKey = Morfix.PublicKey()
    UploadPublicKey.load(context,publicBase64Key)
    encryptor = Morfix.Encryptor(context, UploadPublicKey)

    console.log('init')
    var plainResult = encoder.encode(result)
    cipherResult = Morfix.CipherText()
    cipherResult = encryptor.encrypt(plainResult)
    init=false;
  }
}

var loginRouter = require('./routes/login');
var joinRouter = require('./routes/join');
var mainRouter = require('./routes/main');
var resultRouter = require('./routes/result');

serviceServer.use(bodyParser.urlencoded({extended:true}));
serviceServer.use(bodyParser.json());
serviceServer.use(passport.initialize());
serviceServer.use(function(req,res,next){
  if(req.user){
    res.locals.currentUser=req.user;
    res.locals.isAuthenticated = true;
  }
  else{
    res.locals.isAuthenticated=false;
  }
  next();
})

serviceServer.use('/login',loginRouter);
serviceServer.use('/join',joinRouter);
serviceServer.use('/main',mainRouter);
serviceServer.use('/result',resultRouter);

serviceServer.set('view engine','ejs');

serviceServer.get('/',(req, res)=>{
  res.render('welcome');
})

serviceServer.get('/vote',(req,res)=>{
  res.render('vote');
})

serviceServer.post('/vote',async (req,res)=>{
  console.log("vote")
  console.log(req.body);
  await seal();
  console.log("Encryption Start");
  var vote=candidate[req.body['vote']]
  var plainText = encoder.encode(Int32Array.from([vote]))
  var cipherText = encryptor.encrypt(plainText)
  evaluator.multiply(cipherText,cipherResult,cipherResult)
  console.log("Encryption End");
  console.log("Ciphered Result : ");
  console.log(cipherResult.save());
  fs.writeFile('result.txt',cipherResult.save(),'utf8',function(err){
    console.log('result.txt created');
  })
  res.render('main')
})

serviceServer.listen(servicePort,()=>{
  console.log(`Service Server listening at http://localhost:${servicePort}`)
});
