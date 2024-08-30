import { ES256KSigner, hexToBytes } from 'did-jwt';
import { createVerifiableCredentialJwt, createVerifiablePresentationJwt, verifyCredential, verifyPresentation } from 'did-jwt-vc';
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


  const issuer = {
    did: clientDid,
    signer: signer
  };


  const vcPayload = {
    sub: clientDid,
    nbf: Math.floor(Date.now() / 1000),
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential'],
      credentialSubject: {
        degree: {
          type: 'BachelorDegree',
          name: 'Baccalauréat en musiques numériques'
        }
      }
    }
  };


  const vcJwt = await createVerifiableCredentialJwt(vcPayload, issuer);
  console.log('//// Verifiable Credential:\n', vcJwt);


  const vpPayload = {
    vp: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      verifiableCredential: [vcJwt]
    }
  };

  const vpJwt = await createVerifiablePresentationJwt(vpPayload, issuer);
  console.log('\n//// Verifiable Presentation:\n', vpJwt);

  const resolver = new Resolver(customResolver);

  const verifiedVC = await verifyCredential(vcJwt, resolver);
  console.log('//// Verified Credentials:\n', verifiedVC);

  const verifiedVP = await verifyPresentation(vpJwt, resolver);
  console.log('\n//// Verified Presentation:\n', verifiedVP);
}

run().catch((err) => console.error('Unexpected error:', err));

