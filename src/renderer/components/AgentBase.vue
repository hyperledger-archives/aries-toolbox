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
        <connections></connections>
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
            v-bind:list="proposal_cred_defs"></cred-def-list>
          <agent-my-credentials-list
            title="Credentials"
            editable="false"
            v-bind:credentials="holder_credentials"
            v-bind:cred_defs="proposal_cred_defs"
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

      <el-tab-pane label="Presentations" name="presentations">
          <presentations ref="presentations"></presentations>
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
import Presentations from './Presentations/Presentations.vue';
import Verifications from './Verifications/Verifications.vue';
import Compose from './Compose/Compose.vue';
import BasicMessage from './BasicMessage/BasicMessage.vue';
import MessageHistory from './MessageHistory/MessageHistory.vue';

export default {
  name: 'agent-base',
  mixins: [
    message_bus({
      events: {
        'send-message': (v, msg, return_route) => {
          v.send_connection_message(msg, return_route)
        }
      }
    }),
    share([
      'connections',
      'active_connections',
      'dids',
      'public_did',
      'cred_defs',
      'proposal_cred_defs'
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
  data() {
    return {
      'id': this.$route.params.agentid,
      'open_tab': 'dids',
      'connection': {'label':'loading...'},
      'connection_loaded': false,
      'trusted_issuers':{},
      'issuer_credentials': [],
      'issuer_presentations': [],
      'holder_credentials': [],
      'holder_presentations': [],
      'supported_protocols': [],
    }
  },
  methods: {
    ...mapActions("Agents", ["get_agent"]),
    async fetchAgentData(){
      //load from vue store
      this.connection = from_store(await this.get_agent(this.id), this.processInbound);
      this.connection_loaded = true;
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
    async getHoldersCredentials(){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/credentials-get-list",
      }
      this.connection.send_message(query_msg);
    },
    async getHoldersPresentations(){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/presentations-get-list",
      }
      this.connection.send_message(query_msg);
    },
    //================================ trusted issuer events ================================
    async removeTrustedIssuer(did){
      this.$delete(this.trusted_issuers,did.id)// TODO:remove this after aca-py support is added.
    },
    async storeTrustedIssuer(trusted_did){
      this.trusted_issuers[trusted_did.id] = { // TODO:remove this after aca-py support is added.
        "id":trusted_did.id,
        "label": trusted_did.label,
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
        //=============================== Credential Holder ====================================
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/credential-exchange": this.holderCredentialRecord,
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/credentials-list": this.holderCredentialListRecord,
      };
      var handler = handlers[msg['@type']];
      if(handler){
        handler(msg);
      }
      this.$message_bus.$emit('message-received', msg);
      this.$message_bus.$emit(msg['@type'], msg);
    },
  },
  computed: {
    // ---------------------- Holder Credential Filters --------------------
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
    this.$message_bus.$emit('agent-created');
  },
}
</script>
