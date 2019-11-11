<template>
  <el-row>
    <el-button type="secondary" @click="history.slice(o, history.length)">Clear</el-button>
    <div class="message-display" v-for="m in history.slice().reverse()" :key="m.msg['@id']">
      <i>{{m.direction}}</i>
      <vue-json-pretty
        :deep=1
        :data="m.msg">
      </vue-json-pretty>
    </div>
  </el-row>
</template>

<script>
import message_bus from '../../message_bus.js';
import VueJsonPretty from 'vue-json-pretty';

export default {
  name: 'message-history',
  mixins: [message_bus()],
  components: {
    VueJsonPretty
  },
  data: function() {
    return {
      history: []
    }
  },
  created: function() {
    let component = this;
    this.$message_bus.$on('message-received', (msg) => component.history.push({
      'msg': msg,
      'direction': 'Received'
    }));
    this.$message_bus.$on('send-message', (msg) => component.history.push({
      'msg': msg,
      'direction': 'Sent'
    }));
  }
}
</script>
