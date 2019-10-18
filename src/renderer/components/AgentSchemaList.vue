<template >
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">{{ title }}</a>
      <el-input
        v-model="retrieve_schema_id"
        style="width: 300px;">
        <el-button
          slot="append"
          icon="el-icon-search"
          @click="retrieve">Retrieve</el-button>
      </el-input>
      <el-button
        type="primary"
        icon="el-icon-plus"
        @click="createFormActive = true">Create</el-button>
      <el-button
        type="primary"
        icon="el-icon-refresh"
        @click="$emit('schema-refresh',)"></el-button>
    </nav>
    <el-collapse v-model="expanded_items">
      <ul class="list">
        <el-collapse-item
          v-for="schema in list"
          v-bind:title="schema.schema_name+' '+schema.schema_version"
          :name="schema.schema_id"
          :key="schema.schema_id">
          <el-row>
            <div>
              <vue-json-pretty
                :deep=1
                :data="schema">
              </vue-json-pretty>
            </div>
            <el-button v-on:click="collapse_expanded(schema)">^</el-button>
          </el-row>
        </el-collapse-item>
      </ul>
    </el-collapse>
    <el-dialog title="Create New Schema" :visible.sync="createFormActive">
      <el-form :model="createForm">
        <el-form-item label="Name:" :label-width="formLabelWidth">
          <el-input v-model="createForm.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="Version:" :label-width="formLabelWidth">
          <el-input v-model="createForm.version" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          v-for="(attribute, index) in createForm.attributes"
          :label="'Attribute ' + index"
          :label-width="formLabelWidth"
          :key="index">
          <el-input
            v-model="createForm.attributes[index]"
            label="'Attribute ' + index">
            <el-button
              slot="append"
              icon="el-icon-close"
              @click="remove_attribute(index)"></el-button>
          </el-input>
        </el-form-item>
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="add_attribute">Add attribute</el-button>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createFormActive = false">Cancel</el-button>
        <el-button type="primary" @click="create">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';

export default {
  name: 'agent-schema-list',
  props: ['title', 'list','editable'],
  components: {
    VueJsonPretty,
  },
  data () {
    return {
      expanded_items:[],
      createFormActive: false,
      createForm: {
        name: '',
        version: '',
        attributes: [],
      },
      retrieve_schema_id: '',
      formLabelWidth: '100px'
    }
  },
  methods: {
    collapse_expanded: function(schema){
      this.expanded_items = this.expanded_items.filter(
        item => item != schema.schema_id
      );
    },
    add_attribute: function() {
      this.createForm.attributes.push('');
    },
    remove_attribute: function(index) {
      this.createForm.attributes.splice(index, 1);
    },
    create: function() {
      let values = {
        name: this.createForm.name,
        version: this.createForm.version,
        attributes: this.createForm.attributes
      }
      this.createForm.name = '';
      this.createForm.version = '';
      this.createForm.attributes = [];
      this.$emit('schema-send', values);
      this.createFormActive = false;
    },
    retrieve: function() {
      this.$emit('schema-get', this.retrieve_schema_id);
      this.retrieve_schema_id = '';
    }
  }
}
</script>
