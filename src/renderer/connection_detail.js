const DIDComm = require('encryption-envelope-js');
const bs58 = require('bs58');
const rp = require('request-promise');
const uuidv4 = require('uuid/v4');
const WebSocketAsPromised = require('websocket-as-promised');
// const WebSocket = require('ws');

class ConnectionDetail {
    constructor(input, inbound_processor = null) {
        this.id = input.id;
        this.label = input.label;
        this.did_doc = input.did_doc;
        this.my_key = input.my_key;

        this.active_as_mediator = input.active_as_mediator || false;
        this.mediator_info = input.mediator_info || null;

        this.inbound_processor = inbound_processor;

        this.didcomm = new DIDComm.DIDComm();

        this.use_return_route = true;
        this.unpacked_processor = null;

        this.on_disconnect = null;

        // evaluate DID Document to pick transport
        // filter for IndyAgent / DIDComm
        let supported_types = ["IndyAgent", "did-communication"];
        this.service_list = this.did_doc.service.filter(s => supported_types.includes(s.type));
        function protocol(endpoint) {
            return endpoint.split(":")[0];
        }
        function servicePrioritySort(a, b){
            if(protocol(a.serviceEndpoint) === protocol(b.serviceEndpoint)){
                return 0; //same protocol
            }
            if(protocol(a.serviceEndpoint) === "ws") {
                return -1; //higher priority
            }
            if(protocol(a.serviceEndpoint) === "wss"){
                return -1; //higher priority
            } else { //b's protocol might be ws
                return 1;
            }
        }
        this.service_list.sort(servicePrioritySort);

        this.service = this.service_list[0]; //use the first in the list
        this.service_transport_protocol = protocol(this.service.serviceEndpoint);
        console.log("Service to use", this.service);
        if (this.service_transport_protocol === "ws" ||
            this.service_transport_protocol === "wss") {

            this.socket = new WebSocketAsPromised(this.service.serviceEndpoint, {
                createWebSocket: url => new WebSocket(url),
                extractMessageData: event => event, // <- this is important
                // WebSocket specific pack steps
                packMessage: data => {
                    return new Buffer.from(data, 'ascii');
                },
                unpackMessage: async data => {

                    if (data instanceof MessageEvent) {
                        data = data.data;
                    }

                    if (data instanceof Blob) {
                        data = await blobToStr(data);
                    } else if (data instanceof Buffer){
                        data = data.toString('ascii');
                    } else {
                        console.log("data type", data);
                    }
                    return data;
                }
            });

            // Listen for messages
            this.socket.onUnpackedMessage.addListener(async event => {
                if(this.unpacked_processor){
                    this.unpacked_processor(await event);
                } else {
                    this.process_inbound(await this.unpackMessage(await event));
                }
            });

            this.socket.onSend.addListener(data => console.log('Socket message sent', data));

            // error handling
            this.socket.onError.addListener(event => {
                console.error(event)
                let datestring = new Date().toISOString();
                fs.writeFileSync('crash.log', datestring +"\n"+ err + "\n" + err.stack + "\n", {flag:'a+'});
            });
            // close handling
            this.socket.onClose.addListener(async event => {
                console.log(`websocket connection closed: ${event.reason}`)

                // reopen, then send message.
                if(this.on_disconnect){
                    this.on_disconnect();
                }

            });
        }
    }

    enable_return_route(){
        this.use_return_route = true;
        // reset socket if in use
        this.socket_reset();
    }
    disable_return_route(){
        this.use_return_route = false;
        // reset socket if in use
        this.socket_reset();
    }
    socket_reset() {
        if(this.socket){
            this.socket.close();
        }
    }

    needs_return_route_poll() {
        //return true;
        return this.service_transport_protocol === "http" || this.service_transport_protocol === "https";
    }

    set_reconnect_message_provider(f){
        this.packed_reconnect_message = f;
    }

