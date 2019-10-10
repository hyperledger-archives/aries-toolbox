<template >
  <div v-if="list.length">
    <p>{{ title }}</p>
    <el-collapse v-model="exspanded_active_connection_item">
      <ul class="list">
        <el-collapse-item v-for="(connection, index) in list" 
        v-bind:title="get_name(connection)" 
        :name="get_name(connection)" 
        :key="connection.connection_id">
          <el-row>
            <div>
              <vue-json-pretty
                :deep=1
                :data="connection">
              </vue-json-pretty>
            </div>
            <template v-if="editable">
            <el-button @click="edit(index)">Edit</el-button>
            </template>
            <el-button type="danger" @click="delete_conn(index)">Delete</el-button>
            <el-button v-on:click="collapse_expanded_connection(index)">^</el-button>
            
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
  name: 'agent-connection-list',
  props: ['title', 'list','editable'],
  components: {
    VueJsonPretty,
  },
  data () {
    return {
      exspanded_active_connection_item:[],
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
    edit: function (index) {
      let connection = this.list[index];
      this.editForm.connection_id = connection.connection_id;
      this.editForm.role = connection.their_role;
      this.editForm.label = connection.their_label;
      this.editFormActive = true;
    },
    update: function() {
      this.editFormActive = false;
      this.$emit('connection-editted', this.editForm);
    },
    delete_conn: function (index) {
      let connection = this.list[index];
      this.$emit('connection-deleted', connection);
    },
    collapse_expanded_connection(index){
      this.exspanded_active_connection_item.splice(index, 1);
    }, 
  }
}
</script>
