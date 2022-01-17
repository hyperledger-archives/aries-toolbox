<template>
  <div>
  <el-dialog
    title="Transaction Author Agreement"
    class="taa-dialog"
    :visible.sync="phase_one">
    <p>Using this module requires signing the Transaction Author Agreement.</p>
    <el-form class="taa-form">
      <el-button
        @click="redirect">Cancel</el-button>
      <el-button
        type="primary"
        @click="phase = 2">Continue</el-button>
    </el-form>
  </el-dialog>
  <el-dialog
    title="Transaction Author Agreement"
    width="75%"
    class="taa-dialog"
    :visible.sync="phase_two">
    <p>In order to write to the currently connected ledger, please review the
    Transaction Author Agreement V{{version}} and mark your acceptance
    below.</p>
    <div class="taa-text" v-html="cleaned"></div>
    <el-form class="taa-form">
      <el-checkbox v-model="accepted">
        I accept the terms of the Transaction Author Agreement V{{version}}
      </el-checkbox>
      <el-button
        @click="redirect">Cancel</el-button>
      <el-button
        type="primary"
        :disabled="!accepted"
        @click="accept(); phase = 0">Submit</el-button>
    </el-form>
  </el-dialog>
  </div>
</template>

<script>
import message_bus from '@/message_bus.js';
import share from '@/share.js';
import {marked} from 'marked';
import dompurify from 'dompurify';

export const protocol = "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-taa/0.1";
export default {
  name: 'taa',
  mixins: [
    message_bus({
      events: {
        [protocol + '/taa']: (vm, msg) => {
          vm.text = msg.text;
          vm.version = msg.version;
          if (msg.needed) {
            vm.phase = 1;
          }
        },
        [protocol + '/acceptance']: (vm, msg) => {
          if (msg.needed) {
            vm.get();
          }
        },
        'entered_taa_required_module': (vm, msg) => {
          if (vm.has_admin_taa_protocol) {
            vm.get_acceptance();
          }
        }
      }
    }),
    share({
      use: ['protocols']
    })
  ],
  data: function() {
    return {
      phase: 0,
      accepted: false,
      text: '',
      version: '',
    }
  },
  computed: {
    cleaned: function() {
      return dompurify.sanitize(marked(this.text.substring(this.text.indexOf('\n'))));
    },
    has_admin_taa_protocol: function() {
      return this.protocols && this.protocols.find(item => item.pid === protocol)
    },
    phase_one: function() {
      return this.phase === 1
    },
    phase_two: function() {
      return this.phase === 2
    }
  },
  methods: {
    get_acceptance: function() {
      this.send_message({
        '@type': protocol + '/get-acceptance',
      });
    },
    get: function() {
      this.send_message({
        '@type': protocol + '/get',
      });
    },
    accept: function() {
      this.send_message({
        '@type': protocol + '/accept',
        text: this.text,
        version: this.version
      });
    },
    redirect: function() {
      this.phase = 0;
      this.$message_bus.$emit('redirect', 'feature-discovery');
    }
  }
}

</script>

<style>
.taa-dialog {
  word-break: break-word;
}
.taa-text {
  word-break: break-word;
  height: 500px;
  overflow-y: scroll;
}
.taa-text h2 {
 font-size: 1.25rem;
}
.taa-form {
  margin-top: 1em;
}
</style>
