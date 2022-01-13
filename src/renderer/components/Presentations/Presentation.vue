<template >
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#"> {{ title }} </a>
      <el-button
        type="primary"
        icon="el-icon-plus"
        @click="proposalFormActive = true">Presentation Proposal</el-button>
      <el-button
        type="primary"
        icon="el-icon-refresh"
        @click="$emit('presentation-refresh',)"></el-button>
    </nav>
    <el-collapse v-model="ver_pres_expanded_items">
      <ul class="list">
        <el-collapse-item
          v-for="presentation in VerifiedPresentations"
          v-bind:title="presentation_title(presentation)"
          :name="presentation.presentation_exchange_id"
          :key="presentation.presentation">
          <el-row :key="presentation.presentation">
            <p>Connected to: {{connection_details[presentation.connection_id].label}}</p>
            <p>Presentation Exchange ID: {{presentation.presentation_exchange_id}}</p>
            <p>Connection ID: {{presentation.connection_id}}</p>
            <p>Role: {{presentation.role}}</p>
            <div>
              <vue-json-pretty
                :deep=0
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
          v-bind:title="presentation_title(presentation)"
          :name="presentation.presentation_exchange_id"
          :key="presentation.presentation">
          <el-row :key="presentation.presentation">
            <p>Connected to: {{connection_details[presentation.connection_id].label}}</p>
            <p>Presentation Exchange ID: {{presentation.presentation_exchange_id}}</p>
            <p>Connection ID: {{presentation.connection_id}}</p>
            <p>Role: {{presentation.role}}</p>
            <div>
              <vue-json-pretty
                :deep=0
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
          v-bind:title="presentation_title(presentation)"
          :name="presentation.presentation_exchange_id"
          :key="presentation.presentation">
          <el-row :key="presentation.presentation">
            <p>Connected to: {{connection_details[presentation.connection_id].label}}</p>
            <p>Presentation Exchange ID: {{presentation.presentation_exchange_id}}</p>
            <p>Connection ID: {{presentation.connection_id}}</p>
            <p>Role: {{presentation.role}}</p>
            <div>
              <vue-json-pretty
                :deep=0
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
          v-bind:title="presentation_title(presentation)"
          :name="presentation.presentation_exchange_id"
          :key="presentation.presentation">
          <el-row :key="presentation.presentation">
            <p>Connected to: {{connection_details[presentation.connection_id].label}}</p>
            <p>Presentation Exchange ID: {{presentation.presentation_exchange_id}}</p>
            <p>Connection ID: {{presentation.connection_id}}</p>
            <p>Role: {{presentation.role}}</p>
            <div>
              <vue-json-pretty
                :deep=0
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
              :label="connection.label"
              :value="connection.connection_id">
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
          v-for="(attribute, index) in proposalForm.attributes"
          :label="'Attribute ' + index"
          :label-width="formLabelWidth"
          :key="'attribute_' + index"
          class="additions">
          <el-select
            v-model="proposalForm.attributes[index].cred_def"
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
          <el-input
            v-model="proposalForm.attributes[index].value"
            placeholder="Attribute Value">
            <el-select
              slot="prepend"
              v-if="proposalForm.attributes[index].cred_def != null"
              v-model="proposalForm.attributes[index].name"
              placeholder="Attribute Name"
              style="width: 100px;">
              <el-option
                v-for="(attribute, index) in proposalForm.attributes[index].cred_def.attributes"
                :key="'attribute_name_' + index"
                :label="attribute"
                :value="attribute"></el-option>
            </el-select>
            <el-button
              slot="append"
              icon="el-icon-close"
              @click="remove_attribute(index)"></el-button>
          </el-input>
        </el-form-item>

        <el-divider v-if="proposalForm.predicates.length > 0 && proposalForm.attributes.length > 0"></el-divider>

        <!-- Dynamic Predicates -->
        <el-form-item
          v-for="(predicate, index) in proposalForm.predicates"
          :label="'Predicate ' + index"
          :label-width="formLabelWidth"
          :key="'predicate_' + index"
          class="additions">
          <el-select
            v-model="proposalForm.predicates[index].cred_def"
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
          <el-input
            v-model="proposalForm.predicates[index].threshold"
            placeholder="Threshold">
            <el-select
              slot="prepend"
              v-if="proposalForm.predicates[index].cred_def != null"
              v-model="proposalForm.predicates[index].name"
              placeholder="Attribute Name"
              style="width: 100px;">
              <el-option
                v-for="(attribute, index) in proposalForm.predicates[index].cred_def.attributes"
                :key="'predicate_name_' + index"
                :label="attribute"
                :value="attribute"></el-option>
            </el-select>
            <el-select
              v-model="proposalForm.predicates[index].predicate"
              slot="prepend"
              placeholder="Type"
              class="ptype"
              style="width: 100px;">
              <el-option
                v-for="opt in p_type_options"
                :key="opt"
                :label="opt"
                :value="opt"></el-option>
            </el-select>
            <el-button
              slot="append"
              icon="el-icon-close"
              @click="remove_predicate(index)"></el-button>
          </el-input>
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
        <el-button type="primary" @click="send">Send</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';

export default {
  name: 'presentation',
  props: [
    'title',
    'presentations',
    'connections',
    'cred_defs',
    'connection_details'
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
        connection_id: '', // Who
        comment: '', // Optional comment
        attributes: [ ],
        predicates: [ ]
      },
      formLabelWidth: '100px',
      p_type_options: ['>', '<', '>=', '<=']
    }
  },
  methods: {
    send: function() {
      let values = {
        connection_id: this.proposalForm.connection_id,
        comment: this.proposalForm.comment,
        attributes: this.proposalForm.attributes,
        predicates: this.proposalForm.predicates,
        auto_present: true
      }
      this.proposalFormActive = false;

      this.proposalForm.connection_id = '';
      this.proposalForm.comment = '';
      this.proposalForm.attributes = [];
      this.proposalForm.predicates = [];

      this.$emit('send-presentation-proposal', values);
      
    },
    presentation_title: function(pres) {
      let presentation_details = '';
      let connection = this.connection_details[pres.connection_id];
      let title= "";
      if (connection && connection.label) {
        title += `Sent to ${connection.label}`
      } else {
        title += 'Unknown'
      }
      if (!pres.comment) {
        presentation_details = pres.presentation_exchange_id;
      } else {
        presentation_details = pres.comment;
      }
      return `${title}: ${presentation_details}`;
    },
    add_attribute: function() {
      this.proposalForm.attributes.push({
        name: '',
        cred_def: null,
        value: '',
      });
    },
    remove_attribute: function(index) {
      this.proposalForm.attributes.splice(index, 1);
    },
    add_predicate: function() {
      this.proposalForm.predicates.push({
        name: '',
        cred_def: null,
        predicate: '',
        threshold: '',
      });
    },
    remove_predicate: function(index) {
      this.proposalForm.predicates.splice(index, 1);
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
      return this.presentations.filter(pres_exch => pres_exch.state === 'verified');
    },
    VerifiedPresentations() {
      console.log('PRESENTATIONS', this.presentations);
      return this.presentations.filter(
        exchange =>
        (
          "state" in exchange &&
          (
            exchange.state === "verified" ||
            exchange.state === "presentation_acked"
          )
        ) &&
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
    }
  }
}
</script>
