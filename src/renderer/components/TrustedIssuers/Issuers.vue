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
          v-for="issuer in trusted_issuers"
          v-bind:title="issuer.label"
          :name="issuer.did"
          :key="issuer.did">
          <el-row :key="issuer.did">
            <div>
              <vue-json-pretty
                :deep=2
                :data="issuer">
              </vue-json-pretty>
            </div>
            <el-button type="danger" @click="removeTrustedIssuer(issuer)">Delete</el-button>
          </el-row>
        </el-collapse-item>
      </ul>
    </el-collapse>

    <el-dialog title="Add Trusted Issuer" :visible.sync="turstedDidFormActive">
        <el-form :model="trusted_issuers_form">
            <el-form-item label="did:" :label-width="formLabelWidth">
                <el-input v-model="trusted_issuers_form.did" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="label:" :label-width="formLabelWidth">
                <el-input v-model="trusted_issuers_form.label" autocomplete="off"></el-input>
            </el-form-item>
        </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="turstedDidFormActive = false">Cancel</el-button>
        <el-button type="primary" @click="storeTrustedIssuer">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';

export default {
  name: 'issuers',
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
        'did':'',
        'label':'',
      },
      formLabelWidth: '200px'
    }
  },
  methods: {
    collapse_expanded: function(issuer){
      this.expanded_items = this.expanded_items.filter(
        item => item != issuer.did
      );
    },
    removeTrustedIssuer: function(issuer) {
      this.$emit('remove-issuer', issuer);
      this.turstedDidFormActive = false;
    },
    storeTrustedIssuer: function() {
      this.$emit('store-issuer', {
        did: this.trusted_issuers_form.did,
        label: this.trusted_issuers_form.label
      });
      this.turstedDidFormActive = false;
      this.trusted_issuers_form.did = ""
      this.trusted_issuers_form.label = ""
    },
  },
}
</script>
