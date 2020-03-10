<template >

<el-row>
    <el-dialog
      title="Create Payment Address"
      :visible.sync="CreateDialogVisible"
      width="500">

        <el-form :inline="true">
          <el-form-item label="Payment Method">
            <el-select v-model="create_form_method" placeholder="">
                <el-option value="sov">Sovrin (sov)</el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Seed (optional)">
            <el-input v-model="create_form_seed" style="width:200px;"> </el-input>
          </el-form-item>
        </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="CreateDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="create_payment_address()">Create Payment Address</el-button>
      </span>
    </el-dialog>

      <el-dialog
      title="Transfer Payment"
      :visible.sync="TransferDialogVisible"
      width="500">

        <el-form :inline="true">
          <el-form-item label="Payment Method">
            <el-select v-model="transfer_form_method" placeholder="">
                <el-option value="sov">Sovrin (sov)</el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="From">
            <el-select v-model="transfer_form_from" placeholder="Select From Payment Address">
              <el-option
                v-for="a in payment_addresses"
                :key="a.address"
                :label="a.address"
                :value="a.address">
                <span style="float: left">{{ a.address }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ a.balance }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="To">
            <el-input v-model="transfer_form_to" style="width:200px;"> </el-input>
          </el-form-item>
          <el-form-item label="Amount">
            <el-input v-model="transfer_form_amount" style="width:200px;"> </el-input>
          </el-form-item>
        </el-form>


      <span slot="footer" class="dialog-footer">
        <el-button @click="TransferDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="transfer()">Transfer</el-button>
      </span>
    </el-dialog>

  <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand mr-auto" href="#">Payments</a>
      <el-button
        type="primary"
        @click="create_dialog()">Create Address</el-button>
      <el-button
        type="primary"
        @click="transfer_dialog()">Transfer</el-button>
      <el-button
        type="primary"
        icon="el-icon-refresh"
        @click="fetch_payment_addresses"></el-button>
  </nav>
  <el-collapse v-model="expanded_items">
      <ul class="list">
        <el-collapse-item
          v-for="a in payment_addresses"
          :name="a.address"
          :key="a.address">
          <div
            style="width: 100%;"
            slot="title">
            <span>{{address_title(a)}}</span>
            <span style="float: right; margin-right: 1em;">{{a.balance}}</span>
          </div>
          <el-row :key="a.address">
            <p>Balance: {{a.balance}}</p>
            <p>Method: {{a.method}}</p>
            <el-button type="primary" @click="copy(a.address)">Copy Address</el-button>
            <div>
              <vue-json-pretty
                :deep=1
                :data="a.raw_repr">
              </vue-json-pretty>
            </div>
          </el-row>
        </el-collapse-item>
      </ul>
    </el-collapse>


</el-row>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';
const { clipboard } = require('electron');
import VueQrcode from '@chenfengyuan/vue-qrcode';
import message_bus from '@/message_bus.js';
import share from '@/share.js';

export const metadata = {
  menu: {
    label: 'Payments',
    icon: 'el-icon-money',
    group: 'Agent to Agent',
    priority: 10,
    required_protocols: [
      'https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-payments/0.1'
    ]
  }
};

export const shared = {
  data: {
    payment_addresses: [],
  },
  listeners: {
    'https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-payments/0.1/address-list': (share, msg) => {
      share.payment_addresses = msg.addresses;
    }
  },
  methods: {
    fetch_payment_addresses: ({send}) => {
      send({
        "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-payments/0.1/get-address-list",
      });
    }
  }
}

export default {
  name: 'payments',
  mixins: [
    message_bus({events: {
      'https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-payments/0.1/address': (v, msg) => {
        v.fetch_payment_addresses()
      }
    }}),
    share({
      use: ['payment_addresses'],
      actions: ['fetch_payment_addresses']
    })
  ],
  components: {
    VueJsonPretty
  },
  data () {
    return {
      expanded_items: [],
      CreateDialogVisible: false,
      TransferDialogVisible: false,
      transfer_form_method: "",
      transfer_form_from: "",
      transfer_form_to: "",
      transfer_form_amount: 0,
      create_form_seed: "",
      create_form_method: "sov",
    }
  },
  created: async function() {
    await this.ready();
    this.fetch_payment_addresses();
  },
  methods: {
    async create_payment_address(){
      let query_msg = {
        "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-payments/0.1/create-address",
        "method": this.create_form_method,
        "seed": this.create_form_seed,
      };
      this.create_form_seed = "";
      this.send_message(query_msg);
      this.CreateDialogVisible = false;
    },
    transfer: async function() {
      this.send_message({
        "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-payments/0.1/transfer",
        "method": this.transfer_form_method,
        "from_address": this.transfer_form_from,
        "to_address": this.transfer_form_to,
        "amount": this.transfer_form_amount
      });
      this.transfer_form_method = "sov";
      this.transfer_form_from = "";
      this.transfer_form_to = "";
      this.transfer_form_amount = 0;
      this.TransferDialogVisible = false;
    },
    create_dialog: function(){
      this.CreateDialogVisible = true;
    },
    transfer_dialog: function(){
      this.TransferDialogVisible = true;
    },
    address_title: function(address) {
      return (text => {
          if (text.length > 30) {
            return text.slice(0, 30).trim() + '...';
          }
          return text;
        })(address.address);
    },
    copy: function(value){
      clipboard.writeText(value);
      this.$notify({
          type: 'success',
          title: 'Copied',
          message: "\"" + value + "\" copied to clipboard.",
          duration: 2000
        });
    },
  }
}
</script>
