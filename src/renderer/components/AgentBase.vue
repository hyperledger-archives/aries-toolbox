<template>
  <el-container>
    <el-aside>
      <el-menu
        mode="vertical"
        class="side-menu"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
        :router="true">
        <el-menu-item-group index="indirect">
          <span class="menu-title" slot="title">Agent to Agent</span>
          <el-menu-item :index="'/agent/{{ id }}/dids'">
            <i class="el-icon-link"></i>
            <span>DIDs</span>
          </el-menu-item>
          <el-menu-item :index="'/agent/{{ id }}/invitations'">
            <i class="el-icon-plus"></i>
            <span>Invitations</span>
          </el-menu-item>
          <el-menu-item :index="'/agent/{{ id }}/connections'">
            <i class="el-icon-user"></i>
            <span>Connections</span>
          </el-menu-item>
          <el-menu-item :index="'/agent/{{ id }}/static-connections'">
            <i class="el-icon-box"></i>
            <span>Static Connections</span>
          </el-menu-item>
          <el-menu-item :index="'/agent/{{ id }}/credential-issuance'">
            <i class="el-icon-document"></i>
            <span>Credential Issuance</span>
          </el-menu-item>
          <el-menu-item :index="'/agent/{{ id }}/trusted-issuers'">
            <i class="el-icon-connection"></i>
            <span>Trusted Issuers</span>
          </el-menu-item>
          <el-menu-item :index="'/agent/{{ id }}/my-credentials'">
            <i class="el-icon-bank-card"></i>
            <span>My Credentials</span>
          </el-menu-item>
          <el-menu-item :index="'/agent/{{ id }}/presentations'">
            <i class="el-icon-document-checked"></i>
            <span>Presentations</span>
          </el-menu-item>
          <el-menu-item :index="'/agent/{{ id }}/verifications'">
            <i class="el-icon-s-claim"></i>
            <span>Verification</span>
          </el-menu-item>
        </el-menu-item-group>
        <el-menu-item-group index="direct">
          <span class="menu-title" slot="title">Toolbox to Agent</span>
          <el-menu-item :index="'/agent/{{ id }}/feature-discovery'">
            <i class="el-icon-discover"></i>
            <span>Discovered Features</span>
          </el-menu-item>
          <el-menu-item :index="'/agent/{{ id }}/compose'">
            <i class="el-icon-message"></i>
            <span>Compose</span>
          </el-menu-item>
          <el-menu-item :index="'/agent/{{ id }}/message-history'">
            <i class="el-icon-receiving"></i>
            <span>Message History</span>
          </el-menu-item>
          <el-menu-item :index="'/agent/{{ id }}/basic-message'">
            <i class="el-icon-chat-line-square"></i>
            <span>Basic Message</span>
          </el-menu-item>
        </el-menu-item-group>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
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
      </el-header>

      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style>
.side-menu {
  height: 100%;
  min-height: 400px;
}
.side-menu .menu-title {
  color: #fff
}
.side-menu i {
  color: #409EFF;
}
</style>

<script>
const bs58 = require('bs58');
const rp = require('request-promise');

import Vue from 'vue';
import { mapState, mapActions } from "vuex";
import { from_store } from '../connection_detail.js';
import message_bus from '../message_bus.js';
import share from '../share.js';

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
