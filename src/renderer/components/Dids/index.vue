<template >
  <el-row>
    <did-list
      name="did_list"
      title="DIDs:"
      activeDid="public_did"
      :list="dids"
      @did-update="updateAgentDid"
      @did-activate="activate_did">
    </did-list>
  <p>Create a Did:</p>
  <el-form :model=did_form>
    <div>
      <span slot="label">Did:</span>
      <el-input v-model="did_form.did" style="width:100px;"> </el-input>
      <span slot="label">Seed:</span>
      <el-input v-model="did_form.seed" style="width:100px;"> </el-input>
      <span slot="label">Alias:</span>
      <el-input v-model="did_form.label" style="width:100px;"> </el-input>
    </div>
    <div>
      <el-button type="primary" @click="createDid()">Create DID</el-button>
    </div>
    <link rel="shortcut icon" href="/static"/>
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
      'https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-dids/0.1'
    ]
  }
};

export const shared = {
  data: {
    dids: [],
    public_did: ''
  },
  listeners: {
    'https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-dids/0.1/list-dids':
    (share, msg) => {
      share.dids = msg.result;
      let public_did = share.dids.find(
        item => 'metadata' in item && 'public' in item.metadata && item.metadata.public
      );
      if (public_did) {
        share.public_did = public_did.did;
      }
    },
    'https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-dids/0.1/did': (share, msg) => {
      if(msg.result && 'metadata' in msg.result && 'public' in msg.result.metadata && msg.result.metadata.public === true) {
        share.public_did = msg.result.did;
      }
      share.fetch_dids();
    }
  },
  methods: {
    fetch_dids: ({send}) => {
      send({"@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-dids/0.1/get-list-dids"});
    },
    activate_did: ({send}, did) => {
      send({
        "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-dids/0.1/set-public-did",
        "did": did.did,
      });
    },
    fetch_active_did: ({send}) => {
      send({"@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-dids/0.1/get-public-did"});
    },
  }
};

export default {
  name: 'dids',
  mixins: [
    message_bus({
      events: {
        'https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-dids/0.1/did':
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
        "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-dids/0.1/create-did",
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
        "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-dids/0.1/set-did-metadata",
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
