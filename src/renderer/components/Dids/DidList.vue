<template >
  <el-row>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <a class="navbar-brand" href="#">{{ title }}</a>
    <el-button
      type="primary"
      icon="el-icon-refresh"
      @click="fetch_dids"></el-button>
  </nav>
  <div v-if="list.length">
    <el-collapse v-model="expanded_items">
      <ul class="list">
        <el-collapse-item
          v-for="did in list"
          v-bind:title="get_name(did)"
          :name="did.did"
          :key="did.did">
          <el-row :key="did.did">
            <div>
              <vue-json-pretty
                :deep=2
                :data="did">
              </vue-json-pretty>
            </div>
            <template v-if="editable">
              <el-button @click="edit(did)">Edit</el-button>
            </template>
            <!-- <el-button type="danger" @click="delete_did(did)">Delete</el-button> -->
            <!-- <el-button v-if="activeDid" v-on:click="publish(did)">Publish</el-button> -->
            <el-button type="primary" @click="edit(did)">Edit</el-button>
            <el-button
              v-if="!('metadata' in did &&
                    'public' in did.metadata &&
                    did.metadata.public)"
              v-on:click="activate(did)"
              type="primary"
              >Activate</el-button>
            <!-- <el-button v-on:click="resolve(did)">read permissions</el-button> -->
            <!-- <el-button v-on:click="collapse_expanded(did)">^</el-button> -->
          </el-row>
        </el-collapse-item>
      </ul>
    </el-collapse>
    <el-dialog title="Edit did attributes" :visible.sync="editFormActive">
      <el-form :model="editForm">
        <el-form-item label="Label:" :label-width="formLabelWidth">
          <el-input v-model="editForm.label" autocomplete="off"></el-input>
        </el-form-item>
        <!-- <el-form-item label="permission:" :label-width="formLabelWidth">
          <el-input v-model="editForm.permission" autocomplete="off"></el-input>
        </el-form-item> -->
        <!-- <el-form-item label="public:" :label-width="formLabelWidth">
          <el-input v-model="editForm.permission" autocomplete="off"></el-input>
        </el-form-item> -->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editFormActive = false">Cancel</el-button>
        <el-button type="primary" @click="update">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
  </el-row>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';

export default {
  name: 'did-list',
  props: ['title', 'list','editable'],
  components: {
    VueJsonPretty,
  },
  data () {
    return {
      expanded_items:[],
      editFormActive: false,
      editForm: {
        did: '',
        verkey: '',
        metadata: {},
        label:'',
        //permission:'',
      },
      formLabelWidth: '100px'
    }
  },
  methods: {
    get_name: function(did) {
      if('metadata'in did && 'label' in did.metadata) {
        return `${did.metadata.label}: ${did.did}`;
      };
      return 'DID: ' + did.did + ', Verkey: ' + did.verkey;
    },
    edit: function (did) {
      this.editForm.did = did.did;
      this.editForm.verkey = did.verkey
      this.editForm.metadata = did.metadata
      //this.editForm.public = did.public
      this.editForm.permissions = did.permissions
      this.editFormActive = true
    },
    fetch_dids: function() {
      this.$emit('fetch-dids');
    },
    update: function() {
      this.editFormActive = false;
      this.$emit('did-update', this.editForm);
    },
    activate: function(did) {
      this.$emit('did-activate', did);
    },
    publish: function(did) {
      this.$emit('did-publish', did);
    },
    resolve: function(did) {
      this.$emit('did-resolve', did);
    },
    /* delete_did: function (connection) {
      this.$emit('did-deleted', connection);
    }, */
    collapse_expanded: function(did){
      this.expanded_items = this.expanded_items.filter(
        item => item != did.did
      );
    },
  },
  watch: {
    list: {
      handler: function(newValue) {
          //console.log("dids modified")
      },
      deep: true
    }
  },
}
</script>
