<template>
  <el-row>
    <connection-list
      title="Active Connections:"
      editable="true"
      :list="active_connections"
      @connection-editted="update_connection"
      @connection-deleted="delete_connection"
      @refresh="fetch"></connection-list>
    <connection-list
      title="Pending Connections:"
      editable="true"
      :list="pending_connections"
      @connection-editted="update_connection"
      @connection-deleted="delete_connection"></connection-list>
    <connection-list
      title="Failed Connections:"
      editable="false"
      :list="failed_connections"
      @connection-editted="update_connection"
      @connection-deleted="delete_connection"></connection-list>

    <p>Add connection from invitation:</p>
    <el-form @submit.native.prevent>
      <el-form-item
        label="Invitation URL:">
        <el-input
          style="width: 300px;"
          v-model="invitation">
          <el-button
            slot="append"
            type="primary"
            icon="el-icon-plus"
            @click="recieve_invitation">Add</el-button>
        </el-input>
      </el-form-item>
    </el-form>

  </el-row>
</template>

<script>
import ConnectionList from './ConnectionList.vue';
import message_bus from '../../message_bus.js';
import share from '../../share.js';

export default {
  name: 'connections',
  components: {
    ConnectionList
  },
  mixins: [
    message_bus(),
    share(['connections', 'active_connections'])
  ],
  data: function() {
    return {
      'invitation': '',
    }
  },
  created: function() {
    let component = this;
    this.$message_bus.$on(
      "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/connection-list",
      msg => component.connections = msg.results
    );
    this.$message_bus.$on(
      "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/connection",
      msg => component.fetch()
    );
    this.$message_bus.$on(
      "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/ack",
      msg => component.fetch(),
    );
    this.$message_bus.$on('connections', () => component.fetch());
  },
  computed: {
    pending_connections: function() {
      return Object.values(this.connections).filter(
        conn => "state" in conn &&
        conn.state != "active" &&
        conn.state != "invitation" &&
        conn.state != "error"
      );
    },
    failed_connections: function() {
      return Object.values(this.connections).filter(
        conn => "state" in conn && conn.state === "error"
      );
    }
  },
  methods: {
    fetch: function(){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/connection-get-list",
      }
      this.$message_bus.$emit('send-message', query_msg);
    },
    update_connection: function(form) {
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/update",
        "connection_id": form.connection_id,
        "label": form.label,
        "role": form.role,
      }
      this.$message_bus.$emit('send-message', query_msg);
    },
    delete_connection: function(connection) {
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/delete",
        "connection_id": connection.connection_id,
      }
      this.$message_bus.$emit('send-message', query_msg);
    },
    recieve_invitation: function() {
      let receive_invite_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/receive-invitation",
        "invitation": this.invitation,
        "accept": "auto"
      };
      this.$message_bus.$emit('send-message', receive_invite_msg);
      this.invitation = "";
      setTimeout(() => {
        return this.fetchAgentConnections();
      }, 4000);
    },
  },
}
</script>
