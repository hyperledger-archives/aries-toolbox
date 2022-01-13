<template >
  <div v-if="list.length">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">{{ title }}</a>
      <el-button
        type="primary"
        icon="el-icon-refresh"
        @click="$emit('refresh',)"></el-button>
    </nav>
    <el-collapse v-model="expanded_items">
      <ul class="list">
        <el-collapse-item
          v-for="(connection) in list"
          v-bind:title="get_name(connection)"
          :name="connection.connection_id"
          :key="title+connection.connection_id">
          <el-row :key="connection.connection">
            <p>Connected to: {{connection.label}}</p>
            <p>Connection ID: {{connection.connection_id}}</p>
            <p>My DID: {{connection.my_did}}</p>
            <p>Their DID: {{connection.their_did}}</p>
            <div>
              <vue-json-pretty
                :deep=0
                :data="connection">
              </vue-json-pretty>
            </div>
            <template v-if="editable">
              <el-button @click="edit(connection)">Edit</el-button>
            </template>
            <el-button type="danger" @click="delete_conn(connection)">Delete</el-button>
            <el-button v-on:click="collapse_expanded(connection)">^</el-button>
          </el-row>
        </el-collapse-item>
      </ul>
    </el-collapse>
    <el-dialog title="Edit Connection" :visible.sync="editFormActive">
      <el-form :model="editForm">
        <el-form-item label="Role:" :label-width="formLabelWidth">
          <el-input v-model="editForm.role" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="Label:" :label-width="formLabelWidth">
          <el-input v-model="editForm.label" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editFormActive = false">Cancel</el-button>
        <el-button type="primary" @click="update">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';

export default {
  name: 'connection-list',
  props: ['title', 'list','editable'],
  components: {
    VueJsonPretty,
  },
  data () {
    return {
      expanded_items:[],
      editFormActive: false,
      editForm: {
        connection_id: '',
        role: '',
        label: '',
      },
      formLabelWidth: '100px'
    }
  },
  methods: {
    get_name: function(connection) {
      if('their_label' in connection) {
        return connection.their_label;
      };
      return connection.connection_id;
    },
    edit: function (connection) {
      this.editForm.connection_id = connection.connection_id;
      this.editForm.role = connection.their_role;
      this.editForm.label = connection.their_label;
      this.editFormActive = true;
    },
    update: function() {
      this.editFormActive = false;
      this.$emit('connection-editted', this.editForm);
    },
    delete_conn: function (connection) {
      this.$emit('connection-deleted', connection);
    },
    collapse_expanded: function(connection){
      this.expanded_items = this.expanded_items.filter(
        item => item != connection.connection_id
      );
    },
  }
}
</script>
