<template>
  <el-row>
    <el-button type="secondary" @click="message_history.slice(o, message_history.length)">Clear</el-button>
    <div class="message-display" v-for="m in message_history.slice().reverse()" :key="m.msg['@id']">
      <i>{{m.direction}}</i>
      <vue-json-pretty
        :deep=1
        :data="m.msg">
      </vue-json-pretty>
    </div>
  </el-row>
</template>

<script>
import message_bus from '@/message_bus.js';
import share from '@/share.js';
import VueJsonPretty from 'vue-json-pretty';

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
    'send-message': (share, msg) => {
      share.message_history.push({msg: msg, direction: 'Sent'});
    }
  }
};

export default {
  name: 'message-history',
  mixins: [
    message_bus(),
    share({
      use: ['message_history']
    })
  ],
  components: {
    VueJsonPretty
  },
}
</script>
