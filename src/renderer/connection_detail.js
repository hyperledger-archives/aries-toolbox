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

        this.inbound_processor = inbound_processor;

        this.outbound_msg_queue = [];

        this.didcomm = new DIDComm.DIDComm();

        let cd = this;

        // evaluate DID Document to pick transport
        // filter for IndyAgent / DIDComm
        let supported_types = ["IndyAgent", "did-communication"];
        this.service_list = this.did_doc.service.filter(s => supported_types.includes(s.type));
        function protocol(endpoint){
            return endpoint.split(":")[0];
        }
        function servicePrioritySort(a, b){
            if(protocol(a.serviceEndpoint) === protocol(b.serviceEndpoint)){
                return 0; //same
            }
            if(protocol(a.serviceEndpoint) === "ws"){
                return -1; //higher priority
            } else { //b is ws
                return 1;
            }
        }
        this.service_list.sort(servicePrioritySort);

        this.service = this.service_list[0]; //use the first in the list
        this.service_transport_protocol = protocol(this.service.serviceEndpoint);

        if(this.service_transport_protocol === "ws" || this.service_transport_protocol === "wss"){
            this.socket = new WebSocket(this.service.serviceEndpoint);

            // Connection opened
            this.socket.addEventListener('open', function (event) {
                console.log("Socket Transport Opened");
                //socket.send('Hello Server!');
                //send queued messages in this.outbound_msg_queue
                while(cd.outbound_msg_queue.length > 0){
                    cd.socket.send(cd.outbound_msg_queue.pop());
                }
            });

            // Listen for messages
            this.socket.addEventListener('message', async function (event) {
                console.log('Message from server ', event.data);
                let reader = new FileReader();
                reader.addEventListener("loadend", async function(){
                    await cd.unpack_and_process_inbound(reader.result);
                });
                reader.readAsText(event.data);
                //await cd.unpack_and_process_inbound(event.data);
            });
        }

    }

    needs_return_route_poll(){
        return this.service_transport_protocol === "http" || this.service_transport_protocol === "https";
    }

    async send_message(msg, set_return_route = true) {
        let cd = this; // Safe reference to connection detail
        msg['@id'] = '@id' in msg ? msg['@id'] : (uuidv4().toString()); // add id
        if (set_return_route) {
            if (!("~transport" in msg)) {
                msg["~transport"] = {}
            }
            msg["~transport"]["return_route"] = "all"
        }
        console.log("sending message", msg);
        //console.log("to", bs58.decode(this.did_doc.service[0].recipientKeys[0]));
        await this.didcomm.Ready;
        const packedMsg = await this.didcomm.packMessage(JSON.stringify(msg), [bs58.decode(this.service.recipientKeys[0])], this.my_key);
        //send request
        if(this.service_transport_protocol === "http" || this.service_transport_protocol === "https"){
            var options = {
                method: 'POST',
                uri: this.service.serviceEndpoint,
                body: packedMsg,
            };
            rp(options)
                .then(async function (parsedBody) {
                    if (!parsedBody) { // POST succeeded...
                        console.log("No response for post; continuing.");
                        return;
                    }

                    await cd.unpack_and_process_inbound(parsedBody);

                })
                .catch(function (err) { // POST failed...
                    console.log("request post err", err);
                });
        } else if(this.service_transport_protocol === "ws" || this.service_transport_protocol === "wss"){
            if(this.socket.readyState === this.socket.OPEN){
                this.socket.send(new Buffer.from(packedMsg, 'ascii'));
            } else {
                this.outbound_msg_queue.push(new Buffer.from(packedMsg, 'ascii'));
            }
        } else {
            throw "Unsupported transport protocol";
        }

    }

    async unpack_and_process_inbound(packed_msg){
        await this.didcomm.Ready;
        const unpackedResponse = await this.didcomm.unpackMessage(packed_msg, this.my_key);
        //console.log("unpacked", unpackedResponse);
        const response = JSON.parse(unpackedResponse.message);

        //TODO: Process signed fields
        console.log("received message", response);
        this.inbound_processor(response);
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
    let my_key = {
        privateKey: bs58.decode(obj.my_key_b58.privateKey),
        publicKey: bs58.decode(obj.my_key_b58.publicKey),
        publicKey_b58: obj.my_key_b58.publicKey_b58,
        privateKey_b58: obj.my_key_b58.privateKey_b58
    };
    return new ConnectionDetail(
        obj.id,
        obj.label,
        obj.did_doc,
        my_key,
        inbound_processor
    );
}

export { ConnectionDetail, new_connection, from_store };
