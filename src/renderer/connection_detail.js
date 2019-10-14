const DIDComm = require('encryption-envelope-js');
const bs58 = require('bs58');
const rp = require('request-promise');
const uuidv4 = require('uuid/v4');

class ConnectionDetail {
    constructor(id, label, did_doc, my_key, inbound_processor = null) {
        this.id = id;
        this.label = label;
        this.did_doc = did_doc;
        this.my_key = my_key;

        this.message_history = [];
        this.last_sent_msg_id = null;
        this.inbound_processor = inbound_processor;
    }

    async send_message(msg, set_return_route = true) {
        var cd = this; // Safe reference to connection detail
        msg['@id'] = '@id' in msg ? msg['@id'] : (uuidv4().toString()); // add id
        this.last_sent_msg_id = msg['@id']
        if (set_return_route) {
            if (!("~transport" in msg)) {
                msg["~transport"] = {}
            }
            msg["~transport"]["return_route"] = "all"
        }
        this.message_history_add(msg, "Sent");
        console.log("sending message", msg);
        //console.log("to", bs58.decode(this.did_doc.service[0].recipientKeys[0]));
        const didcomm = new DIDComm.DIDComm();
        await didcomm.Ready;
        const packedMsg = await didcomm.packMessage(JSON.stringify(msg), [bs58.decode(this.did_doc.service[0].recipientKeys[0])], this.my_key);
        //send request
        var options = {
            method: 'POST',
            uri: this.did_doc.service[0].serviceEndpoint,
            body: packedMsg,
        };
        rp(options)
            .then(async function (parsedBody) {
                if (!parsedBody) { // POST succeeded...
                    console.log("No response for post; continuing.");
                    return;
                }
                const unpackedResponse = await didcomm.unpackMessage(parsedBody, cd.my_key);
                //console.log("unpacked", unpackedResponse);
                const response = JSON.parse(unpackedResponse.message);

                //TODO: Process signed fields
                console.log("received message", response);
                cd.inbound_processor(response);
            })
            .catch(function (err) { // POST failed...
                console.log("request post err", err);
            });
    }

    message_history_add(msg, direction){
        this.message_history.push({
            'msg':msg,
            'direction': direction,
        });
    }

    message_history_clear(){
        this.message_history.splice(0, this.message_history.length);//clear all entries
    }

    to_store() {
        return {
            id: this.id,
            label: this.label,
            did_doc: this.did_doc,
            my_key_b58: {
                privateKey: this.my_key.privateKey_b58,
                publicKey: this.my_key.publicKey_b58
            }
        }
    }
}

function new_connection(label, did_doc, my_key, inbound_processor) {
    return new ConnectionDetail(
        (uuidv4().toString()),
        label,
        did_doc,
        my_key,
        inbound_processor
    );
}

function from_store(obj, inbound_processor) {
    if (!obj.message_history) {
        obj.message_history = [];
    }
    if (!obj.last_sent_msg_id) {
        obj.last_sent_msg_id = null;
    }
    let my_key = {
        privateKey: bs58.decode(obj.my_key_b58.privateKey),
        publicKey: bs58.decode(obj.my_key_b58.publicKey),
        publicKey_b58: obj.my_key_b58.publicKey_b58,
        privateKey_b58: obj.my_key_b58.privateKey_b58
    }
    return new ConnectionDetail(
        obj.id,
        obj.label,
        obj.did_doc,
        my_key,
        inbound_processor
    );
}

export { ConnectionDetail, new_connection, from_store };
