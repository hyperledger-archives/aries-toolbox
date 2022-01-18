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
          :key="connection.connection">
          <el-row :key="connection.connection">
            <ul>
              <li><strong>Connected to:</strong> {{connection.label}} ({{connection.connection_id}})</li>
              <li><strong>State:</strong> {{connection.state}}</li>
              <li><strong>My DID:</strong> {{connection.my_did}}</li>
              <li><strong>Their DID:</strong> {{connection.their_did}}</li>
            </ul>
            <div>
              <vue-json-pretty
                :deep=0
                :deepCollapseChildren="true"
                :data="connection.raw_repr">
              </vue-json-pretty>
            </div>
            <template v-if="editable">
              <el-button @click="edit(connection)">Edit</el-button>
            </template>
            <el-button type="danger" @click="delete_conn(connection)">Delete</el-button>
            <el-button v-on:click="collapse_expanded(connection)"><i class="el-icon-arrow-up"></i></el-button>
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
      if('label' in connection) {
        return connection.label;
      };
      return connection.connection_id;
    },
    edit: function (connection) {
      this.editForm.connection_id = connection.connection_id;
      this.editForm.role = connection.their_role;
      this.editForm.label = connection.label;
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
