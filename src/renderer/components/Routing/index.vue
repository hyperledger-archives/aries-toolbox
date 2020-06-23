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

export const metadata = {
  menu: {
    label: 'Routing',
    icon: 'el-icon-chat-line-square',
    group: 'Toolbox to Agent',
    priority: 50,
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
    'https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-routing/0.1/routes_list': (share, msg) => {
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
      use: ['routes']
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
    load: function() {
      let msg = {
        "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-routing/0.1/routes_list_get",
      };
      this.send_message(msg);
      this.content = '';
    }
  }
}
</script>
