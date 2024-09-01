const { Issuer } = require('did-jwt-vc');
const fetch = require('node-fetch');

async function createAndSendVC() {
    const issuer = new Issuer({ did: 'did:example:123', privateKey: 'your-private-key' });
    const vcPayload = {
        sub: 'did:example:456',
        vc: {
            '@context': 'https://www.w3.org/2018/credentials/v1',
            type: ['VerifiableCredential'],
            credentialSubject: {
                id: 'did:example:456',
                name: 'John Doe',
                email: 'john.doe@example.com'
            }
        }
    };
    const jwt = await issuer.issue(vcPayload);

    // 챗봇에게 VC 전송
    fetch('http://localhost:3000/verify-credential', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt })
    })
    .then(response => response.json())
    .then(data => console.log(data));
}

// 챗봇으로부터 요구 받은 속성 정보 확인
fetch('http://localhost:3000/request-credential')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        createAndSendVC();
    });


