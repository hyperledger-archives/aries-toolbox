<template>

  <div id="wrapper" class="container-fluid">

    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">Agent Toolkit</a>
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

    <div class="card" style="" v-for="agent in agent_list" >
      <div class="card-body">
        <h5 class="card-title">{{agent.label}}</h5>
        <a href="#" class="card-link" v-on:click="openConnection(agent)">Connect</a>
        <a href="#" class="card-link">Edit</a>
        <a href="#" class="card-link" v-on:click="deleteConnection(agent)">Delete</a>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        New Agent Connection
      </div>
      <div class="card-body">
        <input type="text" class="form-control" placeholder="Paste Agent Invite" v-model="new_agent_invitation"/>
        <input type="button" class="btn btn-secondary" v-on:click="new_agent_invitation_process()" value="Connect"/>
      </div>
    </div>

  </div>
</template>


<script>
  const electron = require('electron');
  const DIDComm = require('encryption-envelope-js');
  const bs58 = require('bs58');
  const rp = require('request-promise');
  //import DIDComm from 'didcomm-js';
  import { mapState, mapActions, mapGetters } from "vuex"
  import * as helpers from '../DidComUtils'

  export default {
    name: 'connection-list',
    components: {  },
    computed: {
      //...mapState("connections", ["agent_list"]),
      //agent_list: () => this.$store.getters.userSet,
      ...mapGetters("connections",{agent_list:"get_agents"}),
    },
    methods: {
      ...mapActions("connections", ["add_connection", "delete_connection","send_connection_request"]),
      openConnection: async function(a) {
        const modalPath = process.env.NODE_ENV === 'development'
          ? 'http://localhost:9080/#/agent/'+a.id
          : `file://${__dirname}/index.html#agent/`+a.id;
        let win = new electron.remote.BrowserWindow({ width: 800, height: 600, webPreferences: {webSecurity: false} })
        win.on('close', function () { win = null });
        win.loadURL(modalPath)

      },
      deleteConnection: async function(a){
        this.delete_connection(a);
      },
      async new_agent_invitation_process(){
        //process invite, prepare request
        var vm = this; //hang on to view model reference
        console.log("invite", this.new_agent_invitation);

        //extract c_i param
        var invite_b64 = helpers.getUrlVars(this.new_agent_invitation)["c_i"];
        console.log("invite b64", invite_b64);
        //base 64 decode
        var invite_string = helpers.base64_decode(invite_b64);
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
          "@id": (new Date()).getTime().toString(),
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
                    "serviceEndpoint": "did.report"
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
        console.log("attempt to call send request",vm,this)
        try {
          debugger
          await vm.send_connection_request(options, toolbox_did, didcomm)
          vm.new_agent_invitation = ""; //clear input for next round
        } catch(error) {
          console.error("request post err",error)
        }
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
