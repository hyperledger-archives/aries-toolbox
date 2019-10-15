<template >
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">{{ title }}</a>
      <el-button
        type="primary"
        icon="el-icon-plus"
        @click="proposalFormActive = true">Send Credential Proposal</el-button>
    </nav>
    <el-collapse v-model="expanded_items">
      <ul class="list">
        <el-collapse-item
          v-for="credential in storedStateCredentials"
          v-bind:title="credential.credential_exchange_id"
          :name="credential.credential_exchange_id"
          :key="credential.credential_exchange_id">
          <el-row>
            <div>
              <vue-json-pretty
                :deep=1
                :data="credential">
              </vue-json-pretty>
            </div>
            <el-button v-on:click="collapse_expanded(credential)">^</el-button>
          </el-row>
        </el-collapse-item>
      </ul>
    </el-collapse>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">Offers</a>
      <el-button
        type="primary"
        icon="el-icon-plus"
        @click="offerFormActive = true">Accept Offer</el-button>
    </nav>
    <el-collapse v-model="expanded_items">
      <ul class="list">
        <el-collapse-item
          v-for="credential in offerReceivedStateCredentials"
          v-bind:title="credential.credential_exchange_id"
          :name="credential.credential_exchange_id"
          :key="credential.credential_exchange_id">
          <el-row>
            <div>
              <vue-json-pretty
                :deep=1
                :data="credential">
              </vue-json-pretty>
            </div>
            <el-button v-on:click="collapse_expanded(credential)">^</el-button>
          </el-row>
        </el-collapse-item>
      </ul>
    </el-collapse>
    <!-- <el-dialog title="Issue Credential" :visible.sync="proposalFormActive">
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
            filterable
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
    </el-dialog> -->
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';

export default {
  name: 'agent-my-credentials-list',
  props: [
    'title',
    'editable',
    'credentials'
    ],
  components: {
    VueJsonPretty,
  },
  data () {
    return {
      expanded_items:[],
      proposalFormActive:'',
      offerFormActive:'',
      createFormActive: false,
      createForm: {
        name: '',
        version: '',
        attributes: [],
      },
      formLabelWidth: '100px'
    }
  },
  methods: {
    collapse_expanded: function(schema){
      this.expanded_items = this.expanded_items.filter(
        item => item != schema.schema_id
      );
    },
    /* add_attribute: function() {
      this.createForm.attributes.push('');
    },
    remove_attribute: function(index) {
      this.createForm.attributes.splice(index, 1);
    },
    create: function() {
      let values = {
        name: this.createForm.name,
        version: this.createForm.version,
        attributes: this.createForm.attributes
      }
      this.createForm.name = '';
      this.createForm.version = '';
      this.createForm.attributes = [];
      this.$emit('schema-send', values);
    } */
  },computed:{
    offerReceivedStateCredentials(){
      return this.credentials.filter(cred => "state" in cred && cred.state === "offer_received")
    },
    sentRequestStateCredentials(){
      return this.credentials.filter(cred => "state" in cred && cred.state === "request_sent")
    },
    receivedStateCredentials(){
      return this.credentials.filter(
        cred => 
          "state" in cred && 
          cred.state === "credential_received" &&
          cred.state === "stored"
      )
    },
    storedStateCredentials(){
      return this.credentials.filter(cred => "state" in cred && cred.state === "stored")
    },
  }
}
</script>
