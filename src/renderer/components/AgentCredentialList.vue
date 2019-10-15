<template >
  <div v-if="true">
    <el-collapse v-model="expanded_items">
      <ul class="list">
        <el-collapse-item
          v-for="credential in list"
          v-bind:title="credential.credential_exchange_id"
          :name="credential.credential_exchange_id"
          :key="credential.credential_exchange_id">
          <el-row>
            <div>
              <vue-json-pretty
                :deep=1
                :data="credential">
              </vue-json-pretty>
            </div>
            <el-button v-on:click="collapse_expanded(credential)">^</el-button>
          </el-row>
        </el-collapse-item>
      </ul>
    </el-collapse>
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';

export default {
  name: 'credential-list',
  props: [ 'title', 'list' ],
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
      formLabelWidth: '100px'
    }
  },
  methods: {
    collapse_expanded: function(credential){
      this.expanded_items = this.expanded_items.filter(
        item => item != credential.credential_exchange_id
      );
    },
  }
}
</script>
