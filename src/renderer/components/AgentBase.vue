<template>
  <div id="wrapper" class="container-fluid">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">{{connection.label}}</a>
      <!-- active privileged did -->
      <el-form :model=active_ledger_selector>
        <!-- <el-select v-model="active_ledger_selector.did" filterable placeholder="activate did" > -->
        <el-select  v-model="selectedActiveDid" 
                    filterable placeholder="activate did">
          <el-option
            v-for="did in Object.values(dids)"
            :key="did.did"
            :label="did.did"
            :value="did">
          </el-option>
        </el-select>
        <!-- <el-select v-if="false" v-model="active_ledger_selector.ledger" filterable placeholder="activate ledger" >
          <el-option
          v-for="ledger in ledgers"
          :key="ledger.name"
          :label="ledger.name"
          :value="ledger.name">
          </el-option>
          </el-select> -->
      </el-form>
    </nav>

    <el-tabs type="border-card">
      <el-tab-pane label="Dids">
        <agent-did-list
          title="Dids:"
          activeDid="activeDid()"
          v-bind:list="Object.values(dids)"
          v-on:did-update="updateAgentDid"
          v-on:did-activate="activateAgentDid"
          v-on:did-resolve="resolveTrustedIssuer"></agent-did-list>
        <p>Create a Did:</p>
        <el-form :model=did_form>
          <el-form-group >
            <span slot="label">Did:</span>
            <el-input v-model="did_form.did" style="width:100px;"> </el-input>
            <span slot="label">Seed:</span>
            <el-input v-model="did_form.seed" style="width:100px;"> </el-input>
            <span slot="label">Alias:</span>
            <el-input v-model="did_form.label" style="width:100px;"> </el-input>
          </el-form-group>
          <el-form-item>
            <el-button type="primary" @click="createDid()">Create DID</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- <el-tab-pane label="Ledger">
        <p>Ledgers:</p>
        <el-collapse v-model="expanded_ledger_items">
        <div v-for="(ledger, key) in ledgers" :key="key">
        <el-collapse-item v-bind:title="'Name: ' + ledger.name" :name="key">
        <el-row>
        <div>
        <vue-json-pretty
        :deep=1
        :data="ledger">
        </vue-json-pretty>
        <el-form class="ledger-form">
          <el-form-item >
          <el-button type="primary" @click="removeLedger(ledger)">delete</el-button>
          </el-form-item>
          <el-button v-on:click="collapse_expanded_ledger_item(key)">^</el-button>
          </el-form>
          </div>
          </el-row>
          </el-collapse-item>
          </div>
          </el-collapse>
          <p>Add new ledger:</p>
          <el-form :model=ledger_form>
          <el-form-group >
          <span slot="label">Name:</span>
          <el-input v-model="ledger_form.name" style="width:100px;"> </el-input>
          <span slot="label">Url to genesis file:</span>
          <el-input v-model="ledger_form.gen_url" style="width:100px;"> </el-input>
          </el-form-group>
          <el-form-item>
          <el-button type="primary" @click="addLedger()">add new ledger</el-button>
          </el-form-item>
          </el-form>
          </el-tab-pane> -->
          <el-tab-pane label="Connections">
            <el-row>
              <agent-connection-list
                title="Active Connections:"
                editable="true"
                v-bind:list="activeConnections"
                v-on:connection-editted="updateAgentConnection"
                v-on:connection-deleted="deleteAgentConnection"></agent-connection-list>
              <agent-connection-list
                title="Pending Connections:"
                editable="true"
                v-bind:list="pendingConnections"
                v-on:connection-editted="updateAgentConnection"
                v-on:connection-deleted="deleteAgentConnection"></agent-connection-list>
              <agent-connection-list
                title="Open Invitations:"
                editable="true"
                v-bind:list="openInvitations"
                v-on:connection-editted="updateAgentConnection"
                v-on:connection-deleted="deleteAgentConnection"></agent-connection-list>
              <agent-connection-list
                title="Multiuse Invitations:"
                editable="true"
                v-bind:list="multiUseInvitations"
                v-on:connection-editted="updateAgentConnection"
                v-on:connection-deleted="deleteAgentConnection"></agent-connection-list>
              <agent-connection-list
                title="New Invitations:"
                editable="false"
                v-bind:list="Object.values(invitations)"
                v-on:connection-editted="updateAgentConnection"
                v-on:connection-deleted="deleteAgentConnection"></agent-connection-list>
              <agent-connection-list
                title="Failed Connections:"
                editable="false"
                v-bind:list="errorStateConnections"
                v-on:connection-editted="updateAgentConnection"
                v-on:connection-deleted="deleteAgentConnection"></agent-connection-list>

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
              <p>Add connection from invitation:</p>
              <el-form :model=agent_invitation_form>
                <el-form-group >
                  <span slot="label">invitation:</span>
                  <el-input v-model="agent_invitation_form.invitation" style="width:100px;"> </el-input>
                </el-form-group>
                <el-form-item>
                  <el-button type="primary" @click="addAgent()">Add Agent</el-button>
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
          <el-tab-pane label="Credential Issuance">
            <el-row>
              <agent-schema-list
                title="Schemas"
                editable="false"
                v-bind:list="schemas"
                @schema-send="publishSchema"
                @schema-get="getSchema"></agent-schema-list>
              <agent-cred-def-list
                title="Credential Definitions"
                editable="false"
                v-bind:list="cred_defs"
                v-bind:schemas="schemas"
                @cred-def-send="publishCredDef"
                @cred-def-get="getCredentialDefinition"></agent-cred-def-list>
              <agent-issue-cred-list
                title="Issued Credentials"
                editable="false"
                v-bind:list="issuer_credentials"
                v-bind:connections="activeConnections"
                v-bind:cred_defs="issuerCredDefs"
                @issue="issueCredential"></agent-issue-cred-list>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="My Credentials">
            <!--
              /**
              * Holder Credential
              * states
              * - proposals -
              *     request credential,
              *         <Button> select connection , select cred_def and send request,
              * - STATE_OFFER_RECEIVED -
              *         <Button> send request
              * - STATE_REQUEST_SENT -
              * - STATE_CREDENTIAL_RECEIVED
              *     issued with data from request. result of "issue" API call.
              *       <Button> Accept , send ack or problem report
              * - STATE_STORED
              *    
              */
            -->
            <el-row>
              <agent-my-credentials-list
                title="Credentials"
                editable="false"
                v-bind:credentials = "this.holder_credentials"
                ></agent-my-credentials-list>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="Trusted Issuers">
            <p>Issuers:</p>
            <el-collapse v-model="expanded_issuers_items">
              <!--             <div v-for="(did, key) in trusted_issuers" :key="key">
                <el-collapse-item v-bind:title="did.label +', '+ did.id" :name="key">
                <el-row>
                <div>
                <vue-json-pretty
                :deep=1
                :data="did">
                </vue-json-pretty>
                <el-button type="primary" @click="removeTrustedIssuer(key)">delete</el-button>
                <el-button type="primary" @click="resolveTrustedIssuer(key)">resolve issuer did</el-button>
                <el-button v-on:click="collapse_expanded_trusted_issuer(key)">^</el-button>
                </div>
                </el-row>
                </el-collapse-item>
                </div> -->
            </el-collapse>
            <p>Add Trusted Issuer:</p>
            <el-form :model=trusted_issuers_form>
              <!-- <el-form-group >
                <span slot="label">Did:</span>
                <el-input v-model="trusted_issuers_form.did" style="width:100px;"> </el-input>
                <span slot="label">Label:</span>
                <el-input v-model="trusted_issuers_form.label" style="width:100px;"> </el-input>
                </el-form-group> -->
                <el-form-item>
                  <el-button type="primary" @click="storeTrustedIssuer()">add trusted issuer</el-button>
                </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="Presentation">
            <p>Presentation Definitions:</p>
            <el-collapse v-model="exspanded_pres_def_items">
              <!-- <div v-for="(pres_def, key) in presentation_definitions" :key="key">
                <el-collapse-item v-bind:title="pres_def.name" :name="key">
                <el-row>
                <div>
                <vue-json-pretty
                :deep=3
                :data="pres_def">
                </vue-json-pretty>
                <el-collapse v-model="exspanded_presentation_request_items">
                <el-collapse-item title='Issue a credential presentation request' :name="key">
                <el-row>
                <el-form :model=pres_def_form>
                <el-form-item label="select connection:" >
                <el-select v-model="pres_def_form.connection" filterable placeholder="to issue to" >
                <el-option
                v-for="connection in activeConnections"
                :key="connection.connection_id"
                :label="connection.their_label +' ('+connection.connection_id+')'"
                :value="connection.connection_id">
                </el-option>
                </el-select>
                </el-form-item>
                </el-form>
                <el-button @click="verifierRequestPresentation(pres_def.pres_def_id,pres_def_form.connection)">issue a credential presentation request</el-button>
                </el-row>
                </el-collapse-item>
                </el-collapse>
                <el-button v-on:click="collapse_expanded_pres_def(key)">^</el-button>
                </div>
                </el-row>
                </el-collapse-item>
                </div> -->
            </el-collapse>
            <p>Create Presentation Definition:</p>
            <el-form :model=pres_def_form>
              <!-- <el-form-group >
                <span slot="label">Name:</span>
                <el-input v-model="pres_def_form.name" style="width:100px;"> </el-input>
                <span slot="label">Version:</span>
                <el-input v-model="pres_def_form.version" style="width:100px;"> </el-input>
                <p>Request Attributes:</p>
                <ul>
                <li v-for='(attribute,index) in pres_def_form.requested_attributes' :key="index">
                <vue-json-pretty
                :deep=3
                :data="attribute">
                </vue-json-pretty>
                <ul>
                <li v-for='restriction in pres_def_form.requested_attributes[index].restrictions' :key="restriction+index">
                {{restriction.issuer_did}}
                </li>
                </ul>
                <el-row>
                <el-form :model=pres_def_form>
                <el-form-item label="Trusted Issuer:" >
                <el-select v-model="pres_def_form.temp_attrs[index].restriction" filterable placeholder="Trusted Issuer" >
                <el-option
                v-for="issuer in trusted_issuers"
                :key="issuer.did"
                :label="issuer.label +' ('+issuer.did+')'"
                :value="issuer.did">
                </el-option>
                </el-select>
                <span slot="label">Restriction:</span>
                <el-button type="primary" @click="add_pres_def_restriction(index)" >add restriction</el-button>
                </el-form-item>
                </el-form>
                <span slot="label">Restriction:</span>
                <el-button type="primary" @click="add_pres_def_restriction(index)" >add restriction</el-button>
                </el-row>
                </li>
                </ul>
                <span slot="label">Attribute:</span>
                <el-input @keyup.enter.native="add_pres_def_attribute" v-model="pres_def_form.requested_attribute" style="width:100px;"> </el-input>
                <el-button type="primary" @click="add_pres_def_attribute" >add request attribute</el-button>
                </el-form-group> -->
                <el-form-item>
                  <el-button type="primary" @click="storePresentationDefinition()">create new presentation definition</el-button>
                </el-form-item>
                <p>Presentation Requests Sent:</p>
                <!-- <el-collapse v-model="expanded_pres_req_sent_items">
                  <div v-for="(pres_req, key, index) in sentPresentationRequests" :key="key" :index="index">
                  <el-collapse-item v-bind:title="labelFromConnection(pres_req.connection_id)" :name="key">
                  <el-row>
                  <div>
                  <vue-json-pretty
                  :deep=1
                  :data="pres_req">
                  </vue-json-pretty>
                  <el-button v-on:click="collapse_expanded_pres_req_sent(key)">^</el-button>
                  </div>
                  </el-row>
                  </el-collapse-item>
                  </div>
                  </el-collapse> -->
                  <p>Presentation Requests Received:</p>
                  <el-collapse v-model="expanded_pres_req_rec_items">
                    <!-- <div v-for="(pres_req, key) in receivedPresentationRequests" :key="key">
                      <el-collapse-item v-bind:title="labelFromConnection(pres_req.connection_id)" :name="key">
                      <el-row>
                      <div>
                      <vue-json-pretty
                      :deep=1
                      :data="pres_req">
                      </vue-json-pretty>
                      <el-button v-on:click="collapse_expanded_pres_req_rec(key)">^</el-button>
                      </div>
                      </el-row>
                      </el-collapse-item>
                      </div> -->
                  </el-collapse>
                  <p>Presentations Sent:</p>
                  <el-collapse v-model="expanded_pres_sent_items">
                    <!-- <div v-for="(pres_req, key) in sentPresentations" :key="key">
                      <el-collapse-item v-bind:title="labelFromConnection(pres_req.connection_id)" :name="key">
                      <el-row>
                      <div>
                      <vue-json-pretty
                      :deep=1
                      :data="pres_req">
                      </vue-json-pretty>
                      <el-button v-on:click="collapse_expanded_pres_sent(key)">^</el-button>
                      </div>
                      </el-row>
                      </el-collapse-item>
                      </div> -->
                  </el-collapse>
                  <p>Presentations Received:</p>
                  <el-collapse v-model="expanded_pres_rec_items">
                    <!-- <div v-for="(pres_req, key) in receivedPresentations" :key="key">
                      <el-collapse-item v-bind:title="labelFromConnection(pres_req.connection_id)" :name="key">
                      <el-row>
                      <div>
                      <vue-json-pretty
                      :deep=1
                      :data="pres_req">
                      </vue-json-pretty>
                      <el-button v-on:click="collapse_expanded_pres_rec(key)">^</el-button>
                      </div>
                      </el-row>
                      </el-collapse-item>
                      </div> -->
                  </el-collapse>
                  <p>Presentations :</p>
                  <el-collapse v-model="expanded_pres_ver_items">
                    <div v-for="pres_req in verifiedPresentations">
                      <!-- <el-collapse-item v-bind:title="labelFromConnection(pres_req.connection_id)" :name="key">
                        <el-row>
                        <div>
                        <vue-json-pretty
                        :deep=1
                        :data="pres_req">
                        </vue-json-pretty>
                        <el-button v-on:click="collapse_expanded_ver(key)">^</el-button>
                        <el-collapse-item title='Send a Presentation' :name="key">
                        <el-row>
                        <div v-for="(attribute, key, index) in cred_def.primary.r" v-if="key!='master_secret'" prop="cred_def">
                        <span slot="label">{{key}}:</span>
                        <el-input v-model="cred_def_form[cred_def.cred_def_id].attributes[index]" style="width:100px;"> </el-input>
                        </div>
                        <el-form :model=cred_def_form>
                        <el-form-item label="select connection:" >
                        <el-select v-model="cred_def_form.connection" filterable placeholder="select connection to issue to:" >
                        <el-option
                        v-for="connection in activeConnections"
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
                        </div>
                        </el-row>
                        </el-collapse-item> -->
                    </div>
                  </el-collapse>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="Verifications">
          </el-tab-pane>
          <el-tab-pane label="Compose">
            <input type="button" class="btn btn-secondary" v-on:click="compose_send()" value="Send"/>
            <v-jsoneditor v-model="compose_json">
            </v-jsoneditor>
            <div class="message-display" v-for="(msg, index) in most_recent_sent_msgs" :key="index">
              <i>{{msg.direction}}</i>
              <vue-json-pretty
                :deep=1
                :data="msg.msg">
              </vue-json-pretty>
            </div>
          </el-tab-pane>
          <el-tab-pane label="BasicMessage">
            <div style="margin-bottom: 1em;">
              <el-input placeholder="Message to send to the connected Agent" @keyup.enter.native="basicmessage_send" v-model="basicmessage_compose" style="width:500px;"></el-input>
              <el-button type="primary" @click="basicmessage_send">Send</el-button>

            </div>
            <div v-for="m in basicmessage_history.slice().reverse()" :key="m.msg['@id']">
              <div :class="'basicmessage-'+m.direction">{{m.msg.content}}</div>
            </div>

          </el-tab-pane>
          <el-tab-pane label="Message History">

            <input type="button" class="btn btn-secondary" v-on:click="message_history_clear()" value="Clear"/>
            <div class="message-display" v-for="m in message_history.slice().reverse()" :key="m.msg['@id']">
              <i>{{m.direction}}</i>
              <vue-json-pretty
                :deep=1
                :data="m.msg">
              </vue-json-pretty>
            </div>

          </el-tab-pane>
          <el-tab-pane label="Protocol Discovery">

            <input type="button" class="btn btn-secondary" v-on:click="run_protocol_discovery()" value="Query"/>
            <table class="table table-sm">
              <tr>
                <th>Protocol</th>
                <th>Roles</th>
              </tr>
              <tr v-for="p in supported_protocols" :key="p.pid">
                <td>{{p.pid}}</td>
                <td>{{p.roles}}</td>
              </tr>
            </table>

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
const bs58 = require('bs58');
const rp = require('request-promise');

