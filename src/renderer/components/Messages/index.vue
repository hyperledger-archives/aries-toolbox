<template>
  <el-row>
    <div style="margin-bottom: 1em;">
      <el-input
        placeholder="Message"
        @keyup.enter.native="send"
        v-model="content"
        style="width:500px;"></el-input>
      <el-button type="primary" @click="send">Send</el-button>
    </div>
    <div v-for="m in a2amessages.slice().reverse()" :key="m.msg['@id']">
      <div :class="'a2amessage-'+m.direction">{{m.msg.content}}</div>
    </div>
  </el-row>
</template>

<style>
.message-display {
  margin-bottom: 1em;
  border-bottom: 1px solid lightgrey;
  padding-bottom: 1em;
}
.a2amessage-Sent {
  background-color: white;
  margin-right: 4em;
  margin-bottom: 1em;
  padding: 1em;
  border: 1px solid lightgrey;
  border-radius: 4px;
}
.a2amessage-Received {
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
    label: 'Messages',
    icon: 'el-icon-chat-line-square',
    group: 'Agent to Agent',
    priority: 45,
    required_protocols: [
      'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/basicmessage/1.0'
    ]
  }
};

export const shared = {
  data: {
    a2amessages: [],
  },
  listeners: {
    'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/basicmessage/1.0/message': (share, msg) => {
      share.a2amessages.push({
        'msg': msg,
        'direction': 'Received'
      });
    },
    'send-message': (share, msg) => {
      if (msg['@type'] === 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/basicmessage/1.0/message') {
        share.a2amessages.push({
          'msg': msg,
          'direction': 'Sent'
        });
      }
    }
  }
};

export default {
  name: 'a2a-message',
  mixins: [
    message_bus(),
    share({
      use: ['a2amessages']
    })
  ],
  data: function() {
    return {
      content: '',
    }
  },
  methods: {
    send: function() {
      let msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/basicmessage/1.0/message",
        "content": this.content
      };
      this.send_message(msg);
      this.content = '';
    }
  }
}
</script>
