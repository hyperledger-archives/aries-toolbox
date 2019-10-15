<template >
  <div >
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">{{ title }}</a>
      <el-form>
        <!-- <el-button
          type="primary"
          icon="el-icon-plus"
          @click="createFormActive = true">send proposal</el-button> -->
      </el-form>
    </nav>
    <div v-if="true">
    <el-collapse v-model="expanded_items">
      <ul class="list">
        <el-collapse-item
          v-for="credential in [credentials]"
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
  </div>
    <credential-list
                title="credentials:"
                v-bind:list="credentials"></credential-list>
    <credential-list
                title="Offers:"
                v-bind:list="offer_received_credentials"></credential-list>
    <credential-list
                title="Requests:"
                v-bind:list="sent_request_credentials"></credential-list>
    <!-- <credential-list
                title="Received:"
                v-bind:list="received_credentials"> -->
    <credential-list
                title="Issued:"
                v-bind:list="issued_credentials"></credential-list>
  </div>
</template>

<script>
import AgentCredentialList from './AgentCredentialList.vue'
import VueJsonPretty from 'vue-json-pretty';

export default {
  name: 'agent-my-credentials-list',
  props: [
    'title',
    'editable',
    'credentials',
    'offer_received_credentials',
    'sent_request_credentials',
    'received_credentials',
    'issued_credentials',
    'sent_proposals',
    'received_proposals',
    'sent_requests',
    'received_requests',
    'sent_presentations',
    'received_presentations',
    'verified_presentations'
    ],
  components: {
    VueJsonPretty,
    AgentCredentialList,
  },
  data () {
    return {
      expanded_items:[],
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
  }
}
</script>
