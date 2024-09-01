import { createJWT, verifyJWT, ES256KSigner, hexToBytes, decodeJWT } from 'did-jwt';
import { Resolver } from 'did-resolver';
import fetch from 'node-fetch';

const customResolver = {
  web: async (did) => {
    const url = `https://wooyoungson.github.io/client_did.json`; 
    const response = await fetch(url);
    if (response.ok) {
      const didDocument = await response.json();
      return {
        didResolutionMetadata: {},
        didDocument,
        didDocumentMetadata: {}
      };
    } else {
      throw new Error(`Failed to load DID document from ${url}`);
    }
  }
};

async function run() {
  const key = '2a046b1bae26d55ae22571fb29f934d807627fbbcc38d0bd27847f0f840698c7';
  const signer = ES256KSigner(hexToBytes(key));

  const clientDid = 'did:web:WooyoungSon.github.io:client';

  const jwt = await createJWT(
    { aud: clientDid, name: 'Client Name' },
    { issuer: clientDid, signer },
    { alg: 'ES256K' }
  );

  console.log('JWT:', jwt);
  console.log('JWT Decoded:', decodeJWT(jwt));

  const resolver = new Resolver(customResolver);

  try {
    const { payload } = await verifyJWT(jwt, { resolver, audience: clientDid });
    console.log('Verified:', payload);
  } catch (error) {
    console.error('Verification error:', error.message);
  }
}

run().catch((err) => console.error('Unexpected error:', err));

