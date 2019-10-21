<template >

<el-row>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">Static Connection</a>
      <el-button
        type="primary"
        icon="el-icon-refresh"
        @click="$emit('refresh',)"></el-button>
    </nav>
  <el-collapse v-model="expanded_items">
      <ul class="list">
        <el-collapse-item
          v-for="c in staticconnections"
          v-bind:title="get_name(c)"
          :name="get_name(c)"
          :key="c.connection_id">
          <el-row :key="c.connection_id">
            <p><b>My DID:</b> {{c.my_info.did}} <el-button type="info" icon="el-icon-copy-document" size="mini" circle @click="copyItem(c.my_info.did, 'DID')"></el-button></p>
            <p><b>My VK:</b> {{c.my_info.vk}} <el-button type="info" icon="el-icon-copy-document" size="mini" circle @click="copyItem(c.my_info.vk, 'VK')"></el-button></p>
            <p><b>My Endpoint:</b> {{c.my_info.endpoint}} <el-button type="info" icon="el-icon-copy-document" size="mini" circle @click="copyItem(c.my_info.endpoint, 'Endpoint')"></el-button></p>
            <p><b>Remote DID:</b> {{c.their_info.did}}</p>
            <p><b>Remote VK:</b> {{c.their_info.vk}}</p>
            <div>
              <vue-json-pretty
                :deep=1
                :data="c">
              </vue-json-pretty>
            </div>
          </el-row>
        </el-collapse-item>
      </ul>
    </el-collapse>


    <p>Add Static Connection:</p>
    <el-form :model=static_agent_form>
      <div>
        <span slot="label">Label:</span>
        <el-input v-model="static_agent_form.label" style="width:100px;"> </el-input>
        <span slot="label">Role:</span>
        <el-input v-model="static_agent_form.role" style="width:100px;"> </el-input>
        <span slot="label">Static Did:</span>
        <el-input v-model="static_agent_form.static_did" style="width:100px;"> </el-input>
        <span slot="label">Static Key:</span>
        <el-input v-model="static_agent_form.static_key" style="width:100px;"> </el-input>
        <span slot="label">Static Endpoint:</span>
        <el-input v-model="static_agent_form.static_endpoint" style="width:100px;"> </el-input>
      </div>
      <el-form-item>
        <el-button type="primary" @click="addStaticAgent()">Add Static Agent</el-button>
      </el-form-item>
    </el-form>

</el-row>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';
const { clipboard } = require('electron');
import VueQrcode from '@chenfengyuan/vue-qrcode';

export default {
  name: 'agent-static-connections',
  props: ['staticconnections', 'title'],
  components: {
    VueJsonPretty,
    'qrcode': VueQrcode
  },
  data () {
    return {
      expanded_items: [],
      static_agent_form:{
        'label':"",
        'role':"",
        'static_did':"",
        'static_key':"",
        'static_endpoint':"",
      },
    }
  },
  methods: {
    async addStaticAgent(){
      let query_msg ={
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-static-connections/1.0/create-static-connection",
        "label": this.static_agent_form.label,
        "role": this.static_agent_form.role,
        "static_did": this.static_agent_form.static_did,
        "static_key": this.static_agent_form.static_key,
        "static_endpoint": this.static_agent_form.static_endpoint,
        "~transport": {
          "return_route": "all"
        }
      }
      //this.connection.send_message(query_msg);
      this.$emit('send-connection-message', query_msg);
    },

    get_name: function(c) {
      return c.their_info.label; //i.connection.invitation_mode +" / "+ i.connection.their_role +" / "+ i.connection.created_at ;
    },
    copyItem: function(item,title){
      clipboard.writeText(item);
      this.$notify({
          type: 'success',
          title: 'Copied',
          message: 'This '+title+' has been copied to the clipboard.',
          duration: 2000
        });
    },
  }
}
</script>
