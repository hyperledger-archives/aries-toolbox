<template>
  <el-row>
    <schema-list
      title="Schemas"
      editable="false"
      :list="schemas"
      @schema-send="publish_schema"
      @schema-get="get_schema"
      @schema-refresh="get_schema_list"></schema-list>
    <cred-def-list
      title="Credential Definitions"
      :retrievable="false"
      :can_create="true"
      :list="issuer_cred_defs"></cred-def-list>
    <issued-cred-list
      title="Issued Credentials"
      v-bind:list="issued_credentials"
      v-bind:connections="active_connections"
      v-bind:cred_defs="issuer_cred_defs"
      @issue="issue_credential"
      @issue-cred-refresh="get_issued_credentials">
    </issued-cred-list>
  </el-row>
</template>

<script>
import message_bus from '../../message_bus.js';
import share from '../../share.js';
import SchemaList from './SchemaList.vue';
import CredDefList from './CredDefList.vue';
import IssuedCredList from './IssuedCredList.vue';

export default {
  name: 'credential-issuance',
  mixins: [
    message_bus({
      events: {
        'credential-issuance': (v, msg) => {
          v.get_schema_list();
          v.get_issued_credentials();
          v.$message_bus.$emit('connections');
          v.$message_bus.$emit('cred_defs');
        },
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-schemas/1.0/schema-id":
        (v, msg) => v.get_schema_list(),
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-schemas/1.0/schema":
        (v, msg) => v.get_schema_list(),
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/credential-exchange":
        (v, msg) => v.get_issued_credentials(),
      }
    }),
    share({
      use: [
        'active_connections',
        'schemas',
        'cred_defs',
        'issued_credentials',
        'issuer_cred_defs'
      ],
      events: {
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-schemas/1.0/schema-list":
        (share, msg) => share.schemas = msg.results,
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/credentials-list":
        (share, msg) => share.issued_credentials = msg.results,
      }
    })
  ],
  components: {
    SchemaList,
    CredDefList,
    IssuedCredList
  },
  methods: {
    publish_schema: function(form) {
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-schemas/1.0/send-schema",
        "schema_name": form.name,
        "schema_version": form.version,
        "attributes": form.attributes,
      };
      this.send_message(query_msg);
    },
    get_schema: function(schema_id) {
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-schemas/1.0/schema-get",
        "schema_id": schema_id,
      };
      this.send_message(query_msg);
    },
    get_schema_list: function() {
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-schemas/1.0/schema-get-list",
      };
      this.send_message(query_msg);
    },
    issue_credential: function(form) {
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/send-credential",
        "connection_id": form.connection_id,
        "credential_definition_id": form.credential_definition_id,
        "comment": form.comment, //optional
        "credential_proposal": {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/credential-preview",
          "attributes": form.attributes
        }
      };
      this.send_message(query_msg);
    },
    get_issued_credentials: function() {
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/credentials-get-list",
      };
      this.send_message(query_msg);
    },
  }
}
</script>
