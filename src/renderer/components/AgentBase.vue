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
        <p>Active Connections:</p>
        <el-collapse v-model="exspanded_connection_items">
            <div v-for="(connection, key, index) in activeConnections()">
                <el-collapse-item v-bind:title="connection.their_label" :name="key">
                    <el-row>
                        <div>
                              <vue-json-pretty
                                :deep=1
                                :data="connection">
                              </vue-json-pretty>
                              <el-form :model="connectionUpdateForm[key]" class="connectionUpdateForm">
                                <el-form-item label="Role:" prop="their_role">
                                  <el-input placeholder="connectionUpdateForm[key].their_role" v-model="connectionUpdateForm[key].their_role" style="width:300px;"></el-input>
                                </el-form-item>
                                <el-form-item label="Label:" prop="their_label">
                                  <el-input placeholder="connectionUpdateForm[key].their_label" v-model="connectionUpdateForm[key].their_label" style="width:300px;"></el-input>
                                  <br/><el-button type="primary" @click="updateAgentConnection(connection)">update</el-button>
                                  <el-button type="primary" @click="deleteAgentConnection(connection)">delete</el-button>
                                </el-form-item>
                            <el-button v-on:click="collapse_expanded_connections(key)">^</el-button>
                            </el-form>
                        </div>
                    </el-row>
                </el-collapse-item>
            </div>
        </el-collapse>
        <p>Pending Connections:</p>
        <el-collapse v-model="exspanded_connection_items">
            <div v-for="(connection, key, index) in pendingConnections()">
                <el-collapse-item v-bind:title="key" :name="key">
                    <el-row>
                        <div>
                              <vue-json-pretty
                                :deep=1
                                :data="connection">
                              </vue-json-pretty>
                              <el-form :model="connectionUpdateForm[key]" class="connectionUpdateForm">
                                <el-form-item label="Role:" prop="their_role">
                                  <el-input label="Role" placeholder="connectionUpdateForm[key].their_role" v-model="connectionUpdateForm[key].their_role" style="width:300px;" ></el-input>
                                  <br/><el-button type="primary" @click="updateAgentConnection(connection)">update</el-button>
                                  <el-button type="primary" @click="deleteAgentConnection(connection)">delete</el-button>
                                </el-form-item>
                            <el-button v-on:click="collapse_expanded_connections(key)">^</el-button>
                            </el-form>
                        </div>
                    </el-row>
                </el-collapse-item>
            </div>
        </el-collapse>
        <p>Open Invitations:</p>
        <el-collapse v-model="exspanded_invites_items">
            <div v-for="(invite, key, index) in invitations">
                <el-collapse-item v-bind:title="key" :name="key">
                    <el-row>
                        <div>
                              <vue-json-pretty
                                :deep=1
                                :data="invite">
                              </vue-json-pretty>
                            <el-button v-on:click="collapse_expanded_invititions(key)">^</el-button>
                        </div>
                    </el-row>
                </el-collapse-item>
            </div>
        </el-collapse>
        <p>Create Invitations:</p>
        <el-form>
        <el-form-group >
          <span slot="label">Label:</span>
            <el-input v-model="invite_label_form" style="width:100px;"> </el-input>
          <span slot="label">Role:</span>
            <el-input v-model="invite_role_form" style="width:100px;"> </el-input>
          <span slot="label">Acceptance:</span>
            <el-input v-model="invite_accept_form" style="width:100px;"> </el-input>
          <span slot="label">Public:</span>
            <el-switch label="Public:" v-model="invite_public_form"></el-switch>
          <span slot="label">Multi Use:</span>
            <el-switch label="Multi Use:" v-model="invite_multi_use_form"></el-switch>
        </el-form-group>
        <el-form-item>
            <el-button type="primary" @click="fetchNewInvite()">create new invite</el-button>
        </el-form-item>
        </el-form>
        <p>Add Static Agent:</p>
        <el-form :model=static_agent_form>
        <el-form-group >
          <span slot="label">Label:</span>
            <el-input v-model="static_agent_form.label" style="width:100px;"> </el-input>
          <span slot="label">Role:</span>
            <el-input v-model="static_agent_form.role" style="width:100px;"> </el-input>
          <span slot="label">Static Did:</span>
            <el-input v-model="static_agent_form.static_did" style="width:100px;"> </el-input>
          <span slot="label">Static Key:</span>
            <el-input v-model="static_agent_form.static_key" style="width:100px;"> </el-input>
          <span slot="label">Static Endpoint:</span>
            <el-input v-model="static_agent_form.static_endpoint" style="width:100px;"> </el-input>
        </el-form-group>
        <el-form-item>
            <el-button type="primary" @click="addStaticAgent()">Add Static Agent</el-button>
        </el-form-item>
        </el-form>

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
      <p>Schemas:</p>
      <el-collapse v-model="exspanded_schemas_items">
            <div v-for="(schema, key, index) in schemas">
                <el-collapse-item v-bind:title="schema.name +','+ schema.version" :name="key">
                    <el-row>
                        <div>
                              <vue-json-pretty
                                :deep=1
                                :data="schema">
                              </vue-json-pretty>
                            <el-button @click="publishSchema(key,'global_pool')">Publish</el-button>
                            <el-button v-if="!schema.ledger" type="primary" @click="removeSchema(key,'global_pool')">delete</el-button>
                            <el-button v-on:click="collapse_expanded_schemas(key)">^</el-button>
                        </div>
                    </el-row>
                </el-collapse-item>
            </div>
        </el-collapse>
        <p>Create schema:</p>
        <el-form :model=schemas_form>
        <el-form-group >
          <span slot="label">Name:</span>
            <el-input v-model="schemas_form.name" style="width:100px;"> </el-input>
          <span slot="label">Version:</span>
            <el-input v-model="schemas_form.version" style="width:100px;"> </el-input>
          <p>Attributes:</p>
          <ul>
            <li v-for='attribute in schemas_form.attributes'>
              {{ attribute }}
            </li>
          </ul>
          <span slot="label">Attribute:</span>
            <el-input @keyup.enter.native="schema_add_attribute" v-model="schemas_form.attribute" style="width:100px;"> </el-input>
            <el-button type="primary" @click="schema_add_attribute" >add attribute</el-button> 
        </el-form-group>
        <el-form-item>
            <el-button type="primary" @click="storeSchema()">create new schema</el-button>
        </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="Credential Definition">
        <p>Credential Definitions:</p>
        <el-collapse v-model="exspanded_cred_def_items">
            <div v-for="(cred_def, key, index) in cred_defs">
                <el-collapse-item v-bind:title="cred_def.cred_def_id" :name="key">
                    <el-row>
                        <div>
                          <vue-json-pretty
                            :deep=2
                            :data="cred_def">
                          </vue-json-pretty>
                          <el-collapse v-model="exspanded_credential_issuer_items">
                          <el-collapse-item title='Issue a credential offer' :name="key">
                            <el-row>
                              <div v-for="(attribute, key, index) in cred_def.primary.r" v-if="key!='master_secret'" prop="cred_def">
                                <span slot="label">{{key}}:</span>
                                  <el-input v-model="cred_def_form[cred_def.cred_def_id].attributes[index]" style="width:100px;"> </el-input>
                              </div>
                              <el-form :model=cred_def_form>
                                <el-form-item label="select connection:" >        
                                  <el-select v-model="cred_def_form.connection" filterable placeholder="select connection to issue to:" >
                                    <el-option
                                      v-for="connection in activeConnections()"
                                      :key="connection.connection_id"
                                      :label="connection.their_label +' ('+connection.connection_id+')'"
                                      :value="connection.connection_id">
                                    </el-option> 
                                  </el-select>
                                </el-form-item>
                              </el-form>
                              <el-button @click="issueCredentialOffer(key,'global_pool')">Issue a credential offer</el-button>
                            </el-row>
                          </el-collapse-item>
                          </el-collapse>

                        <el-button v-on:click="collapse_expanded_cred_def(key)">^</el-button>
                        </div>
                    </el-row>
                </el-collapse-item>
            </div>
        </el-collapse>
        <p>Create Credential Definition:</p>
        <el-form :model=cred_def_form>
        <el-form-item label="select ledger:" >        
            <el-select v-model="cred_def_form.ledger" filterable placeholder="sov" >
              <el-option
                v-for="ledger in ledgers"
                :key="ledger.id"
                :label="ledger.name"
                :value="ledger.id">
              </el-option> 
            </el-select>
        </el-form-item>
        <el-form-item label="select schema:" prop="cred_def_form">        
            <el-select v-model="cred_def_form.schema" filterable placeholder="schema">
              <el-option
                v-for="schema in schemas"
                :key="schema.id"
                :label="schema.name +' '+ schema.version"
                :value="schema">
              </el-option> 
            </el-select>
        </el-form-item>
