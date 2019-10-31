<template>
  <div id="wrapper" class="container-fluid">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">{{connection.label}}</a>
      <el-form
        v-if="$refs.dids"
        :disabled="Object.keys(dids).length === 0"
        :model="$refs.dids.active_ledger_selector">
        <el-select
          v-model="selectedActiveDid"
          filterable placeholder="activate did">
          <el-option
            v-for="did in Object.values(dids)"
            :key="did.did"
            :label="did.did"
            :value="did">
          </el-option>
        </el-select>
        <!--
        <el-select
            v-if="$refs.ledgerTab"
            v-model="$refs.ledgerTab.active_ledger_selector.ledger"
            filterable placeholder="activate ledger" >
            <el-option
              v-for="ledger in $refs.ledgerTab.ledgers"
              :key="ledger.name"
              :label="ledger.name"
              :value="ledger.name">
            </el-option>
        </el-select>
        -->
      </el-form>
    </nav>

    <el-tabs
      type="border-card"
      v-model="open_tab"
      @tab-click="clickedTab">

      <el-tab-pane label="Dids" name="dids">
        <dids ref="dids"></dids>
      </el-tab-pane>

      <!--
      <el-tab-pane label="Ledger" name="ledgerTab">
        <ledgers ref="ledgerTab"></ledgers>
      </el-tab-pane>
      -->

      <el-tab-pane label="Invitations" name="invitations">
        <invitations></invitations>
      </el-tab-pane>

      <el-tab-pane label="Connections" name="connections">
        <connections
          ref="connections"></connections>
      </el-tab-pane>

      <el-tab-pane label="Static Connections" name="static-connections">
        <static-connections></static-connections>
      </el-tab-pane>

      <el-tab-pane label="Credential Issuance" name="credential-issuance">
        <credential-issuance></credential-issuance>
      </el-tab-pane>

      <el-tab-pane label="My Credentials">
        <el-row>
          <cred-def-list
            title="Retrieved Credential Definitions"
            v-bind:retrievable="true"
            v-bind:can_create="false"
            v-bind:list="proposalCredDefs"
            v-bind:schemas="schemas"></cred-def-list>
          <agent-my-credentials-list
            title="Credentials"
            editable="false"
            v-bind:credentials="holder_credentials"
            v-bind:cred_defs="proposalCredDefs"
            v-bind:connections="active_connections"
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
            v-bind:connections = "active_connections"
            v-bind:cred_defs = "cred_defs"
            @presentation-refresh = "getHoldersPresentations"
            @send-presentation-proposal= "sendPresentationProposal"></presentations>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="Verifications" name="verifications">
        <verifications
          ref="verifications"></verifications>
      </el-tab-pane>

      <el-tab-pane label="Compose">
        <compose></compose>
      </el-tab-pane>

      <el-tab-pane label="BasicMessage">
        <basic-message></basic-message>
      </el-tab-pane>

      <el-tab-pane label="Message History">
        <message-history></message-history>
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

<script>
const bs58 = require('bs58');
const rp = require('request-promise');

import Vue from 'vue';
import { mapState, mapActions } from "vuex";
import { from_store } from '../connection_detail.js';
import message_bus from '../message_bus.js';
import share from '../share.js';

import VueJsonPretty from 'vue-json-pretty';
import Dids from './Dids/Dids.vue';
import Ledger from './Ledger/Ledger.vue';
import Connections from './Connections/Connections.vue';
import Invitations from './Invitations/Invitations.vue';
import StaticConnections from './StaticConnections/StaticConnections.vue';
import CredentialIssuance from './CredentialIssuance/CredentialIssuance.vue';
import CredDefList from './CredentialIssuance/CredDefList.vue';
import AgentMyCredentialsList from './AgentMyCredentialsList.vue';
import AgentTrust from './AgentTrust.vue';
import Presentations from './Agent/Presentations.vue';
import Verifications from './Verifications/Verifications.vue';
import Compose from './Compose/Compose.vue';
import BasicMessage from './BasicMessage/BasicMessage.vue';
import MessageHistory from './MessageHistory/MessageHistory.vue';

