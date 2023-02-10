import { new_connection } from '../connection_detail.js';
const DIDComm = require('encryption-envelope-js');
const bs58 = require('bs58');
const rp = require('request-promise');
const uuidv4 = require('uuid/v4');

export default {

    async connectByInvite(component, invite){
      //make a did
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

      var req = {
        "@id":  (uuidv4().toString()),
        "~transport": {
          "return_route": "all"
        },
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/request",
        "label": "ToolBox",
        "connection": {
          "DID": toolbox_did.did,
          "DIDDoc": {
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
        }
      };
      console.log("Exchange Request", req);

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
      let connection_detail = new_connection(invite.label, response.connection.DIDDoc, toolbox_did);
      console.log("connection detail", connection_detail);
      component.add_agent(connection_detail.to_store());
      return connection_detail;
    }
}