<!--         <el-form-item label="select ledger:" >        
            <el-select v-model="cred_def_form.ledger" filterable placeholder="sov" >
              <el-option
                v-for="ledger in ledgers"
                :key="ledger.id"
                :label="ledger.name"
                :value="ledger.id">
              </el-option> 
            </el-select>
        </el-form-item>
        <el-form-item v-if="cred_def_form.ledger in ledgers" label="select schema:" prop="cred_def_form">        
            <el-select v-model="cred_def_form" filterable placeholder="schema">
              <el-option
                v-for="schema in ledgerSchemas(ledgers[cred_def_form.ledger].name)"
                :key="schema.id"
                :label="schema.name +' '+ schema.version"
                :value="schema.id">
              </el-option> 
            </el-select>
        </el-form-item> -->
        <el-form-item>
          <el-button type="primary" @click="createCredentialDefinition()">create new credential definition</el-button>
        </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="Presentation Defincompose_sendition">
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
      async deleteAgentConnection(connection){
        let query_msg = {
            "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/delete",
            "connection_id": connection.connection_id,
            "~transport": {
              "return_route": "all"
            }
        }
        this.send_message(query_msg);
      },
      async removeSchema(id,ledger_id){
        let query_msg = {
            "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/remove-schema",
            "schema_id": id,
            "ledger_id": ledger_id,
            "~transport": {
              "return_route": "all"
            }
        }
        this.send_message(query_msg);
        delete this.schemas[id]// TODO:remove this after aca-py support is added.
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
          "label": this.invite_label_form,
          "role": this.invite_role_form,
          "accept": this.invite_accept_form,
          "public": this.invite_public_form,
          "multi_use": this.invite_multi_use_form,
          "~transport": {
            "return_route": "all"
          }
        }
        this.invite_label_form = "master"
        this.invite_role_form = "normal"
        this.invite_accept_form = "auto"
        this.invite_public_form = false
        this.invite_multi_use_form = true
        this.send_message(query_msg);
      },
      async addStaticAgent(){
        let query_msg ={
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-static-connections/1.0/create-static-connection",
          "label": this.static_agent_form.label,
          "role": this.static_agent_form.role,
          "static_did": this.static_agent_form.static_did,
          "static_key": this.static_agent_form.static_key,
          "static_endpoint": this.static_agent_form.static_endpoint,
          "~transport": {
            "return_route": "all"
          }
        }
        this.send_message(query_msg);
      },
      activeConnections(){
        return Object.keys(this.connections).reduce((acc, val) => 
          ("their_label" in this.connections[val] ?  {
              ...acc,
              [val]: this.connections[val]
          } : acc                                       
        ), {})
      },
      pendingConnections(){
        return Object.keys(this.connections).reduce((acc, val) => 
          ("their_label" in this.connections[val] ? acc : {
              ...acc,
              [val]: this.connections[val]
          }                                        
        ), {})
      },
      ledgerSchemas(ledger_name){
        console.log("ledger name:",ledger_name)
        let schemas = Object.keys(this.schemas).reduce((acc,key)=>
          ("ledgers" in this.schemas[key] &&
           ledger_name in this.schemas[key].ledgers ?{
              ...acc,
              [key]: this.schemas[key]
          } : acc                                       
        ), {})
        console.log("schemas",schemas)
        return schemas
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
      async schema_attributes_clear(){
        this.schemas_form.attributes = [];
      },
      async schema_add_attribute(){
        this.schemas_form.attributes = [...this.schemas_form.attributes,this.schemas_form.attribute];
        this.schemas_form.attribute = '';
      },
      async storeSchema(){
        let query_msg = {
            "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/store-schema",
            "name": this.schemas_form.name,
            "version": this.schemas_form.version,
            "attributes": this.schemas_form.attributes,
            "~transport": {
              "return_route": "all"
            }
        }
        this.send_message(query_msg);
        this.schemas['123412341234'] = { // TODO:remove this after aca-py support is added.
            "id":'123412341234',
            "name": this.schemas_form.name,
            "version": this.schemas_form.version,
            "attributes": this.schemas_form.attributes,}
        this.schemas_form.attributes = []
        this.schemas_form.name =""
        this.schemas_form.version =""
      },
      async publishSchema(schema_id,pool_id){
        let query_msg = {
            "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/publish-schema",
            "schema_id": schema_id,
            "pool_id": pool_id,//optional
            "~transport": {
              "return_route": "all"
            }
        }
        this.send_message(query_msg);
      },
      async createCredentialDefinition(){
          let query_msg = {
            "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/publish-credential-definition",
            "schema_id": this.cred_def_form.schema.ledgers[this.cred_def_form.ledger].seq_number,
            "~transport": {
              "return_route": "all"
          }
        }
        this.send_message(query_msg);
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
          "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/ack": this.fetchAgentConnections,
          "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/invitation": this.newInvitation,
          "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-static-connections/1.0/static-connection-info":this.updatedConnection,// handle added statuc agent ....
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
      async collapse_expanded_schemas(id){
        let index = this.exspanded_schemas_items.indexOf(id)
        this.exspanded_schemas_items.splice(index, 1);
      },
      async collapse_expanded_cred_def(id){
        let index = this.exspanded_cred_def_items.indexOf(id)
        this.exspanded_cred_def_items.splice(index, 1);
      },
    },
    data() {
      return {
        'id': this.$route.params.agentid,
        'connection': {'label':'loading...'},
        'connection_loaded': false,
        'message_history':[],
        'ledgers':{
          '12345234':{
            'id':'12345234',
            'name':'sov',
          },
          '22345234':{
            'id':'22345234',
            'name':'von',
          },
            '32345234':{
            'id':'32345234',
            'name':'bank',
          },
            '42345234':{
            'id':'42345234',
            'name':'adams',
          },
        },
        'schemas':{
          '3552d86c-fc14-480a-bd22-e0be147aadc6':{
            'id':'3552d86c-fc14-480a-bd22-e0be147aadc6',
            'name':'digital_id',
            'version':'1.9',
            'attributes':[
              'first_name',
              'last_name',
              'address',
              'age',
            ],
          },
          '2452d86c-fc14-480a-bd12-e0be147aade4':{
            'id':'2452d86c-fc14-480a-bd12-e0be147aade4',
            'name':'registration',
            'version':'1.0.0',
            'attributes':[
              'address_line_1',
              'entity_status_effective',
              'entity_name_effective',
              'registration_date',
              'entity_status',
              'entity_type',
              'address_line_2',
              'addressee',
              'country',
              'corp_num',
              'postal_code',
              'province',
              'city',
              'legal_name',
            ],
            'ledgers':{'sov':{
              'name':'sov',
              'txn_id':'SAF2vMgCJd2PsqUpa5U2DX:2:registration:1.0.0',
              'seq_number':'9',
              'cred_defs':[
                'SAF2vMgCJd2PsqUpa5U2DX:3:CL:9:tag',
                'JTUsfPMn1GGZLScyfqf9LU:3:CL:9:tag'
              ],
            }}
          }
        },
        'schemas_form':{
          'attributes':[],
          'name':'',
          'version':'',
          'attribute':'',
        },
        'cred_defs':{
          '3462d86c-fc14-480a-bd12-e0be147aadv7':{ //TODO: build this from the results of a single credential_definition_id
            'cred_def_id':'3462d86c-fc14-480a-bd12-e0be147aadv7',
            'schema_id':'2452d86c-fc14-480a-bd12-e0be147aade4',
            'schema_name':'registration',
            'schema_version':'name',
            'schema':[
              'address_line_1',
              'entity_status_effective',
              'entity_name_effective',
              'registration_date',
              'entity_status',
              'entity_type',
              'address_line_2',
              'addressee',
              'country',
              'corp_num',
              'postal_code',
              'province',
              'city',
              'legal_name',
            ],
            'cred_def_txnId':'SAF2vMgCJd2PsqUpa5U2DX:3:CL:9:Test',
            'primary':{
              'r':{
                'entity_type':'4276818453997252235377809066552492903559006624154502170264010343561770...',
                'address_line_2':'5835005062870123542337957832281874621008837246206493273019909805920578...',
                'country':'1879513305160086851616079950364687554755887149912307898056492171417669...',
                'master_secret':'5680719163826958582523499906964107839414241499724912816054845682277627...',
                'city':'5070038307979790521329819136698583890861707690369236453378984162125954...',
                'postal_code':'3112351950987780712431706032057718465524884751214233553363879722705800...',
                'address_line_1':'7306529829675381076177399279526662495198464609142708900879759969343811...',
                'legal_name':'4802617220397946068690549708166702621003071126577937165396665038376228...',
                'registration_date':'2878132445424190585639532906296244810676938826012262151226024338975400...',
                'addressee':'1001391556670028112842868976612783831982121929639458722631916162375175...',
                'entity_status_effective':'6788510089214435350045257149388833744569568756412683331576858511590760...',
                'corp_num':'6785661010439948560109655157528808585675707924690100517693559960557987...',
                'entity_status':'1321064407231181370798210517190814593144851682644978311734511298020384...',
                'entity_name_effective':'7571297275652047907551972817989506568944796137349719074126081162087488...',
                'province':'9476317241642994808753854337446098807999115489895643485448317420223689...',
              },
            },
          },
        },
        'cred_def_form':{
          'schema':'',
          '3462d86c-fc14-480a-bd12-e0be147aadv7': {'attributes':[]},// TODO: create this structure dynamically at start.
          'ledger':'',
        },
        'supported_protocols': [],
        'compose_json': {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/trust_ping/1.0/ping",
          "response_requested": true
        },
        'basicmessage_compose': "",
        'connections':{},
        'connectionUpdateForm':{},
        'exspanded_connection_items':[],
        'invitations':{},
        'exspanded_invites_items':[],
        'exspanded_schemas_items':[],
        'exspanded_cred_def_items':[],
        'exspanded_credential_issuer_items':[],
        'invite_label_form':"master",
        'invite_role_form':"normal",
        'invite_accept_form':"auto",
        'invite_public_form':false,
        'invite_multi_use_form':true,
        'static_agent_form':{
          'label':"",
          'role':"",
          'static_did':"",
          'static_key':"",
          'static_endpoint':"",
        },
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
    watch:{}
  }
</script>