export default {
  name: 'agent-base',
  mixins: [
    message_bus(),
    share([
      'connections',
      'active_connections',
      'dids',
      'public_did',
      'cred_defs'
    ])
  ],
  components: {
    VueJsonPretty,
    Dids,
    Ledger,
    Connections,
    CredentialIssuance,
    CredDefList,
    Invitations,
    StaticConnections,
    AgentMyCredentialsList,
    AgentTrust,
    Presentations,
    Verifications,
    Compose,
    BasicMessage,
    MessageHistory,
  },
  methods: {
    ...mapActions("Agents", ["get_agent"]),
    //=========================================================================================================================
    //-------------------------Outbound Messages-------------------------------------------------------------------
    //=========================================================================================================================
    /**
     *  Agent admin messages sent to change state of wallet and did connections.
     */
    //=========================================================================================================================
    async fetchAgentData(){
      //load from vue store
      this.connection = from_store(await this.get_agent(this.id), this.processInbound);
      this.connection_loaded = true;
    },
    mutate: function(subject, data) {
      this[subject] = data;
    },
    async send_connection_message(msg){
      this.connection.send_message(msg);
    },
    clickedTab: function(tab) {
      console.log("clickedTab",tab.name);
      if (tab.name){
        this.$message_bus.$emit(tab.name);
      }
      this.$forceUpdate();
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
    // ---------------------- issuance handlers --------------------
    async verifierPresentationListDirective(msg){
      if('results'in msg ){
        this.issuer_presentations = msg.results;
      }
    },
    // ---------------------- holder handlers ------------------------
    async holderCredentialRecord(msg){
      setTimeout(() => {
        return this.getHoldersCredentials();
      }, 4500);
    },
    async holderCredentialListRecord(msg){
      if('results'in msg ){
        this.holder_credentials = msg.results;
      }
    },
    async ProtocolDisclose(msg){
      //console.log(msg.protocols);
      this.supported_protocols = msg.protocols;
    },
    async processInbound(msg){
      var handlers = {
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/discover-features/1.0/disclose": this.ProtocolDisclose,
        //=============================== Credential Issuance ==================================
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/presentations-list": this.verifierPresentationListDirective,
        //=============================== Credential Holder ====================================
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/credential-exchange": this.holderCredentialRecord,
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/credentials-list": this.holderCredentialListRecord,
      };
      var handler = handlers[msg['@type']];
      if(handler){
        handler(msg);
      } else {
        console.log("Message without handler", msg);
      }

      this.$message_bus.$emit('message-received', msg);
      this.$message_bus.$emit(msg['@type'], msg);
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
  },
  data() {
    return {
      'id': this.$route.params.agentid,
      'open_tab': 'dids',
      'connection': {'label':'loading...'},
      'connection_loaded': false,
      'last_sent_msg_id':'',
      'trusted_issuers':{},
      'schemas':[],
      'schemas_form':{
        'schema_id':'',
        'attributes':[],
        'name':'',
        'version':'',
        'attribute':'',
      },
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
      'basicmessage_compose': "",
      'compose_json': {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/trust_ping/1.0/ping",
        "response_requested": true
      },
      'connectionUpdateForm':{},
      'exspanded_connection_items':[],
      'exspanded_active_connection_items':[],
      'exspanded_pending_connection_items':[],
      'exspanded_open_invitation_connection_items':[],
      'exspanded_multi_use_invitations_connection_items':[],
      'invitations':{},
      'expanded_dids_items':[],
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
    }
  },
  computed: {
    //=========================================================================================================================
    //------------------------------------------------ Filter methods ---------------------------------------------------
    //=========================================================================================================================
    /**
     *
     */
    //=========================================================================================================================
    // ---------------------- Connection Filters --------------------
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
      inactive_connections(){
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
      /* credentialDefinition(){
        return this.cred_defs.filter(cred => "state" in cred && cred.state === "offer_sent")
      }, */
      // ---------------------- Issuer Credential Filters --------------------
      issuerCredDefs() {
        return Object.values(this.cred_defs).filter(
          cred_def => cred_def.author === "self" || cred_def.cred_def_id.split(':', 2)[0] === this.public_did
        );
      },
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
      proposalCredDefs() {
        return Object.values(this.cred_defs).filter(
          cred_def => cred_def.author !== "self" || cred_def.cred_def_id.split(':', 2)[0] !== this.public_did
        );
      },
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
      selectedActiveDid: {
        get () {
          return this.public_did || "";
        },
          set (optionValue) {
            return this.$message_bus.$emit('activate-agent-did',optionValue);
          },
      },
      active_ledger_selector:{
        get () {
          console.log("get active ledger selector ", this.$refs.dids);
          return $refs.dids.active_ledger_selector || "";
        },
          set(){

          },
      },
  },
  async created () {
    // fetch the data when the view is created and the data is
    // already being observed
    await this.fetchAgentData();
    this.getHoldersCredentials();
    this.getHoldersPresentations();
    this.run_protocol_discovery();
    this.$message_bus.$on('send-message', this.send_connection_message);
    this.$message_bus.$emit('agent-created');
  },
  watch:{},
}
</script>
