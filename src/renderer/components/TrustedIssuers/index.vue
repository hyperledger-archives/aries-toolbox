<template >
<el-row>
    <issuers
    title="Trusted Dids"
    :trusted_issuers="trusted_issuers"
    @remove-issuer="remove_trusted_issuer"
    @store-issuer="store_trusted_issuer"></issuers>

</el-row>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';
import Issuers from './Issuers.vue';
import message_bus from '@/message_bus.js';
import share from '@/share.js';

export const shared = {
  data: {
    trusted_issuers: [],
  },
  methods: {
    store_trusted_issuer: ({share}, issuer) => {
      share.trusted_issuers.push(issuer);
    },
    remove_trusted_issuer: ({share}, issuer) => {
      share.trusted_issuers = share.trusted_issuers
        .filter((item) => item.did !== issuer.did || item.label !== issuer.label);
    }
  }
}

export default {
  name: 'trusted-issuers',
  components: {
    VueJsonPretty,
    Issuers
  },
  mixins: [
    message_bus(),
    share({
      use: ['trusted_issuers'],
      actions: ['store_trusted_issuer', 'remove_trusted_issuer']
    })
  ],
}
</script>
