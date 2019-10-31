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

      <el-tab-pane label="My Credentials" name="my-credentials">
        <my-credentials></my-credentials>
      </el-tab-pane>

      <el-tab-pane label="Trusted Issuers" name="trusted-issuers">
        <el-row>
          <trusted-issuers></trusted-issuers>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="Presentations" name="presentations">
          <presentations></presentations>
      </el-tab-pane>

      <el-tab-pane label="Verifications" name="verifications">
        <verifications
          ref="verifications"></verifications>
      </el-tab-pane>

      <el-tab-pane label="Compose" name="compose">
        <compose></compose>
      </el-tab-pane>

      <el-tab-pane label="BasicMessage" name="basicmessage">
        <basic-message></basic-message>
      </el-tab-pane>

      <el-tab-pane label="Message History" name="message-history">
        <message-history></message-history>
      </el-tab-pane>

      <el-tab-pane label="Feature Discovery" name="feature-discovery">
        <feature-discovery></feature-discovery>
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
import TrustedIssuers from './TrustedIssuers/TrustedIssuers.vue';
import Presentations from './Presentations/Presentations.vue';
import Verifications from './Verifications/Verifications.vue';
import Compose from './Compose/Compose.vue';
import BasicMessage from './BasicMessage/BasicMessage.vue';
import MessageHistory from './MessageHistory/MessageHistory.vue';
import FeatureDiscovery from './FeatureDiscovery/FeatureDiscovery.vue';
import MyCredentials from './MyCredentials/MyCredentials.vue';

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
    share({use: [
      'active_connections',
      'dids',
      'public_did',
      'cred_defs',
      'proposal_cred_defs',
    ]})
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
    TrustedIssuers,
    Presentations,
    Verifications,
    Compose,
    BasicMessage,
    MessageHistory,
    FeatureDiscovery,
    MyCredentials
  },
  data() {
    return {
      'id': this.$route.params.agentid,
      'open_tab': 'dids',
      'connection': {'label':'loading...'},
      'connection_loaded': false,
      'issuer_presentations': [],
      'holder_credentials': [],
      'holder_presentations': [],
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
    // ---------------------- holder handlers ------------------------
    async processInbound(msg){
      var handlers = {
        //=============================== Credential Holder ====================================
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
    this.$message_bus.$emit('protocols');
    this.$message_bus.$emit('agent-created');
  },
}
</script>
