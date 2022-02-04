import { new_connection } from '../connection_detail.js';
const DIDComm = require('encryption-envelope-js');
const bs58 = require('bs58');
const rp = require('request-promise');
const uuidv4 = require('uuid/v4');

export default {
    new_agent_invitation_process(component, invite) {
        const didcomm = new DIDComm.DIDComm();
        await didcomm.Ready;
        const toolbox_did = didcomm.generateKeyPair();
        toolbox_did.did = bs58.encode(Buffer.from(toolbox_did.publicKey.subarray(0, 16)));
        toolbox_did.publicKey_b58 = bs58.encode(Buffer.from(toolbox_did.publicKey));
        toolbox_did.privateKey_b58 = bs58.encode(Buffer.from(toolbox_did.privateKey));

        var req = {
            "@id": (uuidv4().toString()),
            "@type": "https://didcomm.org/didexchange/1.0/request",
            "~thread": { 
                "thid": "a46cdd0f-a2ca-4d12-afbf-2e78a6f1f3ef",
                "pthid": "032fbd19-f6fd-48c5-9197-ba9a47040470" 
            },
            "label": "Toolbox",
            //"goal_code": "aries.rel.build",        <------- Necessary?
            //"goal": "To create a relationship",      <--/ 
            "did": toolbox_did.did,
            "did_doc~attach": {
                "@id": toolbox_did.did,
                "mime-type": "application/json",
                "data": {
                    "base64": "eyJ0eXAiOiJKV1Qi... (bytes omitted)",
                    "jws": {
                        "header": {
                            "kid": "did:key:z6MkmjY8GnV5i9YTDtPETC2uUAW6ejw3nk5mXF5yci5ab7th"
                        },
                        "protected": "probably",
                        "signature": "pending"
                    }
                }
            }
        }
    }
}
