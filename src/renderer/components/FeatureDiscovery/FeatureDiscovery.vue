<template>
  <el-row>
    <el-button type="primary" @click="query">Query</el-button>
    <table class="table table-sm">
      <tr>
        <th>Protocol</th>
        <th>Roles</th>
      </tr>
      <tr v-for="p in protocols" :key="p.pid">
        <td>{{p.pid}}</td>
        <td>{{p.roles}}</td>
      </tr>
    </table>
  </el-row>
</template>

<script>
import message_bus from '../../message_bus.js';
import share from '../../share.js';

export default {
  name: 'feature-discovery',
  mixins: [
    message_bus({
      events: {
        'protocols': (v) => v.query()
      }
    }),
    share({
      use: ['protocols'],
      events: {
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/discover-features/1.0/disclose":
        (share, msg) => share.protocols = msg.protocols
      }
    })
  ],
  methods: {
    query: function() {
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/discover-features/1.0/query",
        "query": "*"
      };
      this.send_message(query_msg);
    }
  }
}
</script>
