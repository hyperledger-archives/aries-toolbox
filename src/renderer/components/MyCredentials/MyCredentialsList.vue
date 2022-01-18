<template >
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">{{ title }}</a>
      <el-button
        type="primary"
        icon="el-icon-plus"
        @click="proposalFormActive = true">Send Credential Proposal</el-button>
      <el-button
        type="primary"
        icon="el-icon-refresh"
        @click="$emit('cred-refresh',)"></el-button>
    </nav>
    <el-collapse v-model="expanded_items">
      <ul class="list">
        <el-collapse-item
          v-for="credential in credentials"
          v-bind:title="credential_title(credential)"
          :name="credential.cred_def_id"
          :key="credential.cred_def_id">
          <el-row>
            <ul>
              <li><strong>State:</strong> {{credential.state}}</li>
              <li><strong>Credential Definition ID:</strong> {{credential.credential_definition_id}}</li>
              <li><strong>Schema ID:</strong> {{credential.credential.schema_id}}</li>
              <li><strong>Created:</strong> {{credential.created_at}}</li>
              <li><strong>Attributes:</strong>
                <attributes
                  class="received-attrs"
                  :values="Object.keys(credential.credential.attrs).map(item => ({name: item, value: credential.credential.attrs[item]}))"
                ></attributes>
              </li>
            </ul>
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
    <nav
      v-if="offerReceivedStateCredentials.length"
      class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">Offers</a>
      <!-- <el-button
        type="primary"
        icon="el-icon-plus"
        @click="offerFormActive = true">Accept Offer</el-button> -->
    </nav>
    <el-collapse
      v-model="expanded_items">
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
    <el-dialog title="Propose Credential" :visible.sync="proposalFormActive" @close="deActivateForm()">
      <el-form :model="proposalForm">
        <el-form-item label="Connection:" :label-width="formLabelWidth">
          <el-select
            v-model="proposalForm.connection_id"
            filterable
            value-key="proposalForm.connection_id"
            placeholder="Select">
            <el-option
              v-for="connection in connections"
              :key="connection.connection_id"
              :label="connection.label"
              :value="connection.connection_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Credential Definition:" :label-width="formLabelWidth">
          <el-select
            v-model="proposalForm.selected_cred_def"
            filterable
            value-key="proposalForm.selected_cred_def"
            placeholder="Select"
            :disabled="!proposalForm.connection_id"
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
            v-model="proposalForm.comment"
            type="textarea"></el-input>
        </el-form-item>
        <el-form-item
          v-for="attribute in proposalForm.attributes"
          :label="attribute.name"
          :label-width="formLabelWidth"
          :key="attribute.name">
          <el-input
            v-model="attribute.value"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deActivateForm()">Cancel</el-button>
        <el-button :disabled="!proposalForm.selected_cred_def" type="primary" @click="propose">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<style>
.received-attrs {
  margin-left: 2em;
}
</style>
<script>
import VueJsonPretty from 'vue-json-pretty';
import share from '@/share.js';
import Attributes from '../CredentialIssuance/Attributes.vue';

export default {
  name: 'my-credentials-list',
  props: [
    'title',
    'editable',
    'list',
    'connections',
    'cred_defs'
    ],
  mixins: [share({use: ['id_to_connection']})],
  components: {
    VueJsonPretty,
    Attributes,
  },
  data () {
    return {
      expanded_items:[],
      proposalFormActive: false,
      proposalForm: {
        connection_id: '',
        selected_cred_def: null,
        comment: '',
        attributes: []
      },
      formLabelWidth: '200px'
    }
  },
  methods: {
    collapse_expanded: function(credential){
      this.expanded_items = this.expanded_items.filter(
        item => item != credential.credential_exchange_id
      );
    },
    deActivateForm: function() {
      this.proposalFormActive = false;
      this.proposalForm = {
        connection_id: '',
        selected_cred_def: null,
        comment: '',
        attributes: []
      };
    },
    propose: function() {
      let values = {
        connection_id: this.proposalForm.connection_id,
        cred_def_id: this.proposalForm.selected_cred_def.cred_def_id,
        comment: this.proposalForm.comment,
        attributes: this.proposalForm.attributes,
      }
      this.proposalForm.connection_id = '';
      this.proposalForm.selected_cred_def = {};
      this.proposalForm.comment = '';
      this.proposalForm.attributes = [];

      this.$emit('propose', values);
      this.proposalFormActive = false;
    },
    update_attributes: function(cred_def) {
      var comp = this;
      comp.proposalForm.attributes = [];
      cred_def.attributes.forEach(name => {
        comp.proposalForm.attributes.push({
          name: name,
          value: ''
        });
      });
    },
    credential_title: function(cred) {
      let split = cred.schema_id.split(':');
      let connection_name = '';
      if (!cred.connection) {
        connection_name = '[deleted]';
      } else {
        connection_name = cred.connection.label;
      }
      return `${split[2]} v${split[3]} received from ${connection_name}`;
    }
  },
  computed: {
    credentials: function() {
      return this.list.map(item => {
        if (item.connection_id in this.id_to_connection) {
          item.connection = this.id_to_connection[item.connection_id];
        } else {
          item.connection = null;
        }
        return item;
      });
    },
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
          cred.state === "credential_received" ||
          cred.state === "stored" ||
          cred.state === "credential_acked"
      )
    },
    storedStateCredentials(){
      return this.credentials.filter(cred => "state" in cred && cred.state === "stored")
    },
  }
}
</script>
