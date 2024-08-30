import { ES256KSigner, hexToBytes } from 'did-jwt';
import { createJWT, decodeJWT } from 'did-jwt';

const key = 'bdb77b3ab5e9ef78dad5fd3ce9a38bf4268cb8e7b0001459083067462e27bb8b';
const signer = ES256KSigner(hexToBytes(key));

const jwt = await createJWT(
  { aud: 'did:web:soonding.github.io', name: 'Your Name' },
  { issuer: 'did:web:soonding.github.io', signer },
  { alg: 'ES256K' }
);
console.log('JWT:', jwt);

console.log('JWT Decoded:', decodeJWT(jwt));

