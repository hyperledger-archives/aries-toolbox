<template>
  <div id="wrapper" class="container-fluid">

    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">Agent Toolbox</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" href="#">New Connection</a>
          </li>
        </ul>
      </div>
    </nav>

    <div class="card" style="" v-for="a in agent_list">
      <div class="card-body">
        <h5 class="card-title">{{a.label}}</h5>
        <a href="#" class="card-link" v-on:click="openConnection(a)">Connect</a>
        <a href="#" class="card-link">Edit</a>
        <a href="#" class="card-link" v-on:click="deleteConnection(a)">Delete</a>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        New Agent Connection
      </div>
      <div class="card-body">
        <input type="text" class="form-control" placeholder="Paste Agent Invite" v-model="new_agent_invitation"/>
        <input type="button" class="btn btn-secondary" v-on:click="new_agent_invitation_process()" value="Add"/>
      </div>
    </div>

  </div>
</template>


<script>
const electron = require('electron');
const bs58 = require('bs58');
const rp = require('request-promise');
const DIDComm = require('encryption-envelope-js');
//import DIDComm from 'didcomm-js';
import { mapState, mapActions } from "vuex"
import { new_connection } from '../connection_detail.js';
const uuidv4 = require('uuid/v4');

export default {
  name: 'agent-list',
  components: {  },
  computed: {
    ...mapState("Agents", ["agent_list"]),
  },
  methods: {
    ...mapActions("Agents", ["add_agent", "delete_agent"]),

    openConnection: async function(a) {
      const modalPath = process.env.NODE_ENV === 'development'
        ? 'http://localhost:9080/#/agent/'+a.id
        : `file://${__dirname}/index.html#agent/`+a.id;
      let win = new electron.remote.BrowserWindow({ width: 800, height: 600, webPreferences: {webSecurity: false} })
      win.on('close', function () { win = null });
      win.loadURL(modalPath)

    },
    deleteConnection: async function(a){
      this.delete_agent(a);
    },
    async new_agent_invitation_process(){
      //process invite, prepare request
      var vm = this; //hang on to view model reference
      console.log("invite", this.new_agent_invitation);
      //extract c_i param
      function getUrlVars(url) {
        var vars = {};
        var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
          vars[key] = value;
        });
        return vars;
      }
      /*
       * JavaScript base64 / base64url encoder and decoder
       */

      var b64c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"   // base64 dictionary
      var b64u = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"   // base64url dictionary
      var b64pad = '='
      /* base64_encode_data
       * Internal helper to encode data to base64 using specified dictionary.
       */
      function base64_encode_data(data, len, b64x) {
        var dst = ""
        var i

        for (i = 0; i <= len - 3; i += 3)
        {
          dst += b64x.charAt(data.charCodeAt(i) >>> 2)
          dst += b64x.charAt(((data.charCodeAt(i) & 3) << 4) | (data.charCodeAt(i+1) >>> 4))
          dst += b64x.charAt(((data.charCodeAt(i+1) & 15) << 2) | (data.charCodeAt(i+2) >>> 6))
          dst += b64x.charAt(data.charCodeAt(i+2) & 63)
        }

        if (len % 3 == 2)
        {
          dst += b64x.charAt(data.charCodeAt(i) >>> 2)
          dst += b64x.charAt(((data.charCodeAt(i) & 3) << 4) | (data.charCodeAt(i+1) >>> 4))
          dst += b64x.charAt(((data.charCodeAt(i+1) & 15) << 2))
          dst += b64pad
        }
        else if (len % 3 == 1)
        {
          dst += b64x.charAt(data.charCodeAt(i) >>> 2)
          dst += b64x.charAt(((data.charCodeAt(i) & 3) << 4))
          dst += b64pad
          dst += b64pad
        }

        return dst
      }

      /* base64_encode
       * Encode a JavaScript string to base64.
       * Specified string is first converted from JavaScript UCS-2 to UTF-8.
       */
      function base64_encode(str) {
        var utf8str = unescape(encodeURIComponent(str))
        return base64_encode_data(utf8str, utf8str.length, b64c)
      }

      /* base64url_encode
       * Encode a JavaScript string to base64url.
       * Specified string is first converted from JavaScript UCS-2 to UTF-8.
       */
      function base64url_encode(str) {
        var utf8str = unescape(encodeURIComponent(str))
        return base64_encode_data(utf8str, utf8str.length, b64u)
      }

      /* base64_charIndex
       * Internal helper to translate a base64 character to its integer index.
       */
      function base64_charIndex(c) {
        if (c == "+") return 62
        if (c == "/") return 63
        return b64u.indexOf(c)
      }

      /* base64_decode
       * Decode a base64 or base64url string to a JavaScript string.
       * Input is assumed to be a base64/base64url encoded UTF-8 string.
       * Returned result is a JavaScript (UCS-2) string.
       */
      function base64_decode(data) {
        var dst = ""
        var i, a, b, c, d, z

        for (i = 0; i < data.length - 3; i += 4) {
          a = base64_charIndex(data.charAt(i+0))
          b = base64_charIndex(data.charAt(i+1))
          c = base64_charIndex(data.charAt(i+2))
          d = base64_charIndex(data.charAt(i+3))

          dst += String.fromCharCode((a << 2) | (b >>> 4))
          if (data.charAt(i+2) != b64pad)
            dst += String.fromCharCode(((b << 4) & 0xF0) | ((c >>> 2) & 0x0F))
          if (data.charAt(i+3) != b64pad)
            dst += String.fromCharCode(((c << 6) & 0xC0) | d)
        }

        dst = decodeURIComponent(escape(dst))
        return dst
      }

      /* base64url_sniff
       * Check whether specified base64 string contains base64url specific characters.
       * Return true if specified string is base64url encoded, false otherwise.
       */
      function base64url_sniff(base64) {
        if (base64.indexOf("-") >= 0) return true
        if (base64.indexOf("_") >= 0) return true
        return false
      }
      var invite_b64 = getUrlVars(this.new_agent_invitation)["c_i"];
      console.log("invite b64", invite_b64);
      //base 64 decode
      var invite_string = base64_decode(invite_b64);
      console.log("invite string", invite_string);
      var invite = JSON.parse(invite_string);
      console.log("invite", invite);

      //make a did
      const didcomm = new DIDComm.DIDComm();
      await didcomm.Ready;
      const toolbox_did = await didcomm.generateKeyPair();
      toolbox_did.did = bs58.encode(Buffer.from(toolbox_did.publicKey.subarray(0, 16)));
      toolbox_did.publicKey_b58 = bs58.encode(Buffer.from(toolbox_did.publicKey));
      toolbox_did.privateKey_b58 = bs58.encode(Buffer.from(toolbox_did.privateKey));
      console.log("new pair", toolbox_did);

      //const bob = await didcomm.generateKeyPair()
      //const message = 'I AM A PRIVATE MESSAGE'
      //const packedMsg = await didcomm.pack_auth_msg_for_recipients(message, [bob.publicKey], alice, true)
      //const unpackedMsg = await didcomm.unpackMessage(packedMsg, bob)
      //create connection request

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
            "service": [{
              "id": toolbox_did.did + ";indy",
              "type": "IndyAgent",
              "recipientKeys": [toolbox_did.publicKey_b58],
              //"routingKeys": ["<example-agency-verkey>"],
              "serviceEndpoint": ""
            }]
          }
        }
      };
      console.log("Exchange Request", req);

      //send request, look for response
      const packedMsg = await didcomm.packMessage(JSON.stringify(req), [bs58.decode(invite.recipientKeys[0])], toolbox_did, true);
      console.log("Packed Exchange Request", packedMsg);

      //send request
      var options = {
        method: 'POST',
        uri: invite.serviceEndpoint,
        body: packedMsg,
      };

      rp(options)
        .then(async function (parsedBody) {
          // POST succeeded...
          //console.log("request post response", parsedBody);
          const unpackedResponse = await didcomm.unpackMessage(parsedBody, toolbox_did);
          //console.log("unpacked", unpackedResponse);
          const response = JSON.parse(unpackedResponse.message);
          //console.log("response message", response);
          //TODO: Validate signature against invite.
          //console.log("connection sig b64 data", response['connection~sig'].sig_data);
          let buff = new Buffer(response['connection~sig'].sig_data, 'base64');
          let text = buff.toString('ascii');
          //first 8 chars are a timestamp for the signature, so we ignore those before parsing value
          response.connection = JSON.parse(text.substring(8));
          console.log("response message", response);
          //TODO: record endpoint and recipient key in connection record, along with my keypair. use invitation label
          // TODO: Clear invite box fter new add.
          let connection_detail = new_connection(invite.label, response.connection.DIDDoc, toolbox_did);
          console.log("connection detail", connection_detail);
          ///this.$store.Connections.commit("ADD_CONNECTION", connection_detail);
          vm.add_agent(connection_detail.to_store());
          vm.new_agent_invitation = ""; //clear input for next round
        })
        .catch(function (err) {
          // POST failed...
          console.log("request post err", err);
        });
    }
  },
  data() {
    return {
      new_agent_invitation: ""
    }

  }
}
</script>

<style>
</style>
