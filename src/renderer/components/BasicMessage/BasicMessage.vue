<template>
  <el-row>
    <div style="margin-bottom: 1em;">
      <el-input
        placeholder="Message to send to the connected Agent"
        @keyup.enter.native="send"
        v-model="content"
        style="width:500px;"></el-input>
      <el-button type="primary" @click="send">Send</el-button>
    </div>
    <div v-for="m in messages.slice().reverse()" :key="m.msg['@id']">
      <div :class="'basicmessage-'+m.direction">{{m.msg.content}}</div>
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
import message_bus from '../../message_bus.js';

export default {
  name: 'basic-message',
  mixins: [message_bus()],
  data: function() {
    return {
      messages: [],
      content: '',
    }
  },
  created: function() {
    let component = this;
    this.$message_bus.$on(
      'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/basicmessage/1.0/message',
      (msg) => component.messages.push({
        'msg': msg,
        'direction': 'Received'
      })
    );
    this.$message_bus.$on(
      'send-message',
      (msg) => {
        if (msg['@type'] === 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/basicmessage/1.0/message') {
          component.messages.push({
            'msg': msg,
            'direction': 'Sent'
          })
        }
      }
    );
  },
  methods: {
    send: function() {
      let msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/basicmessage/1.0/message",
        "content": this.content
      };
      this.$message_bus.$emit('send-message', msg);
      this.content = '';
    }
  }
}
</script>
