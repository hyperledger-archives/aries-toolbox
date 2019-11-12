<template >
  <el-row>
    <verification
      title="Verification"
      v-bind:list="issuer_presentations"
      v-bind:connections="active_connections"
      v-bind:cred_defs="cred_defs"
      v-bind:trusted_issuers="trusted_issuers"
      @verification-refresh="fetch_issuer_presentations"
      @presentation-request="presentation_request"></verification>
  </el-row>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';
import Verification from './Verification.vue';
import message_bus from '@/message_bus.js';
import share from '@/share.js';

export const shared = {
  data: {
    issuer_presentations: [],
  },
  listeners: {
    "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/presentations-list":
    (share, msg) => share.issuer_presentations = msg.results
  },
  methods: {
    fetch_issuer_presentations: ({send}) => {
      send({
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/presentations-get-list"
      })
    }
  }
}

export default {
  name: 'verifications',
  components: {
    VueJsonPretty,
    Verification,
  },
  mixins: [
    message_bus({
      events: {
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/presentation-exchange":
        (v, msg) => setTimeout(v.fetch_issuer_presentations, 4500),
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/request-presentation":
        (v, msg) => setTimeout(v.fetch_issuer_presentations, 4500),
      }
    }),
    share({
      use: [
        'issuer_presentations',
        'active_connections',
        'cred_defs',
        'trusted_issuers',
      ],
      actions: ['fetch_issuer_presentations']
    })
  ],
  methods: {
    async presentation_request(form){
      // response comes back in admin-issuer/1.0/presentation-exchange
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/request-presentation",
        connection_id: form.connection_id,
        comment: form.comment,
        proof_request: {
          name: form.name,
          version: "1.0",
          requested_attributes: form.attributes.reduce((acc, attribute) => {
            let transmuted_attr = {
              name: attribute.name,
              restrictions: []
            };
            if (attribute.restrictions.cred_def || attribute.restrictions.trusted_issuer) {
              transmuted_attr.restrictions.push({});
            }
            if (attribute.restrictions.cred_def) {
              transmuted_attr.restrictions[0].credential_definition_id = attribute.restrictions.cred_def.cred_def_id;
            }
            if (attribute.restrictions.trusted_issuer) {
              transmuted_attr.restrictions[0].issuer_did = attribute.restrictions.trusted_issuer;
            }
            acc[attribute.name] = transmuted_attr;
            return acc;
          }, {}),
          requested_predicates: form.predicates.reduce((acc, predicate) => {
            let transmuted_pred = {
              name: predicate.name,
              p_type: predicate.p_type,
              p_value: predicate.threshold,
              restrictions: []
            };
            if (predicate.restrictions.cred_def || predicate.restrictions.trusted_issuer) {
              transmuted_pred.restrictions.push({});
            }
            if (predicate.restrictions.cred_def) {
              transmuted_pred.restrictions[0].credential_definition_id = predicate.restrictions.cred_def.cred_def_id;
            }
            if (predicate.restrictions.trusted_issuer) {
              transmuted_pred.restrictions[0].issuer_did = predicate.restrictions.trusted_issuer;
            }
            acc[predicate.name] = transmuted_pred;
            return acc;
          }, {}),
        },
      };
      this.send_message(query_msg);
    },
  },
}
</script>
