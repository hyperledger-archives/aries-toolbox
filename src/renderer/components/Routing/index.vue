<template>
  <el-row>
    <div style="margin-bottom: 1em;">
        <p>Routes</p>
        <el-collapse v-model="expanded_items">
          <ul class="list">
            <el-collapse-item
              v-for="r in routes"
              v-bind:title="r.recipient_key"
              :name="r.recipient_key"
              :key="r.connection_id">
              <el-row :key="r.connection_id">
                <div>
                  <vue-json-pretty
                    :deep=2
                    :data="r">
                  </vue-json-pretty>
                </div>
              </el-row>
            </el-collapse-item>
          </ul>
        </el-collapse>
    </div>
    <el-form :model="updaterouteform">
      <p>Add Route to connected mediator</p>
      <el-form-item label="Connection:" :label-width="formLabelWidth">
        <el-select
          v-model="updaterouteform.connection_id"
          filterable
          placeholder="Connection">
          <el-option
            v-for="connection in active_connections"
            :key="connection.connection_id"
            :label="connection.label"
            :value="connection.connection_id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="DID:" :label-width="formLabelWidth">
        <el-select
          v-model="updaterouteform.did"
          value-key="did"
          filterable
          placeholder="DID">
          <el-option
            v-for="did in dids"
            :key="did"
            :label="did_get_name(did)"
            :value="did">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Action:" :label-width="formLabelWidth">
        <el-select
          v-model="updaterouteform.action">
          <el-option value="create"></el-option>
          <el-option value="delete"></el-option>
        </el-select>
      </el-form-item>



      <el-button @click="send_update">Go</el-button>
    </el-form>

  </el-row>
</template>

<style>

</style>

<script>
import message_bus from '@/message_bus.js';
import share from '@/share.js';

export const metadata = {
  menu: {
    label: 'Routing',
    icon: 'el-icon-location-outline',
    group: 'Agent to Agent',
    priority: 55,
    required_protocols: [
      'https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-routing/0.1'
    ]
  }
};

export const shared = {
  data: {
    routes: {},
  },
  listeners: {
    'https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-routing/0.1/something': (share, msg) => {
      share.routes = msg.results;
    }
  }
};

import VueJsonPretty from 'vue-json-pretty';

export default {
  name: 'routing',
  components: {
    VueJsonPretty,
  },
  mixins: [
    message_bus(),
    share({
      use: [
        'active_connections',
        'dids',
      ]
    })
  ],
  data: function() {
    return {
      expanded_items:[],
      routes: [],
      updaterouteform: {
        connection_id: null,
        did: null,
        action: 'create',
      },
      formLabelWidth: '100px',
    }
  },
  created: async function() {
    await this.ready()
    this.load();
  },
  methods: {
    did_get_name: function(did) {
      if('metadata'in did && 'label' in did.metadata) {
        return 'did: ' + did.metadata.label;
      }
      return 'did: ' + did.did + ', vk: ' + did.verkey;
    },
    send_update: function(){

      let msg = {
        "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-routing/0.1/send_update",
        "connection_id": this.updaterouteform.connection_id,
        "verkey": this.updaterouteform.did.verkey,
        "action": this.updaterouteform.action,
      };
      this.send_message(msg);
    },
    load: function() {
      /*let msg = {
        "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-routing/0.1/query",
        "connection_id": this.updaterouteform.connection_id
      };
      this.send_message(msg);
      this.routes = [];
      */
    }
  }
}
</script>
