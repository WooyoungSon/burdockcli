import { createJWT, verifyJWT, ES256KSigner, hexToBytes, decodeJWT } from 'did-jwt';
import { Resolver } from 'did-resolver';
import fetch from 'node-fetch';

const customResolver = {
  web: async (did) => {
    const url = `https://soonding.github.io/client_did.json`; 
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
  const key = '62f5955a35f1b0918314d25af571120f5f32e760ca00256f63a16d6dacc558a7';
  const signer = ES256KSigner(hexToBytes(key));

  const clientDid = 'did:web:soonding.github.io:client_did';

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

