<template >
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">{{ title }}</a>
      <el-button
        type="primary"
        icon="el-icon-plus"
        @click="turstedDidFormActive = true">Add Trusted Issuer Did</el-button>
    </nav>

    <el-collapse v-model="expanded_items">
      <ul class="list">
        <el-collapse-item
          v-for="did in trusted_issuers"
          v-bind:title="did.label"
          :name="did.id"
          :key="did.id">
          <el-row :key="did.id">
            <div>
              <vue-json-pretty
                :deep=2
                :data="did">
              </vue-json-pretty>
            </div>
            <el-button type="danger" @click="removeTrustedIssuer(did)">Delete</el-button>
          </el-row>
        </el-collapse-item>
      </ul>
    </el-collapse>

    <el-dialog title="Add Trusted Issuer" :visible.sync="turstedDidFormActive">
        <el-form :model="trusted_issuers_form">
            <el-form-item label="did:" :label-width="formLabelWidth">
                <el-input v-model="trusted_issuers_form.id" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="label:" :label-width="formLabelWidth">
                <el-input v-model="trusted_issuers_form.label" autocomplete="off"></el-input>
            </el-form-item>
        </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="turstedDidFormActive = false">Cancel</el-button>
        <el-button type="primary" @click="storeTrustedIssuer">storeTrustedIssuer</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';

export default {
  name: 'agent-trust',
  props: [
    'title',
    'trusted_issuers',
    ],
  components: {
    VueJsonPretty,
  },
  data () {
    return {
      expanded_items:[],
      turstedDidFormActive: false,
      trusted_issuers_form:{
        'id':'',
        'label':'',
      },
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
    collapse_expanded: function(did){
      this.expanded_items = this.expanded_items.filter(
        item => item != did.id
      );
    },
    removeTrustedIssuer: function(did) {
      this.$emit('remove-did', did);
      this.turstedDidFormActive = false;
    },
    storeTrustedIssuer: function() {
      this.$emit('store-did', 
        {
          'id':this.trusted_issuers_form.id,
          'label':this.trusted_issuers_form.label
        }
      );
      this.trusted_issuers_form.id = ""
      this.trusted_issuers_form.label = ""
      this.turstedDidFormActive = false;
    },
  },
  computed: {}
}
</script>
