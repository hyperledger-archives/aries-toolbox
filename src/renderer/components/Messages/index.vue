<template>
  <el-row>
    <el-form :inline="true">
      <el-form-item label="To:">
        <el-select
          v-model="connection_id"
          filterable
          placeholder="Select Connection"
          @change="connection_selected">
          <el-option
            v-for="connection in active_connections"
            :key="connection.connection_id"
            :label="connection.their_label"
            :value="connection.connection_id">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div style="margin-bottom: 1em;">
      <el-input
        placeholder="Message"
        @keyup.enter.native="send"
        v-model="content"
        style="width:500px;"></el-input>
      <el-button type="primary" @click="send">Send</el-button>
    </div>
    <div v-for="m in messages" :key="m.message_id">
      <div :class="'basic_message-'+m.state">
        <div class="content">{{m.content}}</div>
        <span class="timestamp">{{nice_time(m.sent_time)}}</span>
      </div>
    </div>
  </el-row>
</template>

<style>
.message-display {
  margin-bottom: 1em;
  border-bottom: 1px solid lightgrey;
  padding-bottom: 1em;
}
.basic_message-sent {
  background-color: white;
  margin-right: 4em;
  margin-bottom: 1em;
  padding: 1em;
  border: 1px solid lightgrey;
  border-radius: 4px;
}
.basic_message-recv {
  background-color: lightblue;
  margin-left: 4em;
  margin-bottom: 1em;
  padding: 1em;
  text-align: right;
  border: 1px solid lightgrey;
  border-radius: 4px;
}
.timestamp {
  font-style: italic;
  font-size: small;
  color: grey;
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
      'https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin_basicmessage/0.1'
    ]
  }
};

export const shared = {
  data: {
    basic_messages: {},
  },
  listeners: {
    'https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin_basicmessage/0.1/sent': (share, msg) => {
      if (!(msg.connection_id in share.basic_messages)) {
        share.$set(share.basic_messages, msg.connection_id, []);
      }
      share.basic_messages[msg.connection_id].push(msg.message);
    },
    'https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin_basicmessage/0.1/new': (share, msg) => {
      if (!(msg.connection_id in share.basic_messages)) {
        share.$set(share.basic_messages, msg.connection_id, []);
      }
      share.basic_messages[msg.connection_id].push(msg.message);
      share.$notify({
        title: 'New message from ' + share.id_to_connection[msg.connection_id].their_label,
        message: (text => {
            if (text.length > 30) {
              return text.slice(0, 30) + '...';
            }
            return text;
          })(msg.message.content),
        duration: 2000
      });
    },
    'https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin_basicmessage/0.1/messages': (share, msg) => {
      share.$set(share.basic_messages, msg.connection_id, msg.messages);
    }
  },
  methods: {
    fetch_messages: function({send}, connection_id, page=0) {
      let limit = 30;
      let offset = 0;
      if (page !== 0) {
        offset = limit * page;
      }
      send({
        '@type': 'https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin_basicmessage/0.1/get',
        'connection_id': connection_id,
        'limit': limit,
        'offset': offset
      });
    }
  }
};

export default {
  name: 'a2a-message',
  mixins: [
    message_bus(),
    share({
      use: ['basic_messages', 'active_connections'],
      actions: ['fetch_connections', 'fetch_messages']
    })
  ],
  data: function() {
    return {
      content: '',
      connection_id: '',
    }
  },
  computed: {
    messages: function() {
      if (!(this.connection_id in this.basic_messages)) {
        return [];
      }
      return this.basic_messages[this.connection_id].sort((lhs, rhs) => {
        return new Date(rhs.sent_time) - new Date(lhs.sent_time);
      });
    }
  },
  created: async function() {
    await this.ready()
    this.fetch_connections();
  },
  methods: {
    send: function() {
      if (!this.content) {
        this.content = '';
        return;
      }

      let msg = {
        "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin_basicmessage/0.1/send",
        "connection_id": this.connection_id,
        "content": this.content
      };
      this.send_message(msg);
      this.content = '';
    },
    connection_selected: function(selected) {
      this.fetch_messages(selected);
    },
    nice_time: function(timestamp) {
      return new Date(timestamp).toLocaleString(
        'en-US',
        {
          weekday: 'long',
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        }
      );
    }
  }
}
</script>
