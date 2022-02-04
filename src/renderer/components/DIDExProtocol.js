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

        let service_endpoint_block = {
            "id": toolbox_did.did + ";indy",
            "type": "IndyAgent",
            "recipientKeys": [toolbox_did.publicKey_b58],
            "serviceEndpoint": ""
          };
    
        if(component.mediator_connection && component.mediator_connection.active_as_mediator){
            let mediator_agent = component.agent_list.find(a => a.active_as_mediator === true);
            if(mediator_agent != null) {
              service_endpoint_block["routingKeys"] = mediator_agent.mediator_info.routing_keys || [];
              service_endpoint_block["serviceEndpoint"] = mediator_agent.mediator_info.endpoint;
            }
            console.log('Informing mediator about new key to route...');
            await component.add_route_to_mediator(toolbox_did.publicKey_b58);
        }
        let id = (uuidv4().toString())
        var req = {
            "@id": id,
            "@type": "https://didcomm.org/didexchange/1.0/request",
            "~thread": { 
                "thid": id,
                "pthid": invite.id 
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