    async send_message(msg) {
        console.log("Sending message:", msg);
        let message_to_send = {
            ...msg
        }

        if (!('@id' in message_to_send)) { // Ensure @id is populated
            message_to_send['@id'] = uuidv4().toString();
        }

        // don't use return_route if this is the active mediator
        // messages will arrive via the main agentlist
        if (this.use_return_route) {
            if (!("~transport" in message_to_send)) {
                message_to_send["~transport"] = {}
            }
            message_to_send["~transport"]["return_route"] = "all"
        }

        const packedMsg = await this.packMessage(message_to_send);

        // Send message
        if (this.service_transport_protocol === "http" ||
            this.service_transport_protocol === "https") {

            var options = {
                method: 'POST',
                uri: this.service.serviceEndpoint,
                body: packedMsg,
            };
            rp(options)
                .then(async parsedBody => { // POST succeeded...
                    if (!parsedBody) {
                        console.log("No response for post; continuing.");
                        return;
                    }
                    await this.process_inbound(await this.unpackMessage(parsedBody));
                })
                .catch(function (err) { // POST failed...
                    console.log("Error while sending message:", err);
                });
        } else if (this.service_transport_protocol === "ws" ||
            this.service_transport_protocol === "wss") {

            if (this.socket) {
                await this.socket.open();
            } else {
                throw 'No socket connection available';
            }

            this.socket.sendPacked(packedMsg);
        } else {
            throw "Unsupported transport protocol";
        }
        return message_to_send
    }

    async packMessage(msg) {
        await this.didcomm.Ready;
        return this.didcomm.packMessage(
            JSON.stringify(msg),
            [bs58.decode(this.service.recipientKeys[0])],
            this.my_key
        );
    }

    async extract_packed_message_recipients(encMsg){
        let wrapper
        if (typeof encMsg === 'string') {
            wrapper = JSON.parse(encMsg)
        } else {
            wrapper = encMsg
        }
        const recipsJson = this.didcomm.strB64dec(wrapper.protected);
        const recipsOuter = JSON.parse(recipsJson);
        const keys = recipsOuter.recipients.map(r => r.header.kid);
        return keys;
    }

    async unpackMessage(packed_msg) {
        await this.didcomm.Ready;
        // this will only work if the key matches. If it doesn't match, it'll fail.
        const unpackedResponse = this.didcomm.unpackMessage(packed_msg, this.my_key);
        //console.log("unpacked", unpackedResponse);
        return JSON.parse(unpackedResponse.message);
    }

    async process_inbound(msg) {
        console.log('Received Message:', msg);
        this.inbound_processor(msg);
    }

    to_store() {
        return {
            id: this.id,
            label: this.label,
            did_doc: this.did_doc,
            active_as_mediator: this.active_as_mediator,
            mediator_info: this.mediator_info,
            my_key_b58: {
                privateKey: this.my_key.privateKey_b58,
                publicKey: this.my_key.publicKey_b58
            }
        }
    }
}

async function blobToStr(blob) {
    return await new Promise((resolve, _reject) => {
        let reader = new FileReader();
        reader.addEventListener("loadend", async function(){
            resolve(reader.result);
        });
        reader.readAsText(blob);
    });
}


function new_connection(label, did_doc, my_key, inbound_processor) {
    return new ConnectionDetail({
            id: (uuidv4().toString()),
            label: label,
            did_doc: did_doc,
            my_key: my_key,
        },
        inbound_processor
    );
}

function from_store(obj, inbound_processor) {
    let my_key = {
        privateKey: bs58.decode(obj.my_key_b58.privateKey),
        publicKey: bs58.decode(obj.my_key_b58.publicKey),
        privateKey_b58: obj.my_key_b58.privateKey,
        publicKey_b58: obj.my_key_b58.publicKey,
    };
    return new ConnectionDetail({
            id: obj.id,
            label: obj.label,
            did_doc: obj.did_doc,
            my_key: my_key,
            active_as_mediator: obj.active_as_mediator,
        },
        inbound_processor
    );
}

export { ConnectionDetail, new_connection, from_store };
