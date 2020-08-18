var express = require('express')
var masterServer = express()
var masterPort = 4000
var fs = require('fs')
var stamp = require('console-stamp')(console, 'yyyy/mm/dd HH:MM:ss.l');

var bodyParser = require('body-parser')
masterServer.use(bodyParser.urlencoded({extended:true}));
masterServer.use(bodyParser.json());

var publicBase64Key,context,decryptor,encoder,Morfix
const candidate = [2,3,5]
async function seal (){
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
  const keyGenerator = Morfix.KeyGenerator(context)
  const publicKey = keyGenerator.publicKey()
  publicBase64Key = publicKey.save()
  const secretKey = keyGenerator.secretKey()
  decryptor = Morfix.Decryptor(context, secretKey)
}

masterServer.get('/publickey',async (req,res)=>{
  console.log("Encryption Key generation Start");
  await seal();
  console.log("Encryptino Key generation Finished");
  console.log("Candidate prime : ");
  console.log(candidate);
  console.log("PublicBase64Key : ");
  console.log(publicBase64Key);

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
masterServer.get('/result',(req, res)=>{
  console.log("Result Decryption Start")
  const cipherresult = fs.readFileSync("result.txt");
  const cipherResult = Morfix.CipherText()
  cipherResult.load(context,cipherresult);
  const decryptedresult = decryptor.decrypt(cipherResult);
  const decodedArray = encoder.decode(decryptedresult)
  console.log("Result Decryption Finished");
  var resultval = decodedArray[0]
  console.log("Decrypted Value : ")
  console.log(resultval)
  var result = [];
  var b =2;
  while(b<=resultval){
    if(resultval%b==0){
      result.push(b);
      resultval = resultval / b;
    }
    else{
      b++;
    }
  }
  console.log("Result : ")
  console.log(result);
  var count = [0,0,0];
  for(var i=0;i<result.length;i++){
    count[candidate.indexOf(result[i])]++;
  }
  console.log("Result count : ");
  console.log(count)
  for(var i=1;i<=count.length;i++){
    console.log("candidate"+i+" : "+count[i-1]);
  }
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Headers","X-Requested-With");
  res.json({result:true, count:count});
});

masterServer.get('/',(req, res)=>{
  res.send('Hello world!')
})
masterServer.listen(masterPort,()=>{
  console.log(`Master Server listening at http://localhost:${masterPort}`)
});