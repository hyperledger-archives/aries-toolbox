<template>
  <el-row>
    <div style="">
      <el-button v-on:click="enable_as_mediator()" type="primary">Use As Mediator</el-button>
    </div>
    <div style="margin-bottom: 1em;">
        <p>Mediator Routes</p>
        <el-collapse v-model="expanded_items">
          <ul class="list">
            <el-collapse-item
              v-for="r in mediator_routes"
              v-bind:title="route_name(r)"
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
  </el-row>
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
import message_bus from '@/message_bus.js';
import share from '@/share.js';
import { mapActions } from "vuex"

export const metadata = {
  menu: {
    label: 'Mediator',
    icon: 'el-icon-guide',
    group: 'Toolbox to Agent',
    priority: 50,
    required_protocols: [
      'https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-mediator/0.1'
    ]
  }
};

export const shared = {
  data: {
    mediator_routes: {},
  },
  listeners: {
    'https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-mediator/0.1/routes_list': (share, msg) => {
      share.mediator_routes = msg.results;
    }
  }
};

import VueJsonPretty from 'vue-json-pretty';

export default {
  name: 'mediator',
  components: {
    VueJsonPretty,
  },
  inject: ['get_connection'],
  mixins: [
    message_bus(),
    share({
      use: ['mediator_routes', 'active_connections']
    })
  ],
  data: function() {
    return {
      expanded_items:[],
    }
  },
  created: async function() {
    await this.ready()
    this.load();
  },
  methods: {
    ...mapActions("Agents", ["update_agent"]),

    route_name: function(r){
      let connection_label = 'Unknown';
      let matched_connection = this.active_connections.filter(function(c){
        return c.connection_id == r.connection_id;
      });
      if(matched_connection.length == 1){
        connection_label = matched_connection[0].label;
      }

      return connection_label + ': ' + r.recipient_key;
    },
    enable_as_mediator: function(){
      //get connection detail, mark as a mediator, use bus to tell agentlist about it
      let conn = this.get_connection();
      conn.active_as_mediator = true;
      this.update_agent(conn.to_store());
      console.log("connection to mediate through", conn);
    },
    load: function() {
      let msg = {
        "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-mediator/0.1/routes_list_get",
      };
      this.send_message(msg);
    }
  }
}
</script>
