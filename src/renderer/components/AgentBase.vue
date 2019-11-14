<template>
  <el-container>
    <el-menu
      style="-webkit-user-select:none;"
      mode="vertical"
      id="side-menu"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      :router="true">
      <el-menu-item-group :index="group" v-for="(group_modules, group) in matching_modules_grouped">
        <span class="menu-title" slot="title">{{group}}</span>
        <el-menu-item :index="m.path" v-for="m in group_modules" :route="{name: m.path}">
          <i v-bind:class="m.icon"></i>
          <span>{{m.label}}</span>
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
import components, {shared} from './components.js';

// icons from https://element.eleme.io/#/en-US/component/icon
let module_list = Object.entries(components).map(([modulename, module]) => ({
  path: module.default.name,
  label: module.metadata && module.metadata.menu && module.metadata.menu.label ? module.metadata.menu.label : module.default.name,
  icon: module.metadata && module.metadata.menu && module.metadata.menu.icon ? module.metadata.menu.icon : 'el-icon-document',
  group: module.metadata && module.metadata.menu && module.metadata.menu.group ? module.metadata.menu.group : 'Other',
  priority: module.metadata && module.metadata.menu && module.metadata.menu.priority ? module.metadata.menu.priority : 100,
  required_protocols: module.metadata && module.metadata.menu && module.metadata.menu.required_protocols ? module.metadata.menu.required_protocols : [],
}));

//sort modules by priority, then label
module_list.sort((a,b)=> a.priority - b.priority ||
                  a.label.localeCompare(b.label));

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
      use: ['dids', 'public_did', 'protocols'],
      actions: ['fetch_dids', 'fetch_active_did', 'activate_did', 'fetch_protocols']
    })
  ],
  props: ['agentid'],
  data: function() {
    return {
      'connection': {'label':'loading...'},
      'modules': module_list,
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
    },
    matching_modules_grouped: function(){
      let pid_list = this.protocols.map(p => p.pid);
      let filtered_list = module_list.filter(function(m){
        return m.required_protocols.every(req_protocol => pid_list.includes(req_protocol));
      });
      //group modules
      let module_groups = filtered_list.reduce(function (r, m) {
          r[m.group] = r[m.group] || [];
          r[m.group].push(m);
          return r;
      }, Object.create(null));
      console.log("filtered", module_groups);
      return module_groups;
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
    this.fetch_protocols();
    this.fetch_dids();
    this.fetch_active_did();
    this.$message_bus.$emit('agent-created');
  },
}
</script>
