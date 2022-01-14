<template>
  <el-row>
    <div>
      Endpoint: {{get_connection().service.serviceEndpoint}}<br/>
      Use Return Route: {{get_connection().use_return_route}}
    </div>
    <el-button type="secondary" @click="clear_history">Clear</el-button>
    <message-list v-bind:messages="message_history"></message-list>
  </el-row>
</template>

<script>
import message_bus from '@/message_bus.js';
import share from '@/share.js';
import MessageList from './MessageList.vue'

export const metadata = {
  menu: {
    label: 'Message History',
    icon: 'el-icon-receiving',
    group: 'Toolbox to Agent',
    priority: 50,
    required_protocols: [
    ]
  }
};

export const shared = {
  data: {
    message_history: []
  },
  listeners: {
    'message-received': (share, msg) => {
      share.message_history.push({msg: msg, direction: 'Received'});
    },
    'sent-message': (share, msg) => {
      share.message_history.push({msg: msg, direction: 'Sent'});
    }
  }
};

export default {
  name: 'message-history',
  inject: ['get_connection'],
  mixins: [
    message_bus(),
    share({
      use: ['message_history']
    })
  ],
  methods: {
    clear_history: function(){
      this.message_history.length = 0;
    }
  },
  components: {
    MessageList
  }
}
</script>
