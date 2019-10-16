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

        <el-form-item
          v-for="(attribute, index) in requestForm.attributes"
          :label="'Attribute ' + index"
          :label-width="formLabelWidth"
          :key="'attribute_' + index"
          class="additions">
          <el-input
            v-model="requestForm.attributes[index].name"
            placeholder="Attribute name">
            <el-button
              slot="append"
              icon="el-icon-close"
              @click="remove_attribute(index)"></el-button>
          </el-input>
          <el-form-item label="Restrictions:" class="restrictions">
            <el-select
              v-model="requestForm.attributes[index].restrictions.cred_def"
              filterable
              no-data-text="No credential definitions"
              placeholder="Credential Definition">
              <el-option
                v-for="cred_def in cred_defs"
                :key="cred_def.cred_def_id"
                :label="cred_def.cred_def_id"
                :value="cred_def">
              </el-option>
            </el-select>
            <el-select
              v-model="requestForm.attributes[index].restrictions.trusted_issuer"
              filterable
              no-data-text="No registered trusted issuers"
              placeholder="Trusted Issuers">
              <el-option
                v-for="issuer in trusted_issuers"
                :key="issuer.did"
                :label="issuer.label"
                :value="issuer.did">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form-item>
        <el-divider v-if="requestForm.predicates.length > 0 && requestForm.attributes.length > 0"></el-divider>
        <!-- Dynamic Predicates -->
        <el-form-item
          v-for="(predicate, index) in requestForm.predicates"
          :label="'Predicate ' + index"
          :label-width="formLabelWidth"
          :key="'predicate_' + index"
          class="additions">
          <el-input
            v-model="requestForm.predicates[index].name"
            placeholder="Attribute Name">
            <el-button
              slot="append"
              icon="el-icon-close"
              @click="remove_predicate(index)"></el-button>
          </el-input>
          <el-input
            v-model="requestForm.predicates[index].threshold"
            placeholder="Threshold">
            <el-select
              v-model="requestForm.predicates[index].p_type"
              slot="prepend"
              placeholder="type"
              class="ptype">
              <el-option
                v-for="opt in p_type_options"
                :key="opt"
                :label="opt"
                :value="opt"></el-option>
            </el-select>
          </el-input>
          <el-form-item label="Restrictions:" class="restrictions">
            <el-select
              v-model="requestForm.predicates[index].restrictions.cred_def"
              filterable
              no-data-text="No credential definitions"
              placeholder="Credential Definition">
              <el-option
                v-for="cred_def in cred_defs"
                :key="cred_def.cred_def_id"
                :label="cred_def.cred_def_id"
                :value="cred_def">
              </el-option>
            </el-select>
            <el-select
              v-model="requestForm.predicates[index].restrictions.trusted_issuer"
              filterable
              no-data-text="No registered trusted issuers"
              placeholder="Trusted Issuers">
              <el-option
                v-for="issuer in trusted_issuers"
                :key="issuer.did"
                :label="issuer.label"
                :value="issuer.did">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form-item>

        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="add_attribute">Add attribute</el-button>
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="add_predicate">Add predicate</el-button>
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
    'cred_defs',
    'trusted_issuers'
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
        requestFormActive: false,
        requestForm: {
        // This differs subtly from presentation proposal
        connection_id: '', // Who
        comment: '', // Optional comment
        name: '',
        attributes: [
          // Key: (can be whatever) property name,
          // {
          //   "name": "attribute_name"
          //   "restrictions": {
          //     "credential_definition_id": "asdf", etc.
          //   }
          // }
        ],
        predicates: [
          // Key: (can be whatever) property name,
          // {
          //   "name": "attribute_name",
          //   "p_type": ">=",
          //   "p_value": 18,
          //   "restrictions": {
          //     "credential_definition_id": "asdf", etc.
          //   }
          // }
        ]
        },
        formLabelWidth: '100px',
        p_type_options: ['>', '<', '>=', '<=']
    }
  },
  methods: {
    send: function() {
      let values = {
        connection_id: this.requestForm.connection_id,
        name: this.requestForm.name,
        comment: this.requestForm.comment,
        attributes: this.requestForm.attributes,
        predicates: this.requestForm.predicates
      }
      this.requestFormActive = false;

      this.requestForm.connection_id = '';
      this.requestForm.name = '';
      this.requestForm.comment = '';
      this.requestForm.attributes = [];
      this.requestForm.predicates = [];

      this.$emit('presentation-request', values);
    },
    add_attribute: function() {
      this.requestForm.attributes.push({
        name: '',
        restrictions: {
          cred_def: undefined,
          trusted_issuer: undefined
        },
      });
    },
    remove_attribute: function(index) {
      this.requestForm.attributes.splice(index, 1);
    },
    add_predicate: function() {
      this.requestForm.predicates.push({
        name: '',
        p_type: '',
        restrictions: {
          cred_def: undefined,
          trusted_issuer: undefined,
        },
      });
    },
    remove_predicate: function(index) {
      this.requestForm.predicates.splice(index, 1);
    },
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
    connection_map: function() {
    let map =  this.connections.reduce((acc, item) => {
        acc[item.connection_id] = item;
        return acc;
    }, {});
    console.log(map);
    return map;
    },
    completed_verifications: function() {
        return this.list.filter(pres_exch => pres_exch.state === 'verified');
    },
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
