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
          <div>
            <span slot="label">Did:</span>
            <el-input v-model="did_form.did" style="width:100px;"> </el-input>
            <span slot="label">Seed:</span>
            <el-input v-model="did_form.seed" style="width:100px;"> </el-input>
            <span slot="label">Alias:</span>
            <el-input v-model="did_form.label" style="width:100px;"> </el-input>
          </div>
          <div>
            <el-button type="primary" @click="createDid()">Create DID</el-button>
          </div>
          <link rel="shortcut icon" href="/static"/>
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
                v-on:connection-deleted="deleteAgentConnection"
                @refresh="fetchAgentConnections"></agent-connection-list>
              <agent-connection-list
                title="Pending Connections:"
                editable="true"
                v-bind:list="pendingConnections"
                v-on:connection-editted="updateAgentConnection"
                v-on:connection-deleted="deleteAgentConnection"></agent-connection-list>
              <!---<agent-connection-list
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
                v-on:connection-deleted="deleteAgentConnection"></agent-connection-list>--->
              <agent-connection-list
                title="Failed Connections:"
                editable="false"
                v-bind:list="errorStateConnections"
                v-on:connection-editted="updateAgentConnection"
                v-on:connection-deleted="deleteAgentConnection"></agent-connection-list>

              <p>Add connection from invitation:</p>
              <el-form :model=agent_invitation_form>
                <el-form-item
                  label="Invitation URL:">
                  <el-input
                    style="width: 300px;"
                    v-model="agent_invitation_form.invitation">
                    <el-button
                      slot="append"
                      type="primary"
                      icon="el-icon-plus"
                      @click="addAgent()">Add</el-button>
                  </el-input>
                </el-form-item>
              </el-form>
              <p>Add Static Agent:</p>
              <el-form :model=static_agent_form>
                <div>
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
                </div>
                <el-form-item>
                  <el-button type="primary" @click="addStaticAgent()">Add Static Agent</el-button>
                </el-form-item>
              </el-form>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="Invitations">
            <agent-invitations
                    v-bind:invitations="invitations"
                    v-on:send-connection-message="send_connection_message">

            </agent-invitations>

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
                v-bind:can_create="true"
                v-bind:list="cred_defs"
                v-bind:schemas="schemas"
                @cred-def-send="publishCredDef"
                @cred-def-get="getCredentialDefinition"></agent-cred-def-list>
              <agent-issue-cred-list
                title="Issued Credentials"
                v-bind:list="issuer_credentials"
                v-bind:connections="activeConnections"
                v-bind:cred_defs="issuerCredDefs"
                @issue="issueCredential"
                @issue-cred-refresh="getIssuedCredentials">            
              </agent-issue-cred-list>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="My Credentials">
            <el-row>
              <agent-cred-def-list
                title="Retrieved Credential Definitions"
                v-bind:can_create="false"
                v-bind:list="cred_defs"
                v-bind:schemas="schemas"
                @cred-def-get="getCredentialDefinition"></agent-cred-def-list>
              <agent-my-credentials-list
                title="Credentials"
                editable="false"
                v-bind:credentials="holder_credentials"
                v-bind:cred_defs="cred_defs"
                v-bind:connections="activeConnections"
                @cred-refresh="getHoldersCredentials"
                @propose="sendCredentialProposal"></agent-my-credentials-list>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="Trusted Issuers">
            <el-row>
              <agent-trust
                title="Trusted Dids"
                v-bind:trusted_issuers= "trusted_issuers"
                @remove-did= "removeTrustedIssuer"
                @store-did= "storeTrustedIssuer"></agent-trust>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="Presentation">
            <el-row>
              <presentations
                title="Presentations"
                v-bind:presentations="holder_presentations"
                v-bind:connections = "activeConnections"
                v-bind:cred_defs = "cred_defs"
                @presentation-refresh = "getHoldersPresentations"
                @send-presentation-proposal= "sendPresentationProposal"></presentations>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="Verifications">
            <agent-verification
              title="Verification"
              v-bind:list="issuer_presentations"
              v-bind:connections="activeConnections"
              v-bind:cred_defs="cred_defs"
              v-bind:trusted_issuers="trusted_issuers"
              @presentation-request="verifierRequestPresentation"></agent-verification>
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
import AgentInvitations from './Agent/Invitations.vue';
import AgentMyCredentialsList from './AgentMyCredentialsList.vue';
import AgentTrust from './AgentTrust.vue';
import Presentations from './Agent/Presentations.vue';
import AgentVerification from './AgentVerification.vue';

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
    AgentInvitations,
    AgentMyCredentialsList,
    AgentTrust,
    Presentations,
    AgentVerification,
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
    async send_connection_message(msg){
      this.connection.send_message(msg);
    },
    async fetchAgentInvitations(){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/invitation-get-list",
        "~transport": {
          "return_route": "all"
        }
      }
      this.connection.send_message(query_msg);
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
     *  # event                | ->  | directive
     * ==========================================
     *  connection-get-list      -> connection-list
     *  connection-get           -> connection //TODO: use
     *  create-invitation        -> invitation
     *  receive-invitation       -> connection
     *  accept-invitation        -> <no handler> //TODO: use
     *  accept-request           -> <no handler> //TODO: use
     *  establish-inbound        -> <no handler> //TODO: use
     *  delete                   -> ack
     *  update                   -> connection
     *  create-static-connection -> static-connection-info
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
    /**
     * # Message Types
     *  # event                      | ->  |  directive
     * ==========================================
     *  send-credential-definition     -> credential-definition-id
     *  credential-definition-get      -> credential-definition
     *  credential-definition-get-list -> credential-definition-list
     *  
     *  send-credential-proposal       -> credential-exchange
     *  send-presentation-proposal     -> presentation-exchange
     *  credentials-get-list           -> credentials-list 
     *  presentations-get-list         -> presentations-list
     */
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
    async verifierRequestPresentation(form){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/request-presentation",
        connection_id: form.connection_id,
        comment: form.comment,
        proof_request: {
          name: form.name,
          version: "1.0",
          requested_attributes: form.attributes.reduce((acc, attribute) => {
            let transmuted_attr = {
              name: attribute.name,
              restrictions: []
            };
            if (attribute.restrictions.cred_def || attribute.restrictions.trusted_issuer) {
              transmuted_attr.restrictions.push({});
            }
            if (attribute.restrictions.cred_def) {
              transmuted_attr.restrictions[0].credential_definition_id = attribute.restrictions.cred_def.cred_def_id;
            }
            if (attribute.restrictions.trusted_issuer) {
              transmuted_attr.restrictions[0].issuer_did = attribute.restrictions.trusted_issuer;
            }
            acc[attribute.name] = transmuted_attr;
            return acc;
          }, {}),
          requested_predicates: form.predicates.reduce((acc, predicate) => {
            let transmuted_pred = {
              name: predicate.name,
              p_type: predicate.p_type,
              p_value: predicate.threshold,
              restrictions: []
            };
            if (predicate.restrictions.cred_def || predicate.restrictions.trusted_issuer) {
              transmuted_pred.restrictions.push({});
            }
            if (predicate.restrictions.cred_def) {
              transmuted_pred.restrictions[0].credential_definition_id = predicate.restrictions.cred_def.cred_def_id;
            }
            if (predicate.restrictions.trusted_issuer) {
              transmuted_pred.restrictions[0].issuer_did = predicate.restrictions.trusted_issuer;
            }
            acc[predicate.name] = transmuted_pred;
            return acc;
          }, {}),
        },
      };
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
      }
      this.connection.send_message(query_msg);
    },
    //================================ Holder events ================================
    async sendCredentialProposal(form){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/send-credential-proposal",
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
    async sendPresentationProposal(form){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/send-presentation-proposal",
        "connection_id": form.connection_id,
        "comment": form.comment,
        "auto_present": form.auto_present , //optional, default to false
        "presentation_proposal": {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/present-proof/1.0/presentation-preview",
          /**
           * name 
           * cred_def_id //optional
           * mime_type //optional
           * value //optional
           * */
          attributes: form.attributes.map(attribute => {
            return {
              name: attribute.name,
              cred_def_id: attribute.cred_def.cred_def_id,
              value: attribute.value
            };
          }),
          /**
           * name
           * cred_def_id
           * predicate
           * threshold
           */
          predicates: form.predicates.map(predicate => {
            return {
              name: predicate.name,
              cred_def_id: predicate.cred_def.cred_def_id,
              predicate: predicate.predicate,
              threshold: predicate.threshold
            };
          })
        },
      };
         
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
    async removeTrustedIssuer(did){
      /*let query_msg = {
        "@type": "",
        "issuer_did": id,
        "~transport": {
          "return_route": "all"
        }
      } */
      //this.connection.send_message(query_msg);
      this.$delete(this.trusted_issuers,did.id)// TODO:remove this after aca-py support is added.
    },
    async resolveTrustedIssuer(did){
      let query_msg = {
        "@type": "",
        "issuer_did": did,
      }
      this.connection.send_message(query_msg);
    },
    async storeTrustedIssuer(trusted_did){
      /* let query_msg = {
        "@type": "",
        "did": trusted_did.id,
        "label": trusted_did.label,
        "~transport": {
          "return_route": "all"
        }
      } */
      //this.connection.send_message(query_msg);
      this.trusted_issuers[trusted_did.id] = { // TODO:remove this after aca-py support is added.
        "id":trusted_did.id,
        "label": trusted_did.label,
      }
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
      this.connections = connections;
      this.connectionUpdateForm = connections;
    },
    async fetchedInvitationList(msg){
      const invitations = msg.results.reduce(function(acc, cur, i) {
        acc[cur.connection.connection_id] = cur;
        return acc;
      }, {});
      this.invitations = invitations;
      this.invitationUpdateForm = invitations;
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
      setTimeout(() => {
        return this.getCredentialDefinitionlist();
      }, 4500);
      /* if ('cred_def_id' in msg){
        return this.getCredentialDefinitionlist();
      } */
    },
    async credentialDefinitionReadDirective(msg){// does this work???? Do we need this?
     // attempt to update current records
     if ('credential_definition' in msg){
        var index = this.cred_defs.indexOf(msg.credential_definition);
        if (index !== -1) {
          this.cred_defs[index] = msg.credential_definition;
        }
        else{
          this.cred_defs.push(msg.credential_definition);
        }
      }
      // check for update in a little.
      setTimeout(() => {
        return this.getCredentialDefinitionlist();
      }, 4500);
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
    async verifierRequestPresentationRecordDirective(msg){
      if('results'in msg ){
        return this.getIssuersPresentations();
      }
    },
    async verifierPresentationListDirective(msg){
      if('results'in msg ){// should be 'presentations~attach'
        this.issuer_presentations = msg.results;
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
      console.log(msg.invitation);
      // refetch list
      this.fetchAgentInvitations();

      /*this.invitations[ msg.connection_id] = {
        //... msg.invitation, // invitations is not a json yet...
        "invitation": msg.invitation,
        "connection_id" : msg.connection_id,
        "invitation_url": msg.invitation_url
      }*/
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
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/invitation-list": this.fetchedInvitationList,
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
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/request-presentation": this.verifierRequestPresentationRecordDirective,
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/presentations-list": this.verifierPresentationListDirective,
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
      'trusted_issuers':{},
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
      'issuer_credentials': [],
      'issuer_presentations': [],
      'holder_credentials': [],
      'holder_presentations': [],
      'presentation_exchanges': [],
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
      return Object.values(this.cred_defs).filter(
        cred_def => cred_def.author == "self" || cred_def.cred_def_id.split(':', 2)[0] === this.public_did
      );
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
    this.fetchAgentInvitations();
    // await this.fetchNewInvite(); // do not automatically create invite
  },
  watch:{}
}
</script>