import { mapState, mapActions } from "vuex";
import { from_store } from '../connection_detail.js';

import VueJsonPretty from 'vue-json-pretty';
import VJsoneditor from 'v-jsoneditor';
import AgentConnectionList from './AgentConnectionList.vue';
import AgentDidList from './AgentDidList.vue';
import AgentSchemaList from './AgentSchemaList.vue';
import AgentCredDefList from './AgentCredDefList.vue';
import AgentIssueCredList from './AgentIssueCredList.vue';
import AgentMyCredentialsList from './AgentMyCredentialsList.vue';

export default {
  name: 'agent-base',
  components: {
    VueJsonPretty,
    VJsoneditor,
    AgentConnectionList,
    AgentDidList,
    AgentSchemaList,
    AgentCredDefList,
    AgentIssueCredList,
    AgentMyCredentialsList
  },
  methods: {
    ...mapActions("Connections", ["get_connection"]),
    //=========================================================================================================================
    //-------------------------Outbound Messages-------------------------------------------------------------------
    //=========================================================================================================================
    /**
     *  Agent admin messages sent to change state of wallet and did connections.
     */
    //=========================================================================================================================
    async fetchAgentData(){
      //load from vue store
      this.connection = from_store(await this.get_connection(this.id), this.processInbound);

      this.message_history = this.connection.message_history;

      this.connection_loaded = true;
    },
    async run_protocol_discovery(){
      //send query
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/discover-features/1.0/query",
        "query": "*"
      };
      this.connection.send_message(query_msg);
    },
    //================================ connection events ================================
    /**
     * # Message Types
     *  # event             | ->  | directive
     * ==========================================
        connection-get-list       -> connection-list
        connection-get            -> connection //TODO: use
        create-invitation         -> invitation
        receive-invitation        -> connection
        accept-invitation         -> <no handler> //TODO: use
        accept-request            -> <no handler> //TODO: use
        establish-inbound         -> <no handler> //TODO: use
        delete                    -> ack
        update                    -> connection
        create-static-connection  -> static-connection-info
     */
    async fetchAgentConnections(){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/connection-get-list",
        "~transport": {
          "return_route": "all"
        }
      }
      this.connection.send_message(query_msg);
    },
    async updateAgentConnection(editForm){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/update",
        "connection_id": editForm.connection_id,
        "label": editForm.label,
        "role": editForm.role,
      }
      this.connection.send_message(query_msg);
    },
    async deleteAgentConnection(connection){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/delete",
        "connection_id": connection.connection_id,
        "~transport": {
          "return_route": "all"
        }
      }
      this.connection.send_message(query_msg);
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
      this.connection.send_message(query_msg);
    },
    async addAgent() {
      let receive_invite_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/receive-invitation",
        "invitation": this.agent_invitation_form.invitation,
        "accept": "auto"
      };
      this.connection.send_message(receive_invite_msg);
      this.agent_invitation_form.invitation = "";
      setTimeout(() => {
        return this.fetchAgentConnections();
      }, 4000);
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
      this.connection.send_message(query_msg);
    },
    //================================ Did events ================================
    async getAgentDids(){
      this.connection.send_message( {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/1.0/get-list-dids",
        "~transport": {
          "return_route": "all"
        }
      })
    },
    async createDid(){
      let msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/1.0/create-did",
        "~transport": {
          "return_route": "all"
        }
      }
      msg = this.did_form.did ? {...msg,"did":this.did_form.did} : msg
      msg = this.did_form.seed ? {...msg,"seed":this.did_form.seed} : msg
      msg = this.did_form.label ? {...msg, "metadata": {"label":this.did_form.label}} : msg
      this.connection.send_message(msg)
    },
    async getAgentActivePublicDid(did){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/1.0/get-public-did",
        "~transport": {
          "return_route": "all"
        }
      }
      this.connection.send_message(query_msg);
    },
    async activateAgentDid(did){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/1.0/set-public-did",
        "did": did.did,
        "~transport": {
          "return_route": "all"
        }
      }
      this.connection.send_message(query_msg);
    },
    async updateAgentDid(editForm){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/1.0/set-did-metadata",
        "did": editForm.did,
        "metadata": { 
          ...editForm.metadata,
          'label':editForm.label,
          'permission':editForm.permission,
        },
        "~transport": {
          "return_route": "all"
        }
      }
      this.connection.send_message(query_msg);
    },      

    async compose_send(){
      this.connection.send_message(this.compose_json, true);
    },
    async basicmessage_send(){
      let msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/basicmessage/1.0/message",
        "content": this.basicmessage_compose
      };
      this.connection.send_message(msg);
      this.basicmessage_compose = "";
    },
    //================================ schema events ================================
    async getSchemas(){
      let msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-schemas/1.0/schema-get-list",
        "~transport": {
          "return_route": "all"
        }
      };
      this.connection.send_message(msg);
    },
    async getSchema(schema_id){
      let msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-schemas/1.0/schema-get",
        "schema_id": schema_id,
      };
      this.connection.send_message(msg);
    },
    async publishSchema(form){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-schemas/1.0/send-schema",
        "schema_name": form.name,
        "schema_version": form.version,
        "attributes": form.attributes,
      }
      this.connection.send_message(query_msg);
    },
    //================================ Credential Definition events ================================
    async publishCredDef(form){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-credential-definitions/1.0/send-credential-definition",
        "schema_id": form.schema_id,
      }
      this.connection.send_message(query_msg);
    },
    async getCredentialDefinition(cred_def_id){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-credential-definitions/1.0/credential-definition-get",
        "cred_def_id": cred_def_id,
      }
      this.connection.send_message(query_msg);
    },
    async getCredentialDefinitionlist(){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-credential-definitions/1.0/credential-definition-get-list",
        "~transport": {
          "return_route": "all"
        }
      }
      this.connection.send_message(query_msg);
    },
    //================================ Issuer events ================================
    async issueCredential(form){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/send-credential",
        "connection_id": form.connection_id,
        "credential_definition_id": form.credential_definition_id,
        "comment": form.comment, //optional
        "credential_proposal": {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/credential-preview",
          "attributes": form.attributes
        }
      }
      this.connection.send_message(query_msg);
    },
    async verifierRequestPresentation(requestPresentationForm){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/request-presentation",
        "connection_id": requestPresentationForm.connection_id ,
        "comment": requestPresentationForm.comment , //optional
        "proof_request": requestPresentationForm.credential_proposal ,
      }
      this.connection.send_message(query_msg);
    },
    async getIssuedCredentials(){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/credentials-get-list",
        //'connection_id': ,// optional filter
        //'credential_definition_id': ,// optional filters
        //'schema_id': ,// optional filter
      }
      this.connection.send_message(query_msg);
    },
    async getIssuersPresentations(){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/presentations-get-list",
        //'connection_id': ,// optional filter
        //'verified': ,// optional filter
        "~transport": {
          "return_route": "all"
        }
      }
      this.connection.send_message(query_msg);
    },
    //================================ Holder events ================================
    async sendCredentialProposal(holderCredentialProposalForm){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/send-credential-proposal",
        "connection_id": holderCredentialProposalForm.connection_id ,
        "credential_definition_id": holderCredentialProposalForm.credential_definition_id ,
        "comment": holderCredentialProposalForm.comment , //optional
        "credential_proposal": holderCredentialProposalForm.credential_proposal ,
      }
      this.connection.send_message(query_msg);
    },
    async sendPresentationProposal(holderCredentialProposalForm){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/send-presentation-proposal",
        "connection_id": holderCredentialProposalForm.connection_id ,
        "auto_present": holderCredentialProposalForm.auto_present , //optional, default to false
        "comment": holderCredentialProposalForm.comment , //optional
        "presentation_proposal": holderCredentialProposalForm.presentation_proposal ,
        "~transport": {
          "return_route": "all"
        }
      }
      this.connection.send_message(query_msg);
    },
    async getHoldersCredentials(){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/credentials-get-list",
        //'connection_id': ,// optional filter
        //'credential_definition_id': ,// optional filters
        //'schema_id': ,// optional filter
        "~transport": {
          "return_route": "all"
        }
      }
      this.connection.send_message(query_msg);
    },
    async getHoldersPresentations(){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/presentations-get-list",
        //'connection_id': ,// optional filter
        //'verified': ,// optional filters
        "~transport": {
          "return_route": "all"
        }
      }
      this.connection.send_message(query_msg);
    },
    //================================ trusted issuer events ================================
    async removeTrustedIssuer(id){
      let query_msg = {
        "@type": "",
        "issuer_did": id,
        "~transport": {
          "return_route": "all"
        }
      }
      this.connection.send_message(query_msg);
      delete this.trusted_issuers[id]// TODO:remove this after aca-py support is added.
    },
    async resolveTrustedIssuer(did){
      let query_msg = {
        "@type": "",
        "issuer_did": did,
        "~transport": {
          "return_route": "all"
        }
      }
      this.connection.send_message(query_msg);
      delete this.trusted_issuers[did]// TODO:remove this after aca-py support is added.
    },
    async storeTrustedIssuer(){
      let query_msg = {
        "@type": "",
        "did": this.trusted_issuers_form.did,
        "label": this.trusted_issuers_form.label,
        "~transport": {
          "return_route": "all"
        }
      }
      //this.connection.send_message(query_msg);
      this.trusted_issuers[this.trusted_issuers_form.did] = { // TODO:remove this after aca-py support is added.
        "id":this.trusted_issuers_form.did,
        "label": this.trusted_issuers_form.label,
      }
      this.trusted_issuers_form.did = ""
      this.trusted_issuers_form.label = ""
    },

    //=========================================================================================================================
    //-------------------------Inbound Messages---------------------------------------------------------------------------
    //=========================================================================================================================
    /**
     *  Received Agent admin messages with directives containing state of wallet and did connections to be displayed.
     */
    //=========================================================================================================================
    async receivedAgentDids(msg){
      const dids = msg.result.reduce(function(acc, cur, i) {
        acc[cur.did] = cur;
        return acc;
      }, {});
      this.dids = dids
      this.didsUpdateForm = dids
    },
    async updatedDid(msg){
      if ('result' in msg &&
        'did' in msg.result) {
        this.dids[msg.result.did] = msg.result
        this.did_form.did = ""
        this.did_form.seed = ""
        this.did_form.label = ""
        this.didsUpdateForm = this.dids
        //if "public" in info.metadata and info.metadata["public"] is True:
        if('metadata' in msg.result && 
          'public' in msg.result.metadata && 
          msg.result.metadata.public === true){
          this.public_did = msg.result.did
          this.active_ledger_selector.did = this.public_did
        }
        this.getAgentDids()
      }
    },
    async fetchedConnectionList(msg){
      const connections = msg.results.reduce(function(acc, cur, i) {
        acc[cur.connection_id] = cur;
        return acc;
      }, {});
      this.connections = connections
      this.connectionUpdateForm = connections
    },
    async updatedConnection(msg){
      return this.fetchAgentConnections();
      /* this.connections[msg.connection.connection_id] = msg.connection
      this.connectionUpdateForm = this.connections; */
    },
    // ---------------------- shcema handlers --------------------
    async getSchemaListResponse(msg){
      if('results' in msg){
        this.schemas = msg.results
      }
    },
    async sendSchemaResponse(msg){
      if ('schema_id' in msg) {
        return this.getSchemas();
      }
    },
    async getSchemaResponse(msg){
      if ('schema' in msg) {
        this.schemas = this.schemas.filter(
          item => item.schema_id != msg.schema.schema_id
        );
      }
    },
    // ---------------------- cred def handlers --------------------
    async credentialDefinitionCreatedDirective(msg){
      if ('cred_def_id' in msg){
        return this.getCredentialDefinitionlist();
      }
    },
    async credentialDefinitionReadDirective(msg){// does this work???? Do we need this?
      if ('credential_definition' in msg){
        var index = this.cred_defs.indexOf(msg.credential_definition);
        if (index !== -1) {
          this.cred_defs[index] = msg.credential_definition;
        }
        else{
          this.cred_defs.push(msg.credential_definition);
        }
      }
    },
    async credentialDefinitionListDirective(msg){
      if('results' in msg){
        this.cred_defs = msg.results
        this.cred_def_form = this.cred_defs
      }      
    },
    // ---------------------- issuance handlers --------------------
    async issuerCredentialRecord(msg) {
      return this.getIssuedCredentials();
    },
    async issuerCredentialListDirective(msg){
      if('results' in msg ){
        this.issuer_credentials = msg.results;
      }
    },
    async varifierRequestPresentationRecordDirective(msg){
      if('results'in msg ){
        return this.getIssuersPresentations();
      }
    },
    async varifierPresentaionListDirective(msg){
      if('results'in msg ){// should be 'presentations~attach'
        this.issuer_presentaions = msg.results;
      }
    },
    // ---------------------- holder handlers ------------------------
    async holderCredentialRecord(msg){
      return this.getHoldersCredentials();
    },
    async holderPresentationRecord(msg){
      return this.getHoldersPresentations();
    },
    async holderCredentialListRecord(msg){
      if('results'in msg ){
        this.holder_credentials = msg.results;
      }
    },
    async holderPresentationListRecord(msg){
      if('results'in msg ){
        this.holder_presentations = msg.results;
      }
    },
    async newInvitation(msg){
      console.log(msg.invitation)
      this.invitations[ msg.connection_id] = {
        //... msg.invitation, // invitations is not a json yet...
        "invitation": msg.invitation,
        "connection_id" : msg.connection_id,
        "invitation_url": msg.invitation_url}

    },
    async ProtocolDisclose(msg){
      //console.log(msg.protocols);
      this.supported_protocols = msg.protocols;
    },
    async processInbound(msg){
      this.connection.message_history_add(msg, "Received");
      var handlers = {
        //=============================== Credential Definitions ===============================
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/discover-features/1.0/disclose": this.ProtocolDisclose,
        //=============================== Connections ==========================================
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/connection-list": this.fetchedConnectionList,
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/connection": this.updatedConnection,
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/ack": this.fetchAgentConnections,
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/invitation": this.newInvitation,
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-static-connections/1.0/static-connection-info":this.updatedConnection,// handle added statuc agent
        //=============================== Dids =================================================
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/1.0/list-dids":this.receivedAgentDids,
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/1.0/did":this.updatedDid,
        //=============================== Schemas ==============================================
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-schemas/1.0/schema-list": this.getSchemaListResponse,
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-schemas/1.0/schema-id": this.sendSchemaResponse,
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-schemas/1.0/schema": this.getSchemaResponse,
        //=============================== Credential Definitions ===============================
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-credential-definitions/1.0/credential-definition-id": this.credentialDefinitionCreatedDirective,
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-credential-definitions/1.0/credential-definition": this.credentialDefinitionReadDirective,
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-credential-definitions/1.0/credential-definition-list": this.credentialDefinitionListDirective,
        //=============================== Credential Issuance ==================================
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/credential-exchange": this.issuerCredentialRecord,
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/credentials-list": this.issuerCredentialListDirective,
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/request-presentation": this.varifierRequestPresentationRecordDirective,
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/presentations-list": this.varifierPresentaionListDirective,
        //=============================== Credential Holder ====================================
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/credential-exchange": this.holderCredentialRecord,
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/presentation-exchange": this.holderPresentationRecord,
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/credentials-list": this.holderCredentialListRecord,
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/presentations-list": this.holderPresentationListRecord,
      };
      var handler = handlers[msg['@type']];
      if(handler){
        handler(msg);
      } else {
        console.log("Message without handler", msg);
      }
    },
    connectionsInvitationModeFilterForMulti(connections){
      return Object.keys(connections).reduce((acc, val) =>
        ("invitation_mode" in connections[val] && connections[val].invitation_mode === "multi" ?  {
          ...acc,
          [val]: connections[val]
        } : acc
        ), {})
    },
    connectionsInvitationModeFilterForOnce(connections){
      return Object.keys(connections).reduce((acc, val) =>
        ("invitation_mode" in connections[val] && connections[val].invitation_mode === "once" ?  {
          ...acc,
          [val]: connections[val]
        } : acc
        ), {})
    },
    connectionsInitiatorFilterForSelf(connections){
      return Object.keys(connections).reduce((acc, val) =>
        ("initiator" in connections[val] && connections[val].initiator === "self" ?  {
          ...acc,
          [val]: connections[val]
        } : acc
        ), {})
    },
    connectionsInitiatorFilterForExternal(connections){
      return Object.keys(connections).reduce((acc, val) =>
        ("initiator" in connections[val] && connections[val].initiator === "external" ?  {
          ...acc,
          [val]: connections[val]
        } : acc
        ), {})
    },
    connectionsInitiatorFilterForMultiuse(connections){
      return Object.keys(connections).reduce((acc, val) =>
        ("initiator" in connections[val] && connections[val].initiator === "multiuse" ?  {
          ...acc,
          [val]: connections[val]
        } : acc
        ), {})
    },
    labelFromConnection(id){
      if (id in this.connections &&'their_label' in this.connections[id]) {
        return this.connections[id].their_label
      }
      return id
    },
    //=========================================================================================================================
    //------------------------- View methods ----------------------------------------------------------------------------------
    //=========================================================================================================================
    /**
     *
     */
    //=========================================================================================================================
    async add_pres_def_attribute(){
      this.pres_def_form.requested_attribute= {
        "name":this.pres_def_form.requested_attribute,
        "restrictions" : []
      }
      this.pres_def_form.requested_attributes = [...this.pres_def_form.requested_attributes,this.pres_def_form.requested_attribute];
      this.pres_def_form.temp_attrs=[...this.pres_def_form.temp_attrs,{"restriction":""}]
      this.pres_def_form.requested_attribute = '';
    },
    async add_pres_def_restriction(index){
      this.pres_def_form.temp_attrs[index].restriction =
        {"issuer_did": this.pres_def_form.temp_attrs[index].restriction}
      this.pres_def_form.requested_attributes[index].restrictions =
        [...this.pres_def_form.requested_attributes[index].restrictions,
          this.pres_def_form.temp_attrs[index].restriction]
      this.pres_def_form.temp_attrs[index].restriction = '';
    },
    async schema_attributes_clear(){
      this.schemas_form.attributes = [];
    },
    async schema_add_attribute(){
      this.schemas_form.attributes = [...this.schemas_form.attributes,this.schemas_form.attribute];
      this.schemas_form.attribute = '';
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
    async collapse_expanded_pres_def(id){
      let index = this.exspanded_pres_def_items.indexOf(id)
      this.exspanded_pres_def_items.splice(index, 1);
    },
    async collapse_expanded_trusted_issuer(id){
      let index = this.expanded_issuers_items.indexOf(id)
      this.expanded_issuers_items.splice(index, 1);
    },
    async collapse_expanded_pres_req_sent(id){
      let index = this.expanded_pres_req_sent_items.indexOf(id)
      this.expanded_pres_req_sent_items.splice(index, 1);
    },
    async collapse_expanded_pres_req_rec(id){
      let index = this.expanded_pres_req_rec_items.indexOf(id)
      this.expanded_pres_req_rec_items.splice(index, 1);
    },
    async collapse_expanded_pres_sent(id){
      let index = this.expanded_pres_sent_items.indexOf(id)
      this.expanded_pres_sent_items.splice(index, 1);
    },
    async collapse_expanded_pres_rec(id){
      let index = this.expanded_pres_rec_items.indexOf(id)
      this.expanded_pres_rec_items.splice(index, 1);
    },
    async collapse_expanded_ver(id){
      let index = this.expanded_pres_ver_items.indexOf(id)
      this.expanded_pres_ver_items.splice(index, 1);
    },
    async collapse_expanded_did_item(id){
      let index = this.expanded_dids_items.indexOf(id)
      this.expanded_dids_items.splice(index, 1);
    },
    async collapse_expanded_ledger_item(id){
      let index = this.expanded_ledger_items.indexOf(id)
      this.expanded_ledger_items.splice(index, 1);
    },
  },
  data() {
    return {
      'id': this.$route.params.agentid,
      'connection': {'label':'loading...'},
      'connection_loaded': false,
      'message_history':[],
      'last_sent_msg_id':'',
      'public_did':'',
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
      'dids':{},
      'trusted_issuers':{
        'mgtqGEF8EBQHBLREdRoJ4':{
          'did':'mgtqGEF8EBQHBLREdRoJ4',
          'label':'Sovrin Foundation',
          'ledgers':{
            'sov':{
              'name':'sov',
              'role':'2',
              'doc':'{"endpoint":"https://sovrin.org/"}',
              'verkey':'~7neGXtV1n3S5j1xzzZBz62',
            },
          },
        },
      },
      'schemas':[],
      'schemas_form':{
        'schema_id':'',
        'attributes':[],
        'name':'',
        'version':'',
        'attribute':'',
      },
      'cred_defs':[],
      'cred_def_form':{},
      'pres_def_form':{
        'temp_attrs':[],
        'requested_attributes':[],
        'requested_attribute':'',
        'restriction':'',
        'name':'',
        'version':'',
      },
      'issuer_credentials':[
        {
        "credential_definition_id": "HTu6kykpm55HcjmRoVt4aV:3:CL:74269:default",
        "role": "issuer",
        "created_at": "2019-10-15 05:33:07.248797Z",
        "initiator": "self",
        "state": "offer_sent",
        "schema_id": "HTu6kykpm55HcjmRoVt4aV:2:TedTested:0.5",
        "credential_proposal_dict": {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/credential-preview",
            "attributes": [
          {
            "name": "4",
            "value": "5"
          },
          {
            "name": "3",
            "value": "6"
          },
          {
            "name": "2",
            "value": "7"
          },
          {
            "name": "1",
            "value": "8"
          }]
        },
        "connection_id": "78db5935-bc51-4dcf-a0bc-a7a75fa34df9",
        "thread_id": "a47c551a-6ed1-4d7e-8f86-3a0285c0afbb",
        "updated_at": "2019-10-15 05:33:07.258704Z",
        "auto_offer": false,
        "credential_offer":  {
          "schema_id": "HTu6kykpm55HcjmRoVt4aV:2:TedTested:0.5",
          "cred_def_id": "HTu6kykpm55HcjmRoVt4aV:3:CL:74269:default",
          "key_correctness_proof": {
            "c": "6607313407885854507837744068778047945673084368157418893783112615321600278256",
            "xz_cap": "28990855913124265253647838625465343851640476736427518891141705853260502648496109881280900256626118578543571956433272072604364891241789486784904144804939423326001686397719734374550830669027844009545425557101311833225953484522807547417124207444421830145193500513077863012198512555635746670856232882228719400338375101807072060106949263559379989189703762342576186598886309553764111750130568057843050880495400075535483347140975929910923749775158365938761871651937056096766219345285254543880662415772271092304141414362242717928126458961442051232183228324013819536120738703489223056431691025005946380175791713121862932049677008155152018625697881621992035279904345574537581463555124724985447327188644",
            "xr_cap": [
              [
                "2",
                "28138469658880031618879668159436292681868675714102930392735155837199052236560394247461338556873204919816139750002193966400013698354341584572476829070266792144153433830834234653362757292399458321532972664824861575128724722675417641598922534760691943772770770772751261614945424556583958943728808229055502650230012048541429091771648869251395492700464256628557089107269926487204454696634302080031879432605308867470432626748300801229501885827262411828779597357815571042385700283753568765541716248021439748101972186665571249657324720746603327100490046434327791564791263520047655871419963843700867672276710677853253764878714030428613019993507068429751689703268284279099082109018519195630388846440379"
              ],
              [
                "3",
                "95446094017206433705786332838513553387839950240765848487062349011190578240339573603227530123253475048063960064761231934165019821775514199039651071928385942181019441629548643150079760628407724833906798616694134880517686535675807042959988234861132603804428328525057295166003635604693479282629343622784917876591011943344527185184649881824025713939363163731886420111416846249205785186004431286359901832216558209765919664277152442797438225172367828544851046686386436557070014744437330710734292594284188298528067757660787789150034388341031380440268830291902835541429771516602764671374688406978808121047692658761116371264599569132132483506029647636959743318654858338574955861319311785128308412356877"
              ],
              [
                "master_secret",
                "120664944207498861765821153391532988468862051161720196925484359045612440595038445706211942486619275512522121890224369218524835971709635143500886849407710594222673425678286651692942108566696346241836574352669466875485891976952204674937608715577567794869366036643905464044836280064983549869430434405616880193895576571781136787554804087532097717985351332559299557810514267172671830834011055651245468481510277303761261589594965768570065614481369833428553977684744032127261936977925367620297590768597983914501908320331874034465103171521816250692890585472043175302375159419295840282352392026998800854310471026095753214810097585023580342917820322609239558551765678195670294445356075690530999370320321"
              ],
              [
                "4",
                "35698302129959431537175271619941147841853270248464601308248031332147376250130983277377354985361650783348780151670545105579886453475044187426171755783828939952258921699829794224975010550535229364997571800736395921801845191127081857701731794411014969978815715173373489218843866720190880123562526639358772124868709661877354988866180800349937394150162469297870721141373421563603685028204653880422457527476322640034469859369167754443141246420515049409639624156298028720205857807006082292507413197265028008514810456329967043912247413082718754570336282817992846282654315097467461037857208632975931467215122605625862303956150955519401208567398194692588649843471191809886396530927981203538703428435769"
              ],
              [
                "1",
                "146757483027592237180558284067201227890691587886291436657325546816650598561606062693096366221056750016450225633541443539342566805056994834389511749620293344040108012902486481182343929317987770861682614138336972205427740048483310270605972210829249059832353357472581856429198217999541897374981278495664311715232163799049861874552528517115388386525426208589731835371458918258370469010841689608754698580778035065652079888603478809192783230338879179676441029011278227683972185999419919381673601117038965713030389652137665262820793689452091493895510445620277176964474407173817552680117329534134918231757754439825449952728449047466267255868146920941401805267893855691094851773376925749481749121466607"
              ]
          ]
          },
          "nonce": "669153507874699409372348"
          },
        "auto_issue": true,
        "credential_exchange_id": "3e159cc8-1980-48a2-84a2-61bd88c9e92a"
        }
      ],
      'issuer_presentaions':[],
      'holder_credentials':[
        {
        "credential_definition_id": "HTu6kykpm55HcjmRoVt4aV:3:CL:74269:default",
        "role": "issuer",
        "created_at": "2019-10-15 05:33:07.248797Z",
        "initiator": "self",
        "state": "offer_received",
        "schema_id": "HTu6kykpm55HcjmRoVt4aV:2:TedTested:0.5",
        "credential_proposal_dict": {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/credential-preview",
            "attributes": [
          {
            "name": "4",
            "value": "5"
          },
          {
            "name": "3",
            "value": "6"
          },
          {
            "name": "2",
            "value": "7"
          },
          {
            "name": "1",
            "value": "8"
          }]
        },
        "connection_id": "78db5935-bc51-4dcf-a0bc-a7a75fa34df9",
        "thread_id": "a47c551a-6ed1-4d7e-8f86-3a0285c0afbb",
        "updated_at": "2019-10-15 05:33:07.258704Z",
        "auto_offer": false,
        "credential_offer":  {
          "schema_id": "HTu6kykpm55HcjmRoVt4aV:2:TedTested:0.5",
          "cred_def_id": "HTu6kykpm55HcjmRoVt4aV:3:CL:74269:default",
          "key_correctness_proof": {
            "c": "6607313407885854507837744068778047945673084368157418893783112615321600278256",
            "xz_cap": "28990855913124265253647838625465343851640476736427518891141705853260502648496109881280900256626118578543571956433272072604364891241789486784904144804939423326001686397719734374550830669027844009545425557101311833225953484522807547417124207444421830145193500513077863012198512555635746670856232882228719400338375101807072060106949263559379989189703762342576186598886309553764111750130568057843050880495400075535483347140975929910923749775158365938761871651937056096766219345285254543880662415772271092304141414362242717928126458961442051232183228324013819536120738703489223056431691025005946380175791713121862932049677008155152018625697881621992035279904345574537581463555124724985447327188644",
            "xr_cap": [
              [
                "2",
                "28138469658880031618879668159436292681868675714102930392735155837199052236560394247461338556873204919816139750002193966400013698354341584572476829070266792144153433830834234653362757292399458321532972664824861575128724722675417641598922534760691943772770770772751261614945424556583958943728808229055502650230012048541429091771648869251395492700464256628557089107269926487204454696634302080031879432605308867470432626748300801229501885827262411828779597357815571042385700283753568765541716248021439748101972186665571249657324720746603327100490046434327791564791263520047655871419963843700867672276710677853253764878714030428613019993507068429751689703268284279099082109018519195630388846440379"
              ],
              [
                "3",
                "95446094017206433705786332838513553387839950240765848487062349011190578240339573603227530123253475048063960064761231934165019821775514199039651071928385942181019441629548643150079760628407724833906798616694134880517686535675807042959988234861132603804428328525057295166003635604693479282629343622784917876591011943344527185184649881824025713939363163731886420111416846249205785186004431286359901832216558209765919664277152442797438225172367828544851046686386436557070014744437330710734292594284188298528067757660787789150034388341031380440268830291902835541429771516602764671374688406978808121047692658761116371264599569132132483506029647636959743318654858338574955861319311785128308412356877"
              ],
              [
                "master_secret",
                "120664944207498861765821153391532988468862051161720196925484359045612440595038445706211942486619275512522121890224369218524835971709635143500886849407710594222673425678286651692942108566696346241836574352669466875485891976952204674937608715577567794869366036643905464044836280064983549869430434405616880193895576571781136787554804087532097717985351332559299557810514267172671830834011055651245468481510277303761261589594965768570065614481369833428553977684744032127261936977925367620297590768597983914501908320331874034465103171521816250692890585472043175302375159419295840282352392026998800854310471026095753214810097585023580342917820322609239558551765678195670294445356075690530999370320321"
              ],
              [
                "4",
                "35698302129959431537175271619941147841853270248464601308248031332147376250130983277377354985361650783348780151670545105579886453475044187426171755783828939952258921699829794224975010550535229364997571800736395921801845191127081857701731794411014969978815715173373489218843866720190880123562526639358772124868709661877354988866180800349937394150162469297870721141373421563603685028204653880422457527476322640034469859369167754443141246420515049409639624156298028720205857807006082292507413197265028008514810456329967043912247413082718754570336282817992846282654315097467461037857208632975931467215122605625862303956150955519401208567398194692588649843471191809886396530927981203538703428435769"
              ],
              [
                "1",
                "146757483027592237180558284067201227890691587886291436657325546816650598561606062693096366221056750016450225633541443539342566805056994834389511749620293344040108012902486481182343929317987770861682614138336972205427740048483310270605972210829249059832353357472581856429198217999541897374981278495664311715232163799049861874552528517115388386525426208589731835371458918258370469010841689608754698580778035065652079888603478809192783230338879179676441029011278227683972185999419919381673601117038965713030389652137665262820793689452091493895510445620277176964474407173817552680117329534134918231757754439825449952728449047466267255868146920941401805267893855691094851773376925749481749121466607"
              ]
          ]
          },
          "nonce": "669153507874699409372348"
          },
        "auto_issue": true,
        "credential_exchange_id": "3e159cc8-1980-48a2-84a2-61bd88c9e92a"
        }],
      'holder_presentaions':[],
      'presentation_exchanges':[],
      'trusted_issuers_form':{
        'did':'',
        'label':'',
      },
      'did_form':{
        'did':'',
        'seed':'',
        'label':'',
        'metadata':'',
      },
      'ledger_form':{
        'name':'',
        'gen_url':'',
      },
      'presentation_definitions':{
        '8472d86c-fc14-480a-bd12-e0be147aadb9':{
          'pres_def_id':'8472d86c-fc14-480a-bd12-e0be147aadb9',
          'name': 'registration',
          'version': '1.0.0',
          'requested_attributes':[
            {'name':'address_line_1', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
            {'name':'entity_status_effective', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
            {'name':'entity_name_effective', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
            {'name':'registration_date', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
            {'name':'entity_status', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
            {'name':'entity_type', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
            {'name':'address_line_2', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
            {'name':'addressee', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
            {'name':'country', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
            {'name':'corp_num', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
            {'name':'postal_code', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
            {'name':'province', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
            {'name':'city', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
            {'name':'legal_name', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
            {'name':'age', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},{'issuer_did':'JTUsfPMn1GGZLScyfqf9LU'},]},
            {'name':'favorite_ice_cream'}//no restrictions, this is self attested
          ],
          'requested_predicates':[
            {"name": "age","p_type": ">=","p_value": 18,"restrictions": [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},{'issuer_did':'JTUsfPMn1GGZLScyfqf9LU'}],}
          ]
        }
      },
      'presentation_exchanges': [],
      'supported_protocols': [],
      'compose_json': {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/trust_ping/1.0/ping",
        "response_requested": true
      },
      'basicmessage_compose': "",
      'active_ledger_selector':{
        'leger':'',
      },
      'connections':{},
      'connectionUpdateForm':{},
      'exspanded_connection_items':[],
      'exspanded_active_connection_items':[],
      'exspanded_pending_connection_items':[],
      'exspanded_open_invitation_connection_items':[],
      'exspanded_multi_use_invitations_connection_items':[],
      'invitations':{},
      'expanded_dids_items':[],
      'expanded_ledger_items':[],
      'exspanded_invites_items':[],
      'exspanded_schemas_items':[],
      'exspanded_cred_def_items':[],
      'exspanded_credential_issuer_items':[],
      'expanded_issuers_items':[],
      'exspanded_pres_def_items':[],
      'exspanded_presentation_request_items':[],
      'expanded_pres_req_sent_items':[],
      'expanded_pres_req_rec_items':[],
      'expanded_pres_rec_items':[],
      'expanded_pres_sent_items':[],
      'expanded_pres_ver_items':[],
      'invite_label_form':"master",
      'invite_role_form':"normal",
      'invite_accept_form':"auto",
      'invite_public_form':false,
      'invite_multi_use_form':true,
      'agent_invitation_form':{
        'invitation':'',
      },
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
    //=========================================================================================================================
    //------------------------------------------------ Filter methods ---------------------------------------------------
    //=========================================================================================================================
    /**
     *
     */
    //=========================================================================================================================
    // ---------------------- Connection Filters --------------------      
    activeConnections(){
      return Object.values(this.connections).filter(conn => "state" in conn && conn.state === "active")
    },
    requestStateConnections(){
      return Object.values(this.connections).filter(conn => "state" in conn && conn.state === "request")
    },
    responseStateConnections(){
      return Object.values(this.connections).filter(conn => "state" in conn && conn.state === "response")
    },
    pendingConnections(){
      return Object.values(this.connections).filter(
        conn => "state" in conn &&
        conn.state != "active" &&
        conn.state != "invitation" &&
        conn.state != "error"
      )
    },
    openInvitations(){
      return Object.values(this.connections).filter(
        conn =>
        "state"             in conn &&
        conn.state          === "invitation" &&
        //==========================================
        "invitation_mode"   in conn &&
        conn.invitation_mode != "once"
      )
    },
    multiUseInvitations(){
      return Object.values(this.connections).filter(
        conn =>
        "invitation_mode"   in  conn &&
        conn.invitation_mode !=  "multi" &&
        //==========================================
        "state"             in  conn &&
        conn.state          === "invitation"
      )
    },
    inactiveConnections(){
      return Object.values(this.connections).filter(conn => "state" in conn && conn.state === "inactive")
    },
    staticConnections(){
      return Object.values(this.connections).filter(conn => "state" in conn && conn.state === "static")
    },
    initedStateConnections(){
      return Object.values(this.connections).filter(conn => "state" in conn && conn.state === "init")
    },
    errorStateConnections(){
      return Object.values(this.connections).filter(conn => "state" in conn && conn.state === "error")
    },
    // ---------------------- Credential Definition Filters --------------------      
    issuerCredDefs() {
      return Object.values(this.cred_defs).filter(cred_def => cred_def.author == "self");
    },
    /* credentialDefinition(){
        return this.cred_defs.filter(cred => "state" in cred && cred.state === "offer_sent")
      }, */
    // ---------------------- Issuer Credential Filters --------------------      
    issuerOfferSentStateCredentials(){
      return this.issuer_credentials.filter(cred => "state" in cred && cred.state === "offer_sent")
    },
    issuerReceivedRequestStateCredentials(){
      return this.issuer_credentials.filter(cred => "state" in cred && cred.state === "request_received")
    },
    issuerIssuedStateCredentials(){
      return this.issuer_credentials.filter(cred => "state" in cred && cred.state === "issued")
    },
    issuerStoredStateCredentials(){
      return this.issuer_credentials.filter(cred => "state" in cred && cred.state === "stored")
    },
    // ---------------------- Holder Credential Filters --------------------      
    holderOfferReceivedStateCredentials(){
      return this.holder_credentials.filter(cred => "state" in cred && cred.state === "offer_received")
    },
    holderSentRequestStateCredentials(){
      return this.holder_credentials.filter(cred => "state" in cred && cred.state === "request_sent")
    },
    holderReceivedStateCredentials(){
      return this.holder_credentials.filter(cred => "state" in cred && cred.state === "credential_received")
    },
    holderStoredStateCredentials(){
      return this.holder_credentials.filter(cred => "state" in cred && cred.state === "stored")
    },
    // ---------------------- Presentation Definitions Filters --------------------     
    /**
     * Roles 
     *  'prover'
     *  'verifier'
     * States
     *  "proposal_sent"
     *  "proposal_received"
     *  "request_sent"
     *  "request_received"
     *  "presentation_sent"
     *  "presentation_received"
     *  "verified"
     *  */ 
    // ---------------------- verifier Presentation Filters --------------------     
    verifierSentProposals(){
      return this.presentation_exchanges.filter(
        exchange => 
        "state" in exchange && 
        exchange.state === "proposal_sent"  && 
        //==========================================
        "role" in exchange &&
        "verifier" === exchange.role
      )
    },
    verifierReceivedProposals: function(exchange){
      return this.presentation_exchanges.filter(
        exchange => 
        "state" in exchange && 
        exchange.state === "proposal_received" && 
        //==========================================
        "role" in exchange &&
        "verifier" === exchange.role)
    },
    verifierSentRequests(){
      return this.presentation_exchanges.filter(
        exchange => 
        "state" in exchange &&
        exchange.state === "request_sent" && 
        //==========================================
        "role" in exchange &&
        "verifier" === exchange.role)
    },
    verifierReceivedRequests(){
      return this.presentation_exchanges.filter(
        exchange => 
        "state" in exchange &&
        exchange.state === "request_received" && 
        //==========================================
        "role" in exchange &&
        "verifier" === exchange.role)
    },
    verifierSentPresentations(){
      return this.presentation_exchanges.filter(
        exchange => 
        "state" in exchange &&
        exchange.state === "presentation_sent" &&
        //==========================================
        "role" in exchange &&
        "verifier" === exchange.role )
    },
    verifierReceivedPresentations(){
      return this.presentation_exchanges.filter(
        exchange => 
        "state" in exchange &&
        exchange.state === "presentation_received" &&
        //==========================================
        "role" in exchange &&
        "verifier" === exchange.role )
    },
    verifierVerifiedPresentation(){
      return this.presentation_exchanges.filter(
        exchange => 
        "state" in exchange &&
        exchange.state === "verified" &&
        //==========================================
        "role" in exchange &&
        "verifier" === exchange.role )
    },
    // ---------------------- Prover Presentation Filters --------------------
    proverSentProposals(){
      return this.presentation_exchanges.filter(
        exchange => 
        "state" in exchange && 
        exchange.state === "proposal_sent"  && 
        //==========================================
        "role" in exchange &&
        "prover" === exchange.role
      )
    },
    proverReceivedProposals: function(exchange){
      return this.presentation_exchanges.filter(
        exchange => 
        "state" in exchange && 
        exchange.state === "proposal_received" && 
        //==========================================
        "role" in exchange &&
        "prover" === exchange.role)
    },
    proverSentRequests(){
      return this.presentation_exchanges.filter(
        exchange => 
        "state" in exchange &&
        exchange.state === "request_sent" && 
        //==========================================
        "role" in exchange &&
        "prover" === exchange.role)
    },
    proverReceivedRequests(){
      return this.presentation_exchanges.filter(
        exchange => 
        "state" in exchange &&
        exchange.state === "request_received" && 
        //==========================================
        "role" in exchange &&
        "prover" === exchange.role)
    },
    proverSentPresentations(){
      return this.presentation_exchanges.filter(
        exchange => 
        "state" in exchange &&
        exchange.state === "presentation_sent" &&
        //==========================================
        "role" in exchange &&
        "prover" === exchange.role )
    },
    proverReceivedPresentations(){
      return this.presentation_exchanges.filter(
        exchange => 
        "state" in exchange &&
        exchange.state === "presentation_received" &&
        //==========================================
        "role" in exchange &&
        "prover" === exchange.role )
    },
    proverVerifiedPresentations(){
      return this.presentation_exchanges.filter(
        exchange => 
        "state" in exchange &&
        exchange.state === "verified" &&
        //==========================================
        "role" in exchange &&
        "prover" === exchange.role )
    },
    // ---------------------- Basic Message History --------------------      
    basicmessage_history: function () {
      if (this.connection_loaded) {
        return this.connection.message_history.filter(function(h){
          return h.msg['@type'] == "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/basicmessage/1.0/message";
        });
      }
      return [];
    },
    msgHistoryGroupedByThid(){
      if (this.connection_loaded) {
        return this.connection.message_history.reduce(function(acc, cur, i) {
          var id = ('~thread'in cur.msg && 'thid' in cur.msg['~thread']) ? cur.msg['~thread'].thid : cur.msg['@id']
          acc[id] = acc[id] || []
          acc[id].push(cur)
          return acc },
          {})
      }
      return [];
    },
    most_recent_sent_msgs(){
      return this.msgHistoryGroupedByThid[this.last_sent_msg_id]
    },
    /* sentPresentationRequests(){
      return Object.keys(this.presentation_exchanges).reduce((acc, val) =>
        ("request_sent" === this.presentation_exchanges[val].state ?  {
          ...acc,
          [val]: this.presentation_exchanges[val]
        } : acc
        ), {})
    },
    receivedPresentationRequests(){
      return Object.keys(this.presentation_exchanges).reduce((acc, val) =>
        ("request_received" === this.presentation_exchanges[val].state ?  {
          ...acc,
          [val]: this.presentation_exchanges[val]
        } : acc
        ), {})
    }, */
    sentPresentations(){
      return Object.keys(this.presentation_exchanges).reduce((acc, val) =>
        ("presentation_sent" === this.presentation_exchanges[val].state ?  {
          ...acc,
          [val]: this.presentation_exchanges[val]
        } : acc
        ), {})
    },
    receivedPresentations(){
      return Object.keys(this.presentation_exchanges).reduce((acc, val) =>
        ("presentation_received" === this.presentation_exchanges[val].state ?  {
          ...acc,
          [val]: this.presentation_exchanges[val]
        } : acc
        ), {})
    },
    verifiedPresentations(){
      return Object.keys(this.presentation_exchanges).reduce((acc, val) =>
        ("verified" === this.presentation_exchanges[val].state ?  {
          ...acc,
          [val]: this.presentation_exchanges[val]
        } : acc
        ), {})
    },
    ledgerSchemas(ledger_name){
      console.log("ledger name:",ledger_name)
      let schemas = Object.keys(this.schemas).reduce((acc,key)=>
        ("ledgers" in this.schemas[key] && ledger_name in this.schemas[key].ledgers ?{
          ...acc,
          [key]: this.schemas[key]
        } : acc
        ), {})
      console.log("schemas",schemas)
      return schemas
    },
    getActiveDid(){
      return this.public_did
    },
    selectedActiveDid: {
      get () {
        return this.public_did;
      },
      set (optionValue) {
        return this.activateAgentDid(optionValue);
      },
    },
  },
  async created () {
    // fetch the data when the view is created and the data is
    // already being observed
    await this.fetchAgentData();
    this.getAgentDids();
    this.getAgentActivePublicDid();
    this.getSchemas();
    this.getCredentialDefinitionlist();
    this.getIssuedCredentials();
    this.getIssuersPresentations();
    this.getHoldersCredentials();
    this.getHoldersPresentations();
    this.run_protocol_discovery();
    this.fetchAgentConnections();
    // await this.fetchNewInvite(); // do not automatically create invite
  },
  watch:{}
}
</script>
