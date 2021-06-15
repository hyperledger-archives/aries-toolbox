<template>
  <el-row>
    <v-jsoneditor v-model="content" :options="options"></v-jsoneditor>
    <el-button type="secondary" @click="send">Send</el-button>
  </el-row>
</template>

<script>
import VJsoneditor from 'v-jsoneditor';
import message_bus from '@/message_bus.js';

export const metadata = {
  menu: {
    label: 'Compose',
    icon: 'el-icon-message',
    group: 'Toolbox to Agent',
    priority: 40,
    required_protocols: [
    ]
  }
};

export default {
  name: 'compose',
  mixins: [message_bus()],
  components: {
    VJsoneditor,
  },
  data: function() {
    return {
      content: {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/trust_ping/1.0/ping",
        "response_requested": true
      },
      options: {
        "mode": "code"
      }
    };
  },
  methods: {
    send: function() {
      this.send_message(this.content);
    }
  }
}
</script>
