<template >
  <div v-if="list.length">
    <p>{{ title }}</p>
    <el-collapse v-model="expanded_items">
      <ul class="list">
        <el-collapse-item
          v-for="schema in list"
          v-bind:title="schema.schema_name+' '+schema.schema_version"
          :name="schema.schema_id"
          :key="schema.schema_id">
          <el-row>
            <div>
              <vue-json-pretty
                :deep=1
                :data="schema">
              </vue-json-pretty>
            </div>
            <template v-if="editable">
              <el-button @click="edit(schema)">Edit</el-button>
            </template>
            <el-button type="danger" @click="delete_conn(schema)">Delete</el-button>
            <el-button v-on:click="collapse_expanded(schema)">^</el-button>
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
  name: 'agent-schema-list',
  props: ['title', 'list','editable'],
  components: {
    VueJsonPretty,
  },
  data () {
    return {
      expanded_items:[],
      editFormActive: false,
      editForm: {
        schema_id: '',
        name: '',
        version: '',
        attributes: [],
      },
      formLabelWidth: '100px'
    }
  },
  methods: {
    edit: function (schema) {
      this.editForm.schema_id = schema.schema_id;
      this.editForm.name = schema.name;
      this.editForm.version = schema.version;
      this.editForm.attributes = schema.attributes;
      this.editFormActive = true;
    },
    update: function() {
      this.editFormActive = false;
      this.$emit('connection-editted', this.editForm);
    },
    collapse_expanded: function(schema){
      this.expanded_items = this.expanded_items.filter(
        item => item != schema.schema_id
      );
    },
  }
}
</script>
