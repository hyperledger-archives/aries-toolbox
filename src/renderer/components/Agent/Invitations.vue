<template >

<el-row>
    <el-dialog
      title="Scan Invitation"
      :visible.sync="QRDialogVisible"
      width="500">
      <div style="margin-left:auto;margin-right:auto;">
        <qrcode v-bind:value="QRDialogURL" :options="{ width: 400 }"></qrcode>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="QRDialogVisible = false">Close</el-button>
      </span>
    </el-dialog>

  <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">Invitations</a>
      <el-button
        type="primary"
        icon="el-icon-refresh"
        @click="$emit('refresh',)"></el-button>
  </nav>
  <el-collapse v-model="expanded_items">
      <ul class="list">
        <el-collapse-item
          v-for="i in invitations"
          v-bind:title="get_name(i)"
          :name="get_name(i)"
          :key="i.connection.connection_id">
          <el-row :key="i.connection.connection_id">
            <p>Accept: {{i.connection.accept}}</p>
            <p>Their Role: {{i.connection.their_role}}</p>
            <p>Mode: {{i.connection.invitation_mode}}</p>
            <p>Created: {{i.connection.created_at}}</p>
            <el-button type="primary" @click="copyURL(i.invitation.invitation_url)">Copy URL</el-button>
            <el-button type="primary" @click="presentQR(i.invitation.invitation_url)">Scan QR</el-button>

            <div>
              <vue-json-pretty
                :deep=1
                :data="i">
              </vue-json-pretty>
            </div>
          </el-row>
        </el-collapse-item>
      </ul>
    </el-collapse>


  <p>Create Invitations:</p>
  <el-form :inline="true">
    <el-form-item label="Label:">
      <el-input v-model="invite_label_form" style="width:200px;"> </el-input>
    </el-form-item>
    <el-form-item label="Role:">
      <el-input v-model="invite_role_form" style="width:200px;"> </el-input>
    </el-form-item>
    <el-form-item label="Acceptance:">
      <el-input v-model="invite_accept_form" style="width:200px;"> </el-input>
    </el-form-item>
    <el-form-item label="Public:">
      <el-switch v-model="invite_public_form"></el-switch>
    </el-form-item>
    <el-form-item label="Multi Use:">
      <el-switch v-model="invite_multi_use_form"></el-switch>
    </el-form-item>
    </div>
    <el-form-item>
      <el-button type="primary" @click="fetchNewInvite()">Create New Invite</el-button>
    </el-form-item>
  </el-form>

</el-row>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';
const { clipboard } = require('electron');
import VueQrcode from '@chenfengyuan/vue-qrcode';

export default {
  name: 'agent-invitations',
  props: ['invitations', 'title'],
  components: {
    VueJsonPretty,
    'qrcode': VueQrcode
  },
  data () {
    return {
        expanded_items: [],
        QRDialogVisible: false,
        QRDialogURL: '',
        invite_label_form:"",
        invite_role_form:"",
        invite_accept_form:"auto",
        invite_public_form:false,
        invite_multi_use_form:false,
    }
  },
  methods: {
    async fetchNewInvite(){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/create-invitation",
        "label": this.invite_label_form,
        "role": this.invite_role_form,
        "accept": this.invite_accept_form,
        "public": this.invite_public_form,
        "multi_use": this.invite_multi_use_form,
      };
      this.invite_label_form = "";
      this.invite_role_form = "";
      this.invite_accept_form = "auto";
      this.invite_public_form = false;
      this.invite_multi_use_form = false;
      //this.$parent.connection.send_message(query_msg);
      this.$emit('send-connection-message', query_msg);
    },
    get_name: function(i) {
      return i.connection.invitation_mode +" / "+ i.connection.their_role +" / "+ i.connection.created_at ;
    },
    copyURL: function(url){
      clipboard.writeText(url);
      this.$notify({
          type: 'success',
          title: 'Copied',
          message: 'This Invitation has been copied to the clipboard.',
          duration: 2000
        });
    },
    presentQR: function(url){
      this.QRDialogURL = url;
      this.QRDialogVisible = true;
    },
  }
}
</script>
