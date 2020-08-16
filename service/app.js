var express = require('express')
var serviceServer = express()
var servicePort = 3000
var bodyParser = require('body-parser')
var context,encoder,evaluator,publicBase64Key,Morfix,cipherResult;
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
  const keyGenerator = Morfix.KeyGenerator(context)
  const publicKey = keyGenerator.publicKey()
  publicBase64Key = publicKey.save()
  evaluator = Morfix.Evaluator(context)
  
  if (result==Int32Array.from([1])){
    var plainResult = encoder.encode(result)
    cipherResult = encryptor.encrypt(plainResult)
    const ciperTextBase64 = cipherResult.save()
    console.log(cipherTextBase64);
  }
}
var loginRouter = require('./routes/login');
var joinRouter = require('./routes/join');
serviceServer.use(bodyParser.urlencoded({extended:true}));
serviceServer.use(bodyParser.json());
serviceServer.use('/login',loginRouter);
serviceServer.use('/join',joinRouter);
serviceServer.set('view engine','ejs');
serviceServer.get('/',(req, res)=>{
  res.send('Hello world!')
})
//serviceServer.post('/vote',async (req,res)=>{
serviceServer.get('/vote',async (req,res)=>{
  await seal();
  //var publicBase64key=req.body['publickey']
  //var vote=candidate[req.body['vote']]
  var vote = 2;
  const UploadPublicKey = Morfix.PublicKey()
  UploadPublicKey.load(context,publicBase64Key)
  const encryptor = Morfix.Encryptor(context, UploadPublicKey)
  const plainText = encoder.encode(Int32Array.from([vote]))
  const cipherText = encryptor.encrypt(plainText)
  cipherResult = evaluator.multiply(cipherText,cipherResult)
  const cipherTextBase64 = cipherResult.save()
  res.send(cipherTextBase64)
})
serviceServer.listen(servicePort,()=>{
  console.log(`Service Server listening at http://localhost:${servicePort}`)
});
