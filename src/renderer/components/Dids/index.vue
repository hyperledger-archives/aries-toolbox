<template >
  <el-row>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <a class="navbar-brand" href="#">DIDs</a>
    <el-button
      type="primary"
      icon="el-icon-refresh"
      @click="fetch_dids"></el-button>
  </nav>
  <el-collapse>
    <ul class="list">
      <el-collapse-item
        v-for="did in dids"
        v-bind:title="did.did"
        :name="did.did"
        :key="did.did">
        <el-row :key="did.did">
          <p>Verification Key: {{did.verkey}}</p>
          <p>DID: {{did.did}}</p>
          <el-button type="primary" @click="updateAgentDid(did)">Update DID</el-button>
          <el-button type="primary" @click="activate_did(did)">Activate DID</el-button>
          <div>
            <vue-json-pretty
              :deep=0
              :data="did">
            </vue-json-pretty>
          </div>
        </el-row>
      </el-collapse-item>
    </ul>
  </el-collapse>

  <el-divider></el-divider>

  <p>Create a DID:</p>
  <el-form :inline="false" label-width="120px">
    <link rel="shortcut icon" href="/static"/>
    <el-form-item label="DID:">
      <el-input v-model="did_form.alias" style="width:200px;"> </el-input>
      <i>Your new public DID.</i>
    </el-form-item>
    <el-form-item label="Seed:">
      <el-input v-model="did_form.label" style="width:200px;"> </el-input>
      <i>Seed for this DID.</i>
    </el-form-item>
    <el-form-item label="Alias:">
      <el-input v-model="did_form.group" style="width:200px;"> </el-input>
      <i>Alias used in your DID.</i>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="createDid()">Create DID</el-button>
    </el-form-item>
  </el-form>
  </el-row>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';
import DidList from './DidList.vue';
import message_bus from '../../message_bus.js';
import share from '../../share.js';

export const metadata = {
  menu: {
    label: 'DIDs',
    icon: 'el-icon-link',
    group: 'Agent to Agent',
    priority: 10,
    required_protocols: [
      'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/0.1'
    ]
  }
};

export const shared = {
  data: {
    dids: [],
    public_did: ''
  },
  listeners: {
    'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/0.1/list-dids':
    (share, msg) => {
      share.dids = msg.result;
    },
    'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/0.1/did': (share, msg) => {
      share.fetch_dids();
    },
    'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/0.1/public-did': (share, msg) => {
      if(typeof msg.result !== "undefined") {
        share.public_did = msg.result.did;
        share.fetch_dids();
      } else {
        console.warn("No Public DID found");
      }
    }
  },
  methods: {
    fetch_dids: ({send}) => {
      send({"@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/0.1/get-list-dids"});
    },
    activate_did: ({send}, did) => {
      send({
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/0.1/set-public-did",
        "did": did.did,
      });
    },
    fetch_active_did: ({send}) => {
      send({"@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/0.1/get-public-did"});
    },
  }
};

export default {
  name: 'dids',
  mixins: [
    message_bus({
      events: {
        'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/0.1/did':
        (v, msg) => {
          if ('result' in msg &&
            'did' in msg.result) {
            v.did_form.did = ""
            v.did_form.seed = ""
            v.did_form.label = ""
          }
        }
      }
    }),
    share({
      use: ['dids', 'public_did'],
      actions: ['fetch_dids', 'activate_did', 'fetch_active_did']
    })
  ],
  components: {
    VueJsonPretty,
    DidList,
  },
  data () {
    return {
      did_form:{
        did:'',
        seed:'',
        label:'',
        metadata:'',
      },
      active_ledger_selector:{
        leger:'',
      },
    }
  },
  created: async function(){
    await this.ready();
    this.fetch_dids();
    this.fetch_active_did();
    this.$message_bus.$emit('entered_taa_required_module');
  },
  methods: {
    async createDid(){
      let msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/0.1/create-did",
      };
      if (this.did_form.did) {
        msg.did = this.did_form.did;
      }
      if (this.did_form.seed) {
        msg.seed = this.did_form.seed;
      }
      if (this.did_form.label) {
        msg.metadata = { "label": this.did_form.label };
      }
      this.send_message(msg);
    },
    async updateAgentDid(editForm){
      this.send_message({
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/0.1/set-did-metadata",
        "did": editForm.did,
        "metadata": {
          ...editForm.metadata,
          'label':editForm.label,
          'permission': editForm.permission,
        },
      });
    },
  },
}
</script>
