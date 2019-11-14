<template >
  <el-row>
    <presentation
      title="Presentations"
      v-bind:presentations= "holder_presentations"
      v-bind:connections = "active_connections"
      v-bind:cred_defs = "cred_defs"
      @presentation-refresh = "fetch_holder_presentations"
      @send-presentation-proposal= "sendPresentationProposal"
      ></presentation>
  </el-row>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';
const { clipboard } = require('electron');
import Presentation from './Presentation.vue';
import message_bus from '@/message_bus.js';
import share from '@/share.js';

export const metadata = {
  menu: {
    label: 'Presentations',
    icon: 'el-icon-document-checked',
    group: 'Agent to Agent',
    priority: 90,
    required_protocols: [
      'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0'
    ]
  }
};

export const shared = {
  data: {
    holder_presentations: [],
  },
  listeners: {
    'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/presentations-list': (share, msg) => {
      share.holder_presentations = msg.results;
    }
  },
  methods: {
    fetch_holder_presentations: ({send}) => {
      send({
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-holder/1.0/presentations-get-list",
      })
    }
  }
}

export default {
  name: 'presentations',
  components: {
    VueJsonPretty,
    Presentation,
  },
  mixins: [
    message_bus(),
    share({
      use: [
        'active_connections', 
        'cred_defs',
        'holder_presentations'
      ],
      actions: ['fetch_holder_presentations']
    })
  ],
  created: async function() {
    await this.ready();
    this.fetch_holder_presentations();
  },
  methods: {
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
        this.send_message(query_msg);
    },
  }
}
</script>
