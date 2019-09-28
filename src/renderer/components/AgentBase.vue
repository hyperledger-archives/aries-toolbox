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

      <el-tab-pane label="Connections">
        <el-row>
        <el-collapse v-model="exspanded_connection_items">
            <div v-for="(connection, key, index) in connections">
                <el-collapse-item v-bind:title="connection.their_label" :name="key">
                    <el-row>
                        <div>
                              <vue-json-pretty
                                :deep=1
                                :data="connection">
                              </vue-json-pretty>
                              <el-form :model="connectionUpdateForm[key]" class="connectionUpdateForm">
                                <el-form-item label="role" prop="their_role">
                                  <el-input placeholder="connectionUpdateForm[key].their_role" v-model="connectionUpdateForm[key].their_role"></el-input>
                                </el-form-item>
                                <el-form-item label="label" prop="their_label">
                                  <el-input placeholder="connectionUpdateForm[key].their_label" v-model="connectionUpdateForm[key].their_label"></el-input>
                                  <el-button type="primary" @click="updateAgentConnection(connection)">update</el-button>
                                </el-form-item>
                            <el-button v-on:click="collapse_expanded_connections(key)">
                                close expanded connection details
                            </el-button>
                            </el-form>
                        </div>
                    </el-row>
                </el-collapse-item>
            </div>
        </el-collapse>
                <el-collapse v-model="exspanded_invites_items">
            <div v-for="(invite, key, index) in invitations">
                <el-collapse-item v-bind:title="invite.label" :name="invite.label">
                    <el-row>
                        <div>
                              <vue-json-pretty
                                :deep=1
                                :data="invite">
                              </vue-json-pretty>

                            <el-button v-on:click="collapse_expanded_invititions(key)">
                                close expanded connection details
                            </el-button>

                        </div>
                    </el-row>
                </el-collapse-item>
            </div>
        </el-collapse>
            <el-button type="primary" @click="fetchNewInvite()">create new invite</el-button>
        </el-row>
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
      <el-tab-pane label="Schema">
        <div class="schema-display" v-for="schema in schemas">
        Name: {{schema.name}}
        <br/>
        Version: {{schema.version}}
          <vue-json-pretty
            :deep=1
            :data="schema.attributes">
          </vue-json-pretty>
        </div>
        <div style="margin-bottom: 1em;">
          <p>New Schema</p>
          <p><el-input placeholder="Name" label="name" v-model="temp_schema_name" style="width:500px;"></el-input></p>
          <p><el-input placeholder="Version" label="version" v-model="temp_schema_version" style="width:500px;"></el-input></p>
          <p>Attributes:</p>
          <ul style="list-style-type:none;">
            <div class="temp_schema_attributes_display" v-for="attr in temp_schema_attributes">
              <li>{{attr}}</li>
            </div>
          </ul>
          <el-input placeholder="Attribute" @keyup.enter.native="temp_schema_add_attribute" v-model="temp_schema_attribute" style="width:500px;"> </el-input>
          <el-button type="primary" @click="temp_schema_add_attribute" >add attribute</el-button> 
          <el-button type="primary" @click="schema_persist">Create Schema</el-button>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Credential Definition">
      </el-tab-pane>
      <el-tab-pane label="Presentation Definition">
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
      async fetchAgentConnections(){
        let query_msg = {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/connection-get-list",
          "~transport": {
            "return_route": "all"
          }
        }
        this.send_message(query_msg);
      },
      async updateAgentConnection(connection){
        let query_msg = {
            "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/update",
            "connection_id": connection.connection_id,
            "label": this.connectionUpdateForm[connection.connection_id].their_label,
            "role": this.connectionUpdateForm[connection.connection_id].their_role,
            "~transport": {
              "return_route": "all"
            }
        }
        this.send_message(query_msg);
      },
      async updatedConnection(msg){
          this.connections[msg.connection.connection_id] = msg.connection
          this.connectionUpdateForm = this.connections;
      },
      async fetchedConnectionList(msg){
        const connections = msg.results.reduce(function(acc, cur, i) {
          acc[cur.connection_id] = cur;
          return acc;
        }, {});
        this.connections = connections
        this.connectionUpdateForm = connections
      },
      async newInvitation(msg){
        console.log(msg.invitation)
        const newInvite = this.invitations[ msg.connection_id] = {
          //... msg.invitation, // invitations is not a json yet... 
          "invitation": msg.invitation, 
          "connection_id" : msg.connection_id, 
          "invitation_url": msg.invitation_url}
      },
      async fetchNewInvite(){
        let query_msg = {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/create-invitation",
          "label": "A label",
          "role": "normal",
          "accept": "auto",
          "public": false,
          "multi_use": true,
          "~transport": {
            "return_route": "all"
          }
        }
        this.send_message(query_msg);
      },
      async run_protocol_discovery(){
        //send query
        let query_msg = {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/discover-features/1.0/query",
          "query": "*"
        };
        this.send_message(query_msg);
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
      async schemas(){
        connection = Connections.agent_list.find(function(element){
          return element.id == this.id;
        });
        return connection.schemas;
      },
      async temp_schema_attributes_clear(){
        this.schema_attributes = [];
      },
      async temp_schema_add_attribute(){
        this.temp_schema_attributes = [...this.temp_schema_attributes,this.temp_schema_attribute];
        this.temp_schema_attribute = '';
      },
      async schema_persist(){
        ADD_SCHEMA(this.temp_schema_name,this.temp_schema_version,this.temp_schema_attribute)
      },
      async compose_send(){
        this.send_message(this.compose_json, false);
      },
      async processInbound(msg){
        this.message_history_add(msg, "Received");
        var handlers = {
          "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/discover-features/1.0/disclose": this.ProtocolDisclose,
          "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/connection-list": this.fetchedConnectionList, 
          "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/connection": this.updatedConnection,
          //"did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/ack": this.removeConnection,
          "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/invitation": this.newInvitation,
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
      },
      async collapse_expanded_connections(connection_id){
        let index = this.exspanded_connection_items.indexOf(connection_id)
        this.exspanded_connection_items.splice(index, 1);
      },
      async collapse_expanded_invititions(id){
        let index = this.exspanded_invites_items.indexOf(id)
        this.exspanded_invites_items.splice(index, 1);
      },
    },
    data() {
      return {
        'id': this.$route.params.agentid,
        'connection': {'label':'loading...'},
        'connection_loaded': false,
        'message_history':[],
        'temp_schema_attributes':[],
        'temp_schema_name':'',
        'temp_schema_version':'',
        'temp_schema_attribute':'',
        'supported_protocols': [],
        'compose_json': {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/trust_ping/1.0/ping",
          "response_requested": true
        },
        'basicmessage_compose': "",
        'connections':[],
        'connectionUpdateForm':{},
        'exspanded_connection_items':[],
        'invitations':{},
        'exspanded_invites_items':[],
      }
    },
    computed: {
      ...mapState(['Connections']),
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
      await this.fetchAgentConnections();
      // await this.fetchNewInvite(); // do not automatically create invite
    },
  }
</script>
