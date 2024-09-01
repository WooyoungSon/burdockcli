import { createJWT, verifyJWT, ES256KSigner, hexToBytes, decodeJWT } from 'did-jwt';
import { Resolver } from 'did-resolver';
import fetch from 'node-fetch';

const customResolver = {
  web: async (did) => {
    const url = `https://wooyoungson.github.io/chatbot_did.json`;
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
  const clientKey = '2a046b1bae26d55ae22571fb29f934d807627fbbcc38d0bd27847f0f840698c7';
  const clientSigner = ES256KSigner(hexToBytes(clientKey));

  const clientDid = 'did:web:WooyoungSon.github.io:client';
  const chatbotDid = 'did:web:WooyoungSon.github.io:chatbot';

  const clientJwt = await createJWT(
    { aud: chatbotDid, name: 'Client Name' },
    { issuer: clientDid, signer: clientSigner },
    { alg: 'ES256K' }
  );

  console.log('Client JWT:', clientJwt);
  console.log('Client JWT Decoded:', decodeJWT(clientJwt));

  const resolver = new Resolver(customResolver);

  const response = await fetch('http://localhost:3000/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jwt: clientJwt }),
  });

  const { serverJwt } = await response.json();

  try {
    const { payload: serverPayload } = await verifyJWT(serverJwt, { resolver, audience: clientDid });
    console.log('AI Chatbot Verified:', serverPayload);
  } catch (error) {
    console.error('Server Verification error:', error.message);
  }
}

run().catch((err) => console.error('Unexpected error:', err));
