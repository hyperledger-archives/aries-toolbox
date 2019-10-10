<template v-if="list.length">
  <div>
    <p>{{ title }}</p>
    <el-collapse v-model="exspanded_active_connection_items">
      <div v-for="(connection, index) in list"><!-- - Connections (state == active) -->
        <el-collapse-item v-bind:title="connection[itemlabel]" :name="connection.connection_id">
          <el-row>
            <div>
              <vue-json-pretty
                :deep=1
                :data="connection">
              </vue-json-pretty>
            </div>
            <el-button @click="edit(index)">Edit</el-button>
          </el-row>
        </el-collapse-item>
      </div>
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
  props: ['title', 'list', 'itemlabel'],
  components: {
    VueJsonPretty,
  },
  data () {
    return {
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
    edit: function (index) {
      let connection = this.list[index];
      this.editForm.connection_id = connection.connection_id;
      this.editForm.role = connection.their_role;
      this.editForm.label = connection.their_label;
      this.editFormActive = true;
    },
    update: async function() {
      this.editFormActive = false;
      this.$emit('connection-editted', editForm);
    }
  }
}
</script>
