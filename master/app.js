var express = require('express')
var masterServer = express()
var masterPort = 4000

var publickeyRouter = require('./routes/publickey')
var resultRouter = require('./routes/voteresult')
var bodyParser = require('body-parser')
masterServer.use(bodyParser.urlencoded({extended:true}));
masterServer.use(bodyParser.json());

var publicBase64Key,context,decryptor,encoder
const candidate = [2,3,5,7,11,13]
async function seal (){
  const { Seal }= require('node-seal')
  const Morfix = await Seal()
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
  const secretKey = keyGenerator.secretKey()
  decryptor = Morfix.Decryptor(context, secretKey)
}

masterServer.get('/publickey',async (req,res)=>{
  await seal()
  res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>Public Key</title>
  </head>
  <body>
  <h1>Public Key</h1>
  <form method="post">
      <label>Public Key :</label><br>
      <label>`+publicBase64Key+`</label>
      <label>Candidate : </label><br>
      <label>`+candidate+`</label>
  </form>
  </body>
  </html>`)
});
masterServer.post('/result',(req, res)=>{
  const cipherresult = req.body(['result']);
  const decryptedresult = decryptor.decrypt(cipherresult);
  const decodedArray = encoder.decode(decryptedresult)
  const resultval = decodedArray[0]
  var result = [];
  var b =2;
  while(b<=resultval){
    if(resultval%b==0){
      if(result[result.length-1]!=b){result.push(b);}
      resultval = resultval / b;
    }
    else{
      b++;
    }
  }
  console.log(result);
  res.send(result);
});

masterServer.get('/',(req, res)=>{
  res.send('Hello world!')
})
masterServer.listen(masterPort,()=>{
  console.log(`Master Server listening at http://localhost:${masterPort}`)
});