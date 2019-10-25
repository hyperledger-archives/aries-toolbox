<template >
    <el-row>
        <agent-did-list
            title="Dids:"
            activeDid="activeDid()"
            v-bind:list="Object.values(dids)"
            v-on:did-update="updateAgentDid"
            v-on:did-activate="activateAgentDid"
            v-on:did-resolve="resolveTrustedIssuer">
        </agent-did-list>
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
</template >

<script>
import VueJsonPretty from 'vue-json-pretty';

export default {
  name: 'dids-tab',
  components: {
    VueJsonPretty,
  },
  data () {
    return {
        bus: this.$message_bus[this.$route.params.agentid],    
        dids:{},
        did_form:{
            did:'',
            seed:'',
            label:'',
            metadata:'',
      },
    }
  },
  methods: {
    async getAgentDids(){
      this.connection.send_message( {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/1.0/get-list-dids",
        "~transport": {
          "return_route": "all"
        }
      })
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
      this.connection.send_message(msg)
    },
    async getAgentActivePublicDid(did){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/1.0/get-public-did",
        "~transport": {
          "return_route": "all"
        }
      }
      this.connection.send_message(query_msg);
    },
    async activateAgentDid(did){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/1.0/set-public-did",
        "did": did.did,
        "~transport": {
          "return_route": "all"
        }
      }
      this.connection.send_message(query_msg);
    },
    async updateAgentDid(editForm){
      let query_msg = {
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
      }
      this.connection.send_message(query_msg);
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
          this.public_did = msg.result.did
          this.active_ledger_selector.did = this.public_did
        }
        this.getAgentDids()
      }
    },
  }
}
</script>





<!--             //=============================== Dids =================================================
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/1.0/list-dids":this.receivedAgentDids,
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/1.0/did":this.updatedDid, -->