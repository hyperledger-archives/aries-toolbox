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
        };
        let id = (uuidv4().toString());
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
        };
        console.log("Exchange Request", req);
        const signed = didcomm.signedAttachment(req['did_doc~attach'], toolbox_did);
        console.log("Example attachment signing:", signed);
        console.log("Example attachment verification:", didcomm.verifySignedAttachment(signed));
        console.log("Example attachment decoding:", didcomm.decodeSignedAttachment(signed));

        //send request, look for response
        const packedMsg = didcomm.packMessage(JSON.stringify(req), [bs58.decode(invite.recipientKeys[0])], toolbox_did, true);
        console.log("Packed Exchange Request", packedMsg);

        // this code assumes that the response comes via return-route on the post.
        const res = await rp({
            method: 'POST',
            uri: invite.serviceEndpoint,
            body: packedMsg,
        });
        const unpackedResponse = didcomm.unpackMessage(res, toolbox_did);
        const response = JSON.parse(unpackedResponse.message);
        //TODO: Validate signature against invite.
        let buff = Buffer.from(response['connection~sig'].sig_data, 'base64');
        let text = buff.toString('ascii');
        //first 8 chars are a timestamp for the signature, so we ignore those before parsing value
        response.connection = JSON.parse(text.substring(8));
        console.log("response message", response);
        let connection_detail = new_connection(invite.label, response['did_doc~attach'], toolbox_did);
        console.log("connection detail", connection_detail);
        component.add_agent(connection_detail.to_store());

        //send a complete message once connection is established
        var com = {
            "@type": "https://didcomm.org/didexchange/1.0/complete",
            "@id": id,
            "~thread": {
                "thid": id,
                "pthid": invite.id
            }
        };
        console.log("Exchange Complete", com);

        //send complete message
        const packedMsg = didcomm.packMessage(JSON.stringify(com), [bs58.decode(invite.recipientKeys[0])], toolbox_did, true);
        console.log("Packed Exchange Complete", packedMsg);
        return connection_detail;
    }
}
