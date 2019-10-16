<template >
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#"> Presentations </a>
      <el-button
        type="primary"
        icon="el-icon-plus"
        @click="proposalFormActive = true">Make a Presentation Proposal</el-button>
    </nav>
    <el-collapse v-model="ver_pres_expanded_items">
      <ul class="list">
        <el-collapse-item
          v-for="presentation in VerifiedPresentations"
          v-bind:title="presentation.presentation_exchange_id"
          :name="presentation.presentation_exchange_id"
          :key="presentation.presentation_exchange_id">
          <el-row>
            <div>
              <vue-json-pretty
                :deep=1
                :data="presentation">
              </vue-json-pretty>
            </div>
            <el-button v-on:click="collapse_expanded_ver_pres(presentation)">^</el-button>
          </el-row>
        </el-collapse-item>
      </ul>
    </el-collapse>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#"> Received Requests </a>
    </nav>
    <el-collapse v-model="rec_req_expanded_items">
      <ul class="list">
        <el-collapse-item
          v-for="presentation in ReceivedRequests"
          v-bind:title="presentation.presentation_exchange_id"
          :name="presentation.presentation_exchange_id"
          :key="presentation.presentation_exchange_id">
          <el-row>
            <div>
              <vue-json-pretty
                :deep=1
                :data="presentation">
              </vue-json-pretty>
            </div>
            <el-button v-on:click="collapse_expanded_rec_req(presentation)">^</el-button>
          </el-row>
        </el-collapse-item>
      </ul>
    </el-collapse>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#"> Sent Presentation </a>
    </nav>
    <el-collapse v-model="sent_pres_expanded_items">
      <ul class="list">
        <el-collapse-item
          v-for="presentation in SentPresentations"
          v-bind:title="presentation.presentation_exchange_id"
          :name="presentation.presentation_exchange_id"
          :key="presentation.presentation_exchange_id">
          <el-row>
            <div>
              <vue-json-pretty
                :deep=1
                :data="presentation">
              </vue-json-pretty>
            </div>
            <el-button v-on:click="collapse_expanded_sent_pres(presentation)">^</el-button>
          </el-row>
        </el-collapse-item>
      </ul>
    </el-collapse>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#"> Sent Proposals </a>
    </nav>
    <el-collapse v-model="sent_prop_expanded_items">
      <ul class="list">
        <el-collapse-item
          v-for="presentation in SentProposals"
          v-bind:title="presentation.presentation_exchange_id"
          :name="presentation.presentation_exchange_id"
          :key="presentation.presentation_exchange_id">
          <el-row>
            <div>
              <vue-json-pretty
                :deep=1
                :data="presentation">
              </vue-json-pretty>
            </div>
            <el-button v-on:click="collapse_expanded_sent_prop(presentation)">^</el-button>
          </el-row>
        </el-collapse-item>
      </ul>
    </el-collapse>

    <el-dialog title="Make a Presentation Proposal" :visible.sync="proposalFormActive">
      <el-form :model="proposalForm">
        <el-form-item label="Connection:" :label-width="formLabelWidth">
          <el-select
            v-model="proposalForm.connection_id"
            filterable
            placeholder="Connection">
            <el-option
              v-for="connection in connections"
              :key="connection.connection_id"
              :label="connection.their_label"
              :value="connection.connection_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Credential Definition:" :label-width="formLabelWidth">
          <el-select
            v-model="proposalForm.selected_cred_def"
            filterable
            placeholder="Credential Definition"
            @change="update_attributes">
            <el-option
              v-for="cred_def in cred_defs"
              :key="cred_def.cred_def_id"
              :label="cred_def.cred_def_id"
              :value="cred_def">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="Comment (optional)"
          :label-width="formLabelWidth">
          <el-input
            v-model="proposalForm.comment"
            type="textarea"></el-input>
        </el-form-item>
        <!-- <el-form-item
          v-for="attribute in proposalForm.attributes"
          :label="attribute.name"
          :label-width="formLabelWidth"
          :key="attribute.name">
          <el-input
            v-model="attribute.value"></el-input>
        </el-form-item> -->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="proposalFormActive = false">Cancel</el-button>
        <el-button type="primary" @click="sendPresentationProposal">Send</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';

export default {
  name: 'presentations',
  props: [
    'title',
    'editable',
    'presentations',
    'connections',
    'cred_defs'
    ],
  components: {
    VueJsonPretty,
  },
  data () {
    return {
        ver_pres_expanded_items:[],
        sent_prop_expanded_items:[],
        rec_req_expanded_items:[],
        sent_pres_expanded_items:[],
        expanded_items:[],
        proposalFormActive: false,
        proposalForm: {
            connection_id: '',
            selected_cred_def: {},
            comment: '',
            attributes: []
        },
        formLabelWidth: '200px'
    }
  },
  methods: {
    collapse_expanded_ver_pres: function(presentation){
      this.ver_pres_expanded_items = this.ver_pres_expanded_items.filter(
        item => item != presentation.presentation_exchange_id
      );
    },
    collapse_expanded_sent_prop: function(presentation){
      this.sent_prop_expanded_items = this.sent_prop_expanded_items.filter(
        item => item != presentation.presentation_exchange_id
      );
    },
    collapse_expanded_rec_req: function(presentation){
      this.rec_req_expanded_items = this.rec_req_expanded_items.filter(
        item => item != presentation.presentation_exchange_id
      );
    },
    collapse_expanded_sent_pres: function(presentation){
      this.sent_pres_expanded_items = this.sent_pres_expanded_items.filter(
        item => item != presentation.presentation_exchange_id
      );
    },
    sendPresentationProposal: function() {
      let values = {
       //Todo: copy Dbluhm's stuff here
      }

      this.$emit('send-presentation-proposal', values);
      this.proposalFormActive = false;
    },
    update_attributes: function(cred_def) {
      var comp = this;
      cred_def.attributes.forEach(name => {
        comp.proposalForm.attributes.push({
          name: name,
          value: ''
        });
      });
    },
  },
  computed: {
    VerifiedPresentations(){
      return this.presentations.filter(
        exchange => 
        "state" in exchange &&
        exchange.state === "verified" &&
        //==========================================
        "role" in exchange &&
        "prover" === exchange.role )
    },
    ReceivedRequests(){
      return this.presentations.filter(
        exchange => 
        "state" in exchange &&
        exchange.state === "request_received" && 
        //==========================================
        "role" in exchange &&
        "prover" === exchange.role)
    },
    SentPresentations(){
      return this.presentations.filter(
        exchange => 
        "state" in exchange &&
        exchange.state === "presentation_sent" &&
        //==========================================
        "role" in exchange &&
        "prover" === exchange.role )
    },
    SentProposals(){
      return this.presentations.filter(
        exchange => 
        "state" in exchange && 
        exchange.state === "proposal_sent"  && 
        //==========================================
        "role" in exchange &&
        "prover" === exchange.role
      )
    },
  }
}
</script>
