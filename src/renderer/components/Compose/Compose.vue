<template>
  <el-row>
    <v-jsoneditor v-model="content"></v-jsoneditor>
    <el-button type="secondary" @click="send">Send</el-button>
    <div class="message-display" v-for="(msg, index) in most_recent_sent_msgs" :key="index">
      <i>{{msg.direction}}</i>
      <vue-json-pretty
        :deep=1
        :data="msg.msg">
      </vue-json-pretty>
    </div>
  </el-row>
</template>

<script>
import VJsoneditor from 'v-jsoneditor';
import message_bus from '../../message_bus.js';

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
    };
  },
  computed: {
    most_recent_sent_msgs: function() {
      return [];
    }
  },
  methods: {
    send: function() {
      this.$message_bus.$emit('send-message', this.content);
    }
  }
}
</script>
