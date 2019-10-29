<template >
<el-row>
    <presentations
    title="Presentations"
    v-bind:presentations="holder_presentations"
    v-bind:connections = "activeConnections"
    v-bind:cred_defs = "cred_defs"
    @presentation-refresh = "getHoldersPresentations"
    @send-presentation-proposal= "sendPresentationProposal"
    ></presentations>
</el-row>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';
const { clipboard } = require('electron');
import Presentations from './Presentations.vue';

export default {
  name: 'presentations-tab',
  props: ['activeConnections','cred_defs'],
  message_bus: 'derive',
  components: {
    VueJsonPretty,
    Presentations,
  },
  data () {
    return {
        holder_presentations: [],
    }
  },
  created: function() {
    let component = this; // Safe rerefence to this
    this.$message_bus.$on(
        'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/presentations-list',
      msg => component.holderPresentationListRecord(msg)
    );
    this.$message_bus.$on('presentation', () => component.getHoldersPresentations());
  },
  methods: {
    async getHoldersPresentations(){
        this.$message_bus.$emit('send-message',{
            "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/presentations-get-list",
            //'connection_id': ,// optional filter
            //'verified': ,// optional filters
            "~transport": {
                "return_route": "all"
            }
        });
    },
    async holderPresentationListRecord(msg){
        if('results'in msg ){
            this.holder_presentations = msg.results;
        }
    },
    async sendPresentationProposal(form){
      let query_msg = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/send-presentation-proposal",
        "connection_id": form.connection_id,
        "comment": form.comment,
        "auto_present": form.auto_present , //optional, default to false
        "presentation_proposal": {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/present-proof/1.0/presentation-preview",
          /**
           * name 
           * cred_def_id //optional
           * mime_type //optional
           * value //optional
           * */
          attributes: form.attributes.map(attribute => {
            return {
              name: attribute.name,
              cred_def_id: attribute.cred_def.cred_def_id,
              value: attribute.value
            };
          }),
          /**
           * name
           * cred_def_id
           * predicate
           * threshold
           */
          predicates: form.predicates.map(predicate => {
            return {
              name: predicate.name,
              cred_def_id: predicate.cred_def.cred_def_id,
              predicate: predicate.predicate,
              threshold: predicate.threshold
            };
          })
        },
      };
        this.$message_bus.$emit('send-message',query_msg);
    },
  }
}
</script>
