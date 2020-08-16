/*publickey.js*/
var express = require('express');
var router = express.Router();
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

  const context = Morfix.Context(
    parms, // Encryption Parameters
    true, // ExpandModChain
    securityLevel // Enforce a security level
  )

  if (!context.parametersSet()) {
    throw new Error(
      'Could not set the parameters in the given context. Please try different encryption parameters.'
    )
  }

  const encoder = Morfix.BatchEncoder(context)
  const keyGenerator = Morfix.KeyGenerator(context)
  const publicKey = keyGenerator.publicKey()
  const publicBase64Key = publicKey.save()
  const secretKey = keyGenerator.secretKey()
  const encryptor = Morfix.Encryptor(context, publicKey)
  const decryptor = Morfix.Decryptor(context, secretKey)
  const evaluator = Morfix.Evaluator(context)
  return publicBase64Key
}
router.get('/', async (req, res) => {
  var result = await seal();
  console.log(result)
  res.redirect('http://localhost:3000/')
});

module.exports = router;