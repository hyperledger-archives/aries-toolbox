<template>
  <div id="wrapper" class="container-fluid">

    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">{{connection.label}}</a>
    </nav>

    <el-tabs type="border-card">
      <el-tab-pane label="Protocol Discovery">

        <input type="button" class="btn btn-secondary" v-on:click="run_protocol_discovery()" value="Query"/>
        <table class="table table-sm">
          <tr>
            <th>Protocol</th>
            <th>Roles</th>
          </tr>
          <tr v-for="p in supported_protocols">
            <td>{{p.pid}}</td>
            <td>{{p.roles}}</td>
          </tr>
        </table>

      </el-tab-pane>
      <el-tab-pane label="Compose">
        <input type="button" class="btn btn-secondary" v-on:click="compose_send()" value="Send"/>
        <v-jsoneditor v-model="compose_json">
        </v-jsoneditor>

      </el-tab-pane>

      <el-tab-pane label="BasicMessage">
        <div style="margin-bottom: 1em;">
          <el-input placeholder="Message to send" @keyup.enter.native="basicmessage_send" v-model="basicmessage_compose" style="width:500px;"></el-input>
          <el-button type="primary" @click="basicmessage_send">Send</el-button>

        </div>
        <div v-for="m in basicmessage_history.slice().reverse()">
          <div :class="'basicmessage-'+m.direction">{{m.msg.content}}</div>
        </div>

      </el-tab-pane>
      <el-tab-pane label="Connections Admin">

        <input type="button" class="btn btn-secondary" v-on:click="connection_list_request()" value="Load"/>
        <table class="table table-sm">
          <tr>
            <th>Their DID</th>
            <th>My DID</th>
            <th>Their Label</th>
            <th>Role</th>
            <th>Created</th>
          </tr>
          <tr v-for="c in connection_admin_list">
            <td>{{c.their_did}}</td>
            <td>{{c.my_did}}</td>
            <td>{{c.their_label}}</td>
            <td>{{c.their_role}}</td>
            <td>{{c.created_at}}</td>
          </tr>
        </table>

      </el-tab-pane>
      <el-tab-pane label="Message History">

        <input type="button" class="btn btn-secondary" v-on:click="message_history_clear()" value="Clear"/>
        <div class="message-display" v-for="m in message_history.slice().reverse()">
         <i>{{m.direction}}</i>
          <vue-json-pretty
            :deep=1
            :data="m.msg">
          </vue-json-pretty>
        </div>

      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<style>
  .message-display {
    margin-bottom: 1em;
    border-bottom: 1px solid lightgrey;
    padding-bottom: 1em;
  }
  .basicmessage-Sent {
    background-color: white;
    margin-right: 4em;
    margin-bottom: 1em;
    padding: 1em;
    border: 1px solid lightgrey;
    border-radius: 4px;
  }
  .basicmessage-Received {
    background-color: lightblue;
    margin-left: 4em;
    margin-bottom: 1em;
    padding: 1em;
    text-align: right;
    border: 1px solid lightgrey;
    border-radius: 4px;
  }
</style>

<script>
  const DIDComm = require('encryption-envelope-js');
  const bs58 = require('bs58');
  const rp = require('request-promise');

  import { mapState, mapActions } from "vuex"

  import VueJsonPretty from 'vue-json-pretty';
  import VJsoneditor from 'v-jsoneditor';

  export default {
    name: 'agent-base',
    components: {
      VueJsonPretty,
      VJsoneditor
    },
    methods: {
      ...mapActions("Connections", ["get_connection"]),
      async fetchAgentData(){
        //load from vue store
        // this is cloned from the datastore to allow fixing the key encodings.
        this.connection = JSON.parse(JSON.stringify(await this.get_connection(this.id)));
        // strange fixing of the encoding
        this.connection.my_key.privateKey = bs58.decode(this.connection.my_key.privateKey_b58);
        this.connection.my_key.publicKey = bs58.decode(this.connection.my_key.publicKey_b58);

        this.connection_loaded = true;
      },
      async run_protocol_discovery(){
        //send query
        let query_msg = {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/protocol-discovery/1.0/query",
          "query": "*"
        };
        this.send_message(query_msg);
      },
      async connection_list_request(){
        //send list request
        let msg = {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/connection-get-list"
        };
        this.send_message(msg);
      },
      async ConnectionList(msg){
        this.connection_admin_list = msg['results'];
      },
      async ProtocolDisclose(msg){
        //console.log(msg.protocols);
        this.supported_protocols = msg.protocols;
      },
      async message_history_add(msg, direction){
        this.message_history.push({
          'msg':msg,
          'direction': direction,
        });
      },
      async basicmessage_send(){
        let msg = {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/basicmessage/1.0/message",
          "content": this.basicmessage_compose
        };
        this.send_message(msg);
        this.basicmessage_compose = "";
      },
      async message_history_clear(){
        this.message_history.splice(0, this.message_history.length);//clear all entries
      },
      async compose_send(){
        this.send_message(this.compose_json, false);
      },
      async processInbound(msg){
        this.message_history_add(msg, "Received");
        var handlers = {
          "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/protocol-discovery/1.0/disclose": this.ProtocolDisclose,
          "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/connection-list": this.ConnectionList,
        };
        var handler = handlers[msg['@type']];
        if(handler){
          handler(msg);
        } else {
          console.log("Message without handler", msg);
        }
      },
      async send_message(msg, set_return_route = true){
        var vm = this; //safe reference to view model

        // add id
        msg['@id'] = (new Date()).getTime().toString();

        if (set_return_route) {
            // add return routing option
            msg["~transport"] =  {
                "return_route": "all"
            };
        }

        this.message_history_add(msg, "Sent");

        console.log("sending message", msg);
        console.log("to", bs58.decode(this.connection.did_doc.service[0].recipientKeys[0]));

        const didcomm = new DIDComm.DIDComm();
        await didcomm.Ready;
        const packedMsg = await didcomm.packMessage(JSON.stringify(msg), [bs58.decode(this.connection.did_doc.service[0].recipientKeys[0])], this.connection.my_key);

        //send request
        var options = {
            method: 'POST',
            uri: this.connection.did_doc.service[0].serviceEndpoint,
            body: packedMsg,
        };

        rp(options)
            .then(async function (parsedBody) {
              // POST succeeded...
              //console.log("request post response", parsedBody);
              if (!parsedBody) {
                console.log("No response for post; continuing.");
                return;
              }
              const unpackedResponse = await didcomm.unpackMessage(parsedBody, vm.connection.my_key);
              //console.log("unpacked", unpackedResponse);
              const response = JSON.parse(unpackedResponse.message);

              //TODO: Process signed fields

              console.log("received message", response);
              vm.processInbound(response);

            })
            .catch(function (err) {
                // POST failed...
              console.log("request post err", err);
            });

      }
    },
    data() {
      return {
        'id': this.$route.params.agentid,
        'connection': {'label':'loading...'},
        'connection_loaded': false,
        'message_history':[],
        'supported_protocols': [],
        'compose_json': {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/trust_ping/1.0/ping",
          "response_requested": true
        },
        'basicmessage_compose': "",
        'connection_admin_list': []
      }
    },
    computed: {
      basicmessage_history: function () {
        return this.message_history.filter(function(h){
          return h.msg['@type'] == "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/basicmessage/1.0/message";
        });
      }
    },
    async created () {
      // fetch the data when the view is created and the data is
      // already being observed
      await this.fetchAgentData();
      await this.run_protocol_discovery();
    },
  }
</script>
