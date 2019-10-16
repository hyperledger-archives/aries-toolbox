<template >
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">{{ title }}</a>
      <el-button
        type="primary"
        icon="el-icon-plus"
        @click="issueFormActive = true">Issue</el-button>
      <el-button
        type="primary"
        icon="el-icon-refresh"
        @click="$emit('issue-cred-refresh',)"></el-button>
    </nav>
    <el-collapse v-model="expanded_items">
      <ul class="list">
        <el-collapse-item
          v-if="list.length"
          v-for="issued_credential in list"
          v-bind:title="connection_map[issued_credential.connection_id].their_label + ' ' + issued_credential.credential_definition_id"
          :name="issued_credential.credential_definition_id"
          :key="issued_credential.creential_definition_idd">
          <el-row>
            <div>
              <vue-json-pretty
                :deep=1
                :data="issued_credential">
              </vue-json-pretty>
            </div>
            <el-button v-on:click="collapse_expanded(issued_credential)">^</el-button>
          </el-row>
        </el-collapse-item>
      </ul>
    </el-collapse>
    <el-dialog title="Issue Credential" :visible.sync="issueFormActive">
      <el-form :model="issueForm">
        <el-form-item label="Connection:" :label-width="formLabelWidth">
          <el-select
            v-model="issueForm.connection_id"
            filterable
            placeholder="Connection">
            <el-option
              v-for="connection in connections"
              :key="connection.connection_id"
              :label="connection.their_label"
              :value="connection.connection_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Credential Definition:" :label-width="formLabelWidth">
          <el-select
            v-model="issueForm.selected_cred_def"
            remote
            placeholder="Credential Definition"
            @change="update_attributes">
            <el-option
              v-for="cred_def in cred_defs"
              :key="cred_def.cred_def_id"
              :label="cred_def.cred_def_id"
              :value="cred_def">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="Comment (optional)"
          :label-width="formLabelWidth">
          <el-input
            v-model="issueForm.comment"
            type="textarea"></el-input>
        </el-form-item>
        <el-form-item
          v-for="attribute in issueForm.attributes"
          :label="attribute.name"
          :label-width="formLabelWidth"
          :key="attribute.name">
          <el-input
            v-model="attribute.value"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="issueFormActive = false">Cancel</el-button>
        <el-button type="primary" @click="issue">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';

export default {
  name: 'agent-issue-cred-list',
  props: ['title', 'list', 'editable', 'connections', 'cred_defs'],
  components: {
    VueJsonPretty,
  },
  data () {
    return {
      expanded_items:[],
      issueFormActive: false,
      issueForm: {
        connection_id: '',
        selected_cred_def: null,
        comment: '',
        attributes: []
      },
      retrieve_cred_def_id: '',
      formLabelWidth: '200px'
    }
  },
  computed: {
    connection_map: function() {
      let map =  this.connections.reduce((acc, item) => {
        acc[item.connection_id] = item;
        return acc;
      }, {});
      console.log(map);
      return map;
    }
  },
  methods: {
    collapse_expanded: function(creddef) {
      this.expanded_items = this.expanded_items.filter(
        item => item != creddef.cred_def_id
      );
    },
    issue: function() {
      let values = {
        connection_id: this.issueForm.connection_id,
        credential_definition_id: this.issueForm.selected_cred_def.cred_def_id,
        comment: this.issueForm.comment,
        attributes: this.issueForm.attributes,
      }
      this.issueForm.connection_id = '';
      this.issueForm.selected_cred_def = null;
      this.issueForm.comment = '';
      this.issueForm.attributes = [];

      this.$emit('issue', values);
      this.issueFormActive = false;
    },
    update_attributes: function(cred_def) {
      var comp = this;
      cred_def.attributes.forEach(name => {
        comp.issueForm.attributes.push({
          name: name,
          value: ''
        });
      });
    },
  }
}
</script>
