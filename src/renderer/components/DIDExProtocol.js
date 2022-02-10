import { new_connection } from '../connection_detail.js';
const DIDComm = require('encryption-envelope-js');
const bs58 = require('bs58');
const rp = require('request-promise');
const uuidv4 = require('uuid/v4');

export default {

    async connectByInvite(component, invite) {
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
            "did": toolbox_did.did,
            "~transport": {"return_route": "all"}
        };

        let DIDDoc = {
            "@context": "https://w3id.org/did/v1",
            "id": toolbox_did.did,
            "publicKey": [{
              "id": toolbox_did.did + "#keys-1",
              "type": "Ed25519VerificationKey2018",
              "controller": toolbox_did.did,
              "publicKeyBase58": toolbox_did.publicKey_b58
            }],
            "service": [service_endpoint_block]
          }
        req['did_doc~attach'] = didcomm.signedAttachment(DIDDoc, toolbox_did);

        //send request, look for response
        const packedDIDExMsg = didcomm.packMessage(JSON.stringify(req), [didcomm.ed25519PubEncoder.decode(invite.services[0].recipientKeys[0])], toolbox_did, true);

        // this code assumes that the response comes via return-route on the post.
        const res = await rp({
            method: 'POST',
            uri: invite.services[0].serviceEndpoint,
            body: packedDIDExMsg,
        });
        const unpackedExResponse = didcomm.unpackMessage(res, toolbox_did);
        const response = JSON.parse(unpackedExResponse.message);

        didcomm.verifySignedAttachment(response['did_doc~attach']);
        if(response['did_doc~attach'].data.jws.header.kid != invite.services[0].recipientKeys[0]){
            throw new Error("Signer of DID Doc is not original sender of invitation.")
        }
        let responseDoc = didcomm.decodeSignedAttachment(response['did_doc~attach']);
        
        let connection_detail = new_connection(invite.label, responseDoc, toolbox_did);
        component.add_agent(connection_detail.to_store());

        //send a complete message once connection is established
        const com = {
            "@type": "https://didcomm.org/didexchange/1.0/complete",
            "@id": id,
            "~thread": {
                "thid": id,
                "pthid": invite.id
            }
        };

        //send complete message
        const packedComplete = await connection_detail.send_message(com);
        return connection_detail;
    }
}
