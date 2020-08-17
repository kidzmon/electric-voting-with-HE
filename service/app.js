var express = require('express')
var fs = require('fs')
var serviceServer = express()
var servicePort = 3000
var bodyParser = require('body-parser')
var context,encoder,evaluator,publicBase64Key,Morfix,cipherResult,encryptor;
var init = true
var result = Int32Array.from([1])
const candidate = [2,3,5,7,11,13]
async function seal (){
  const { Seal }= require('node-seal')
  Morfix = await Seal()
  const schemeType = Morfix.SchemeType.BFV
  const securityLevel = Morfix.SecurityLevel.tc128
  const polyModulusDegree = 4096
  const bitSizes = [36, 36, 37]
  const bitSize = 20

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
  const keyGenerator = Morfix.KeyGenerator(context)
  evaluator = Morfix.Evaluator(context)
  const UploadPublicKey = Morfix.PublicKey()
  UploadPublicKey.load(context,publicBase64Key)
  encryptor = Morfix.Encryptor(context, UploadPublicKey)

  if (init){
    console.log('init')
    var plainResult = encoder.encode(result)
    cipherResult = encryptor.encrypt(plainResult)
    init=false;
  }
}
var loginRouter = require('./routes/login');
var joinRouter = require('./routes/join');
var mainRouter = require('./routes/main');
serviceServer.use(bodyParser.urlencoded({extended:true}));
serviceServer.use(bodyParser.json());
serviceServer.use('/login',loginRouter);
serviceServer.use('/join',joinRouter);
serviceServer.use('/main',mainRouter);
serviceServer.set('view engine','ejs');
serviceServer.get('/',(req, res)=>{
  res.send('Hello world!')
})
serviceServer.post('/upload',function(req,res){
  fs.readFile(req.files.uploadFile.path, function(error,data){
    var filePath = __dirname+"\\files\\"+req.files.uploadFile.name;
    fs.writeFile(filePath, data, function(error){
      if(error){
        throw error;
      } else{
        res.redirect("back");
      }
    })
  })
})
serviceServer.get('/vote',(req,res)=>{
  res.render('vote');
})
//serviceServer.post('/vote',async (req,res)=>{
serviceServer.post('/vote',async (req,res)=>{
  await seal();
  var vote=candidate[req.body['vote']]
  //var vote = 2;
  console.log(vote)
  const plainText = encoder.encode(Int32Array.from([vote]))
  console.log(plainText)
  const cipherText = encryptor.encrypt(plainText)
  console.log(cipherText)
  console.log(cipherResult)
  evaluator.multiply(cipherText,cipherResult,cipherResult)
  console.log(cipherResult)
  const cipherTextBase64 = cipherResult.save()
  res.send(cipherTextBase64)
})
serviceServer.listen(servicePort,()=>{
  console.log(`Service Server listening at http://localhost:${servicePort}`)
});
