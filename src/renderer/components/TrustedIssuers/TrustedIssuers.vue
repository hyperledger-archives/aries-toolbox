<template >
<el-row>
    <issuers
    title="Trusted Dids"
    v-bind:trusted_issuers= "trusted_issuers"
    @remove-did= "removeTrustedIssuer"
    @store-did= "storeTrustedIssuer"></issuers>

</el-row>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';
import Issuers from './Issuers.vue';
import message_bus from '../../message_bus.js';
import share from '../../share.js';

export default {
  name: 'trusted-issuers',
  message_bus: 'derive',
  components: {
    VueJsonPretty,
    Issuers
  },
  mixins: [
    message_bus(),
    share(['connections', 'active_connections'])
  ],
  data () {
    return {
      'trusted_issuers':{},
        'trusted_issuers_form':{
        'did':'',
        'label':'',
      },
    }
  },
  created: function() {},
  methods: {
    async removeTrustedIssuer(did){
      this.$delete(this.trusted_issuers,did.id)// TODO:remove this after aca-py support is added.
    },
    async storeTrustedIssuer(trusted_did){
      this.trusted_issuers[trusted_did.id] = { // TODO:remove this after aca-py support is added.
        "id":trusted_did.id,
        "label": trusted_did.label,
      }
    },
  }
}
</script>
