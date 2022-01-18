<template>
  <el-row>
    <connection-list
      title="Active Connections:"
      editable="true"
      :list="active_connections"
      @connection-editted="update_connection"
      @connection-deleted="delete_connection"
      @refresh="fetch_connections"></connection-list>
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

    <p style="margin-top: 1em;">Add connection from invitation:</p>
    <el-form @submit.native.prevent label-width="120px">
      <el-form-item
        label="Invitation URL:">
        <el-input
          style="width: 300px;"
          v-model="invite_form.invitation"
          @keypress.enter.native="recieve_invitation">
          <el-button
            slot="append"
            type="primary"
            icon="el-icon-plus"
            @click="recieve_invitation">Add</el-button>
        </el-input>
      </el-form-item>
      <el-form-item v-if="supports_mediation" label="Mediator:">
        <el-select style="width: 300px;"
          v-model="invite_form.mediation_id"
          filterable
          no-data-text="No mediators found"
          placeholder="Mediator">
          <el-option
            v-for="mediator in mediators"
            :key="mediator.mediation_id"
            :label="mediator_name(mediator)"
            :value="mediator.mediation_id">
          </el-option>
        </el-select>
        <i>Optionally select a mediator for this invitation.</i>
      </el-form-item>
    </el-form>
  </el-row>
</template>

<script>
import ConnectionList from './ConnectionList.vue';
import share from '@/share.js';
import message_bus from '@/message_bus.js';
import { COORDINATE_MEDIATION } from '../Mediator';

export const protocol = 'https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-connections/0.1';
export const metadata = {
  menu: {
    label: 'Connections',
    icon: 'el-icon-user',
    group: 'Agent to Agent',
    priority: 30,
    required_protocols: [
      protocol
    ]
  },
  types: {
    connection: protocol + '/connection',
    get_list: protocol + '/get-list',
    list: protocol + '/list',
    update: protocol + '/update',
    delete: protocol + '/delete',
    deleted: protocol + '/deleted',
    receive_invitation: protocol + '/receive-invitation',
    connected: protocol + '/connected'
  }
};

export const shared = {
  data: {
    connections: []
  },
  computed: {
    active_connections: function() {
        return Object.values(this.connections).filter(
          conn => {
            if (!("state" in conn)) {
              return false;
            }
            return conn.state === "active"
          }
        );
    },
    id_to_connection: function(connection_id) {
      let map = {};
      this.connections.forEach((connection) => {
        map[connection.connection_id] = connection;
      });
      return map;
    }
  },
  listeners: {
    [metadata.types.list]:
    (share, msg) => share.connections = msg.connections,
    [metadata.types.connection]:
    (share, msg) => share.fetch_connections(),
    [metadata.types.deleted]:
    (share, msg) => share.fetch_connections(),
    [metadata.types.connected]:
    (share, msg) => {
      share.fetch_connections();
      share.fetch_invitations_v1();
    },
  },
  methods: {
    fetch_connections: ({send}) => {
      send({
        "@type": metadata.types.get_list,
      });
    }
  }
};

export default {
  name: 'connections-new',
  components: {
    ConnectionList
  },
  mixins: [
    message_bus(),
    share({
      use: ['connections', 'active_connections', 'mediators', 'protocols'],
      actions: ['fetch_connections', 'fetch_mediators']
    })
  ],
  data: function() {
    return {
      invite_form: {
        invitation: '',
        mediation_id: '',
        auto_accept: true
      }
    }
  },
  created: async function() {
    await this.ready();
    this.fetch_connections();
    if (this.supports_mediation) {
      this.fetch_mediators();
    }
  },
  computed: {
    pending_connections: function() {
      return Object.values(this.connections).filter(
        conn => "state" in conn && conn.state == 'pending'
      );
    },
    failed_connections: function() {
      return Object.values(this.connections).filter(
        conn => "state" in conn && conn.state === "error"
      );
    },
    supports_mediation: function() {
      let list = this.protocols.map(p => p.pid);
      return list.includes(COORDINATE_MEDIATION)
    }
  },
  methods: {
    update_connection: function(form) {
      let query_msg = {
        "@type": metadata.types.update,
        "connection_id": form.connection_id,
        "label": form.label,
        "role": form.role,
      };
      this.send_message(query_msg);
    },
    delete_connection: function(connection) {
      let query_msg = {
        "@type": metadata.types.delete,
        "connection_id": connection.connection_id,
      };
      this.send_message(query_msg);
    },
    recieve_invitation: function() {
      let receive_invite_msg = {
        "@type": metadata.types.receive_invitation,
        ...this.invite_form
      };
      this.send_message(receive_invite_msg);
      this.invite_form.invitation = "";
      this.invite_form.mediation_id = "";
    },
    mediator_name: function(mediator) {
      let connection_label = 'Unknown';
      let matched_connection = this.active_connections.filter(
        c => c.connection_id == mediator.connection_id
      );
      if(matched_connection.length == 1){
        connection_label = matched_connection[0].label;
      }
      return connection_label;
    },
  },
}
</script>
