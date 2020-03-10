<template>
  <el-dialog
    title="Transaction Author Agreement"
    width="75%"
    class="taa-dialog"
    :visible.sync="viewing">
    <p>In order to write to the currently connected ledger, please review the
    Transaction Author Agreement V{{version}} and mark your acceptance
    below.</p>
    <div class="taa-text" v-html="cleaned"></div>
    <el-form class="taa-form">
      <el-checkbox v-model="accepted">
        I accept the terms of the Transaction Author Agreement V{{version}}
      </el-checkbox>
      <el-button
        @click="viewing=false">Cancel</el-button>
      <el-button
        type="primary"
        :disabled="!accepted"
        @click="accept(); viewing = false">Submit</el-button>
    </el-form>
  </el-dialog>
</template>

<script>
import message_bus from '@/message_bus.js';
import share from '@/share.js';
import marked from 'marked';
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
            vm.viewing = true;
          }
        },
        [protocol + '/acceptance']: (vm, msg) => {
          if (msg.needed) {
            vm.get();
          }
        },
      }
    }),
    share({
      use: ['protocols']
    })
  ],
  data: function() {
    return {
      viewing: false,
      accepted: false,
      text: '',
      version: '',
    }
  },
  computed: {
    cleaned: function() {
      return dompurify.sanitize(marked(this.text.substring(this.text.indexOf('\n'))));
    }
  },
  watch: {
    protocols: function() {
      if (this.protocols.find(item => item.pid === protocol)) {
        this.get_acceptance();
      }
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