<template >
  <div v-if="list.length">
    <p>{{ title }}</p>
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
      editFormActive: false,
      editForm: {
        schema_id: '',
        name: '',
        version: '',
        attributes: [],
      },
      formLabelWidth: '100px'
    }
  },
  methods: {
    collapse_expanded: function(schema){
      this.expanded_items = this.expanded_items.filter(
        item => item != schema.schema_id
      );
    },
  }
}
</script>
