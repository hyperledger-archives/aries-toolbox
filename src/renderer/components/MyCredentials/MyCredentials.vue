<template>
  <el-row>
    <cred-def-list
      title="Retrieved Credential Definitions"
      v-bind:retrievable="true"
      v-bind:can_create="false"
      v-bind:list="proposal_cred_defs"></cred-def-list>
    <my-credentials-list
      title="Credentials"
      editable="false"
      v-bind:credentials="holder_credentials"
      v-bind:cred_defs="proposal_cred_defs"
      v-bind:connections="active_connections"
      @cred-refresh="get_holder_credentials"
      @propose="send_proposal"></my-credentials-list>
  </el-row>
</template>

<script>
import CredDefList from '../CredentialIssuance/CredDefList.vue';
import MyCredentialsList from './MyCredentialsList.vue';
import message_bus from '../../message_bus.js';
import share from '../../share.js';

export default {
  name: 'my-credentials',
  components: {
    CredDefList,
    MyCredentialsList
  },
  mixins: [
    message_bus({
      events: {
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/credential-exchange":
        (v, msg) => setTimeout(v.get_holder_credentials, 4500),
        'my-credentials': (v) => v.get_holder_credentials()
      }
    }),
    share({
      use: [
        'holder_credentials',
        'proposal_cred_defs',
        'active_connections'
      ],
      events: {
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/credentials-list":
        (share, msg) => share.holder_credentials = msg.results
      }
    })
  ],
  methods: {
    get_holder_credentials: function() {
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/credentials-get-list",
      };
      this.send_message(query_msg);
    },
    send_proposal: function(form) {
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/send-credential-proposal",
        "connection_id": form.connection_id,
        "credential_definition_id": form.credential_definition_id,
        "comment": form.comment, //optional
        "credential_proposal": {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/credential-preview",
          "attributes": form.attributes
        }
      };
      this.send_message(query_msg);
    }
  }
}
</script>
