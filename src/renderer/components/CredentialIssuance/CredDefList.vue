<template >
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">{{ title }}</a>
      <el-input
        v-if="retrievable"
        v-model="retrieve_cred_def_id"
        style="width: 300px;">
        <el-button
          slot="append"
          icon="el-icon-search"
          @click="get_cred_def">Retrieve</el-button>
      </el-input>
      <el-button
        v-if="can_create && list"
        type="primary"
        icon="el-icon-plus"
      @click="createFormActive = true">Create</el-button>
      <el-button
        type="primary"
        icon="el-icon-refresh"
        @click="$emit('cred-def-refresh',)"></el-button>
    </nav>
    <el-collapse v-model="expanded_items">
      <ul class="list">
        <el-collapse-item
          v-for="creddef in list"
          v-bind:title="creddef.cred_def_id"
          :name="creddef.cred_def_id"
          :key="creddef.cred_def_id">
          <el-row>
            <div>
              <vue-json-pretty
                :deep=1
                :data="creddef">
              </vue-json-pretty>
            </div>
            <el-button v-on:click="collapse_expanded(creddef)">^</el-button>
          </el-row>
        </el-collapse-item>
      </ul>
    </el-collapse>
    <el-dialog title="Create New Credential Definition" :visible.sync="createFormActive" @close="deactivate()">
      <el-form :model="createForm">
        <el-form-item label="Schema:" :label-width="formLabelWidth">
          <el-select
            v-model="createForm.schema_id"
            filterable
            value-key="createForm.schema_id"
            placeholder="Select">
            <el-option
              v-for="schema in schemas"
              :key="schema.schema_id"
              :label="schema.schema_name +' '+ schema.schema_version"
              :value="schema.schema_id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deactivate()">Cancel</el-button>
        <el-button type="primary" @click="publish_cred_def">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';
import message_bus from '../../message_bus.js';
import share from '../../share.js';

export default {
  name: 'cred-def-list',
  props: [
    'retrievable',
    'title',
    'list',
    'can_create',
  ],
  mixins: [
    message_bus({
      events: {
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-credential-definitions/1.0/credential-definition-id":
        (v, msg) => setTimeout(v.get_cred_def_list, 4500),
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-credential-definitions/1.0/credential-definition":
        (v, msg) => setTimeout(v.get_cred_def_list, 4500),
        "cred_defs": (v) => v.get_cred_def_list()
      }
    }),
    share({
      use: [
        'schemas',
        'cred_defs'
      ],
      events: {
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-credential-definitions/1.0/credential-definition-list":
        (share, msg) => share.cred_defs = msg.results
      }
    })
  ],
  components: {
    VueJsonPretty,
  },
  data () {
    return {
      expanded_items:[],
      createFormActive: false,
      createForm: {
        schema_id: ''
      },
      retrieve_cred_def_id: '',
      formLabelWidth: '100px'
    }
  },
  methods: {
    publish_cred_def: function(form) {
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-credential-definitions/1.0/send-credential-definition",
        "schema_id": this.createForm.schema_id,
      };
      this.send_message(query_msg);
      this.createFormActive = false;
      this.createForm.schema_id = '';
    },
    get_cred_def: function() {
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-credential-definitions/1.0/credential-definition-get",
        "cred_def_id": this.retrieve_cred_def_id,
      };
      this.send_message(query_msg);
      this.retrieve_cred_def_id = '';
    },
    get_cred_def_list: function() {
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-credential-definitions/1.0/credential-definition-get-list",
      };
      this.send_message(query_msg);
    },

    collapse_expanded: function(creddef){
      this.expanded_items = this.expanded_items.filter(
        item => item != creddef.cred_def_id
      );
    },
    deactivate: function() {
      this.createFormActive = false;
      this.createForm.schema_id = '';
    },
  }
}
</script>
