<template >
<el-row>
    <did-list
        name="did_list"
        title="Dids:"
        activeDid="activeDid()"
        v-bind:list="Object.values(dids)"
        v-on:did-update="updateAgentDid"
        v-on:did-activate="activateAgentDid"
        v-on:did-resolve="resolveDid">
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

export default {
  name: 'dids-tab',
  mixins: [
    message_bus(),
    share(['dids', 'public_did'])
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
    created: function(){
    this.$message_bus.$on(
        'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/1.0/list-dids',
        this.receivedAgentDids
    );
    this.$message_bus.$on(
        'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/1.0/did',
        this.updatedDid
    );
    this.$message_bus.$on(
        'activate-agent-did',
        this.activateAgentDid
    );
    this.$message_bus.$on('dids', this.onOpen);
    this.$message_bus.$on('agent-created', this.getAgentActivePublicDid);
    },
  methods: {

    onOpen: function(){
        console.log("dids clicked");
        this.getAgentDids();
    },
    async resolveDid(did){
      this.$message_bus.$emit('send-message', 
        {
            "@type": "",
            "did": did,
        }
      );
    },
    async getAgentDids(){
      this.$message_bus.$emit('send-message', {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/1.0/get-list-dids",
        "~transport": {
          "return_route": "all"
        }
      });
    },
    async createDid(){
      let msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/1.0/create-did",
        "~transport": {
          "return_route": "all"
        }
      }
      msg = this.did_form.did ? {...msg,"did":this.did_form.did} : msg
      msg = this.did_form.seed ? {...msg,"seed":this.did_form.seed} : msg
      msg = this.did_form.label ? {...msg, "metadata": {"label":this.did_form.label}} : msg
      this.$message_bus.$emit('send-message', msg);
    },
    async getAgentActivePublicDid(did){
        this.$message_bus.$emit('send-message', 
            {
                "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/1.0/get-public-did",
                "~transport": {
                    "return_route": "all"
                }
            }
        );
    },
    async activateAgentDid(did){
      this.$message_bus.$emit('send-message', 
      {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/1.0/set-public-did",
        "did": did.did,
        "~transport": {
          "return_route": "all"
        }
      });
    },
    async updateAgentDid(editForm){
      this.$message_bus.$emit('send-message', {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/1.0/set-did-metadata",
        "did": editForm.did,
        "metadata": { 
          ...editForm.metadata,
          'label':editForm.label,
          'permission':editForm.permission,
        },
        "~transport": {
          "return_route": "all"
        }
      });
    },
    async receivedAgentDids(msg){
      const dids = msg.result.reduce(function(acc, cur, i) {
        acc[cur.did] = cur;
        return acc;
      }, {});
      this.dids = dids
      this.didsUpdateForm = dids
    },
    async updatedDid(msg){
      if ('result' in msg &&
        'did' in msg.result) {
        this.dids[msg.result.did] = msg.result
        this.did_form.did = ""
        this.did_form.seed = ""
        this.did_form.label = ""
        this.didsUpdateForm = this.dids
        //if "public" in info.metadata and info.metadata["public"] is True:
        if('metadata' in msg.result && 
          'public' in msg.result.metadata && 
          msg.result.metadata.public === true){
              //TODO: remove public from metadata of previous public_did
          this.public_did = msg.result.did
          this.active_ledger_selector.did = this.public_did
        }
        this.getAgentDids()
      }
    },
  },
}
</script>
