<template>
  <el-container>
    <el-menu
      mode="vertical"
      id="side-menu"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      :router="true">
      <el-menu-item-group index="indirect">
        <span class="menu-title" slot="title">Agent to Agent</span>
        <el-menu-item index="1" :route="{name: 'dids'}">
          <i class="el-icon-link"></i>
          <span>DIDs</span>
        </el-menu-item>
        <el-menu-item index="2" :route="{name: 'invitations'}">
          <i class="el-icon-plus"></i>
          <span>Invitations</span>
        </el-menu-item>
        <el-menu-item index="3" :route="{name: 'connections'}">
          <i class="el-icon-user"></i>
          <span>Connections</span>
        </el-menu-item>
        <el-menu-item index="4" :route="{name: 'static-connections'}">
          <i class="el-icon-box"></i>
          <span>Static Connections</span>
        </el-menu-item>
        <el-menu-item index="5" :route="{name: 'credential-issuance'}">
          <i class="el-icon-document"></i>
          <span>Credential Issuance</span>
        </el-menu-item>
        <el-menu-item index="6" :route="{name: 'trusted-issuers'}">
          <i class="el-icon-connection"></i>
          <span>Trusted Issuers</span>
        </el-menu-item>
        <el-menu-item index="7" :route="{name: 'my-credentials'}">
          <i class="el-icon-bank-card"></i>
          <span>My Credentials</span>
        </el-menu-item>
        <el-menu-item index="8" :route="{name: 'presentations'}">
          <i class="el-icon-document-checked"></i>
          <span>Presentations</span>
        </el-menu-item>
        <el-menu-item index="9" :route="{name: 'verifications'}">
          <i class="el-icon-s-claim"></i>
          <span>Verification</span>
        </el-menu-item>
      </el-menu-item-group>
      <el-menu-item-group index="direct">
        <span class="menu-title" slot="title">Toolbox to Agent</span>
        <el-menu-item index="10" :route="{name: 'feature-discovery'}">
          <i class="el-icon-discover"></i>
          <span>Discovered Features</span>
        </el-menu-item>
        <el-menu-item index="11" :route="{name: 'compose'}">
          <i class="el-icon-message"></i>
          <span>Compose</span>
        </el-menu-item>
        <el-menu-item index="12" :route="{name: 'message-history'}">
          <i class="el-icon-receiving"></i>
          <span>Message History</span>
        </el-menu-item>
        <el-menu-item index="13" :route="{name: 'basic-message'}">
          <i class="el-icon-chat-line-square"></i>
          <span>Basic Message</span>
        </el-menu-item>
      </el-menu-item-group>
    </el-menu>
    <nav id="top-bar" class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">{{connection.label}}</a>
      <el-form
        :disabled="dids.length === 0">
        <el-select
          v-model="active_did"
          filterable placeholder="Activate DID">
          <el-option
            v-for="did in dids"
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

    <el-main id="main-display">
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<style>
  #top-bar {
    position:absolute;
    right: 0px;
    left:200px;
    height: 60px;
  }

  #main-display {
    position: absolute;
    right:0px;
    bottom: 0px;
    top: 60px;
    left: 200px;
  }

  #side-menu {
    height: 100%;
    width: 200px;
    position: absolute;

  }
  #side-menu .menu-title {
    color: #fff
  }
  #side-menu i {
    color: #409EFF;
  }

  .el-menu-item-group__title {
    font-size: 18px;
  }

  .el-menu-item {
    height: 36px;
    line-height: 36px;
  }

</style>

<script>
const bs58 = require('bs58');
const rp = require('request-promise');

import Vue from 'vue';
import { mapState, mapActions } from "vuex";
import { from_store } from '../connection_detail.js';
import message_bus from '@/message_bus.js';
import share, {share_source} from '@/share.js';
import {shared} from './components.js';

export default {
  name: 'agent-base',
  mixins: [
    message_bus({ events: {
      'send-message': (v, msg, return_route) => {
        v.send_connection_message(msg, return_route);
      }
    }}),
    share_source(shared),
    share({
      use: ['dids', 'public_did',],
      actions: ['fetch_dids', 'fetch_active_did', 'activate_did']
    })
  ],
  props: ['agentid'],
  data: function() {
    return {
      'connection': {'label':'loading...'},
    }
  },
  computed: {
    active_did: {
      get () {
        return this.public_did || "";
      },
      set (did) {
        return this.activate_did(did)
      }
    }
  },
  methods: {
    ...mapActions("Agents", ["get_agent"]),
    async send_connection_message(msg){
      await this.connection_loaded;
      this.connection.send_message(msg);
    },
    async processInbound(msg){
      this.$message_bus.$emit('message-received', msg);
      this.$message_bus.$emit(msg['@type'], msg);
    },
  },
  created: async function() {
    this.connection_loaded = (async () => {
      this.connection = from_store(await this.get_agent(this.agentid), this.processInbound);
    })();
    await this.connection_loaded;
    this.fetch_dids();
    this.fetch_active_did();
    this.$message_bus.$emit('agent-created');
  },
}
</script>
