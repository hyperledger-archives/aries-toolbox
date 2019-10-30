<template >
<el-row>
    <verification
        title="Verification"
        v-bind:list="issuer_presentations"
        v-bind:connections="active_connections"
        v-bind:cred_defs="cred_defs"
        v-bind:trusted_issuers="trusted_issuers"
        @verification-refresh="getIssuersPresentations"
        @presentation-request="verifierRequestPresentation"
    ></verification>

</el-row>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';
import Verification from './Verification.vue';
import message_bus from '../../message_bus.js';
import share from '../../share.js';

export default {
  name: 'verifications',
  props: ['shared'],
  message_bus: 'derive',
  components: {
    VueJsonPretty,
    Verification,
  },
  mixins: [
    message_bus(),
    share([
      'issuer_presentations',
      'active_connections',
      'cred_defs',
      'trusted_issuers',
      ])
  ],
  data () {
    return {
    }
  },
  created: function() {
    let component = this; // Safe rerefence to this
    this.$message_bus.$on(
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/presentations-list",
        msg => component.holderPresentationListRecord()
    );
    this.$message_bus.$on(
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/presentation-exchange",
        msg => component.holderPresentationRecord()
    );
        
    this.$message_bus.$on(
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/presentation-exchange",
        msg => component.verifierPresentationExchange()
    );
    this.$message_bus.$on(
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/request-presentation",
        msg => component.verifierRequestPresentationRecordDirective()
    );
    this.$message_bus.$on('verifications', () => component.getIssuersPresentations());
    //this.$message_bus.$on('agent-created', this.getIssuersPresentations);
  },
  methods: {
    async holderPresentationListRecord(msg={}){
      if('results'in msg ){
        this.holder_presentations = msg.results;
      }
    },
    async verifierRequestPresentation(form){
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
      this.$message_bus.$emit('send-message',query_msg);
    },
    async holderPresentationRecord(msg={}){
      return this.getIssuersPresentations();
    },
    async getIssuersPresentations(){
      this.$message_bus.$emit('send-message', {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-issuer/1.0/presentations-get-list",
        //'connection_id': ,// optional filter
        //'verified': ,// optional filter
      });
    },
    async verifierRequestPresentationRecordDirective(msg={}){
      if('results'in msg ){
        return this.getIssuersPresentations();
      }
    },
    async verifierPresentationExchange(msg={}){
      setTimeout(() => {
        return this.getIssuersPresentations();
      }, 4500);
    },
  },
  computed: {}
}
</script>
