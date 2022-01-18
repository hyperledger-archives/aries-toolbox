<template >
  <!-- TODO: Split this into more files? -->
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">{{ title }}</a>
      <el-button
        type="primary"
        icon="el-icon-plus"
        @click="requestFormActive = true">Request Presentation</el-button>
      <el-button
        type="primary"
        icon="el-icon-refresh"
        @click="$emit('verification-refresh',)"></el-button>
    </nav>
    <el-collapse v-model="expanded_items">
        <el-collapse-item
          v-for="presentation in presentations"
          :name="presentation.presentation_exchange_id"
          :key="presentation.presentation_exchange_id">
          <template slot="title">
            <i v-bind:class="presentation.verified ? 'el-icon-success verified' : 'el-icon-circle-close verified'"></i> {{presentation_title(presentation)}}
          </template>
          <el-row>
            <ul>
              <li><strong>Requested from:</strong> {{presentation.connection_their_label}} ({{presentation.connection_id}})</li>
              <li><strong>Presentation Exchange ID:</strong> {{presentation.presentation_exchange_id}}</li>
              <li><strong>State:</strong> {{presentation.state}}</li>
              <li><strong>Verified:</strong> {{presentation.verified ? presentation.verified : false}}</li>
              <li><strong>Created at:</strong> {{presentation.created_at}}</li>
              <li v-if="presentation.presentation"><strong>Revealed Attributes:</strong> <attributes class="attributes" :values="revealedAttributes(presentation)"></attributes></li>
              <li v-if="presentation.presentation"><strong>Predicates:</strong> <attributes :list="predicates(presentation)" inline></attributes></li>
            </ul>
            <div>
              <vue-json-pretty
                :deep=2
                :data="presentation">
              </vue-json-pretty>
            </div>
            <el-button v-on:click="collapse_expanded(presentation)">^</el-button>
          </el-row>
        </el-collapse-item>
    </el-collapse>
    <el-dialog title="Request Presentation" :visible.sync="requestFormActive">
      <el-form :model="requestForm">
        <!-- Connection -->
        <el-form-item label="Connection:" :label-width="formLabelWidth">
          <el-select
            v-model="requestForm.connection_id"
            no-data-text="No active connections"
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

        <el-form-item label="Name:" :label-width="formLabelWidth">
          <el-input
            v-model="requestForm.name"
            placeholder="Proof Request Name"></el-input>
        </el-form-item>

        <!-- Comment -->
        <el-form-item
          label="Comment:"
          :label-width="formLabelWidth">
          <el-input
            v-model="requestForm.comment"
            placeholder="Optional Comment"
            type="textarea"></el-input>
        </el-form-item>

        <!-- Dynamic Attributes -->
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
          <el-form-item  label="Restrictions:" class="restrictions">
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
        <el-button @click="requestFormActive = false">Cancel</el-button>
        <el-button type="primary" @click="send">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style>
.ptype {
  width: 75px;
}
.additions .el-input {
  margin-bottom: .5em;
}
.restrictions {
  margin-top: .5em;
}
.restrictions .el-select {
  margin-bottom: .5em;
}
i.verified {
  margin-right: .25em;
  font-size: 1.5em;
}
.attributes {
  margin-left: 2em;
}
</style>

<script>
import VueJsonPretty from 'vue-json-pretty';
import Attributes from '../CredentialIssuance/Attributes.vue';
import share from '@/share.js';

export default {
  name: 'verification',
  props: [
    'title',
    'list',
    'editable',
    'connections',
    'cred_defs',
  ],
  mixins: [share({use: ['id_to_connection']})],
  components: {
    VueJsonPretty,
    Attributes,
  },
  data () {
    return {
      expanded_items:[],
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
          //     "cred_def_id": "asdf", etc.
          //   }
          // }

          /*
          {
            "name": "attribute_name",
            "cred_def_id":"",
            "mime_type":"",
            "value": ""
          }
          */
        ],
        predicates: [
          // Key: (can be whatever) property name,
          // {
          //   "name": "attribute_name",
          //   "p_type": ">=",
          //   "p_value": 18,
          //   "restrictions": {
          //     "cred_def_id": "asdf", etc.
          //   }
          // }
        ],
        presentation_predicates:[
          /**
           *{
           *  "name": "",
           *  "cred_def_id": "",
           *  "predicate": "",
           *  "threshold": "",
           *}
           */
        ]
      },
      formLabelWidth: '100px',
      p_type_options: ['>', '<', '>=', '<=']
    }
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
    presentations: function() {
        return this.list.map((item) => {
          if (item.connection_id in this.id_to_connection) {
            item.connection_their_label = this.id_to_connection[item.connection_id].label;
          } else {
            item.connection_their_label = "deleted connetion"
          }
          if ('presentation' in item && 'proof' in item.presentation) {
            delete item.presentation.proof;
          }
          return item;
        });
      },
    completed_verifications: function() {
      return this.list.filter(pres_exch => pres_exch.state === 'verified');
    }
  },
  methods: {
    presentation_title: function(presentation) {
      return presentation.presentation_request.name + ': Requested from ' + presentation.connection_their_label;
    },
    collapse_expanded: function(creddef) {
      this.expanded_items = this.expanded_items.filter(
        item => item != creddef.presentation_exchange_id
      );
    },
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
          cred_def: undefined
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
        },
      });
    },
    remove_predicate: function(index) {
      this.requestForm.predicates.splice(index, 1);
    },
    revealedAttributes: function(presentation) {
      const attrs = presentation.presentation.requested_proof.revealed_attrs;
      return Object.keys(attrs).map(attr => ({name: attr, value: attrs[attr].raw}))
    },
    predicates: function(presentation) {
      let preds = presentation.presentation_request.requested_predicates
      return Object.values(preds).map(pred => `${pred.name} ${pred.p_type} ${pred.p_value}`)
    }
  }
}
</script>
