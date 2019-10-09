<template >
  <div>
    <p>{{ title }}</p>
    <el-collapse v-model="expanded_items">
      <div v-for="(item, index) in items" :key="items[index][obj_key]"> >
        <el-collapse-item v-bind:title="item[title_key]" :name="item[obj_key]">
          <el-row>
            <div>
              <vue-json-pretty
                :deep=1
                :data="item">
              </vue-json-pretty>
              <el-form :model="updateForm[index]" class="'update-connection'">
                <el-form-item label="Role:" prop="their_role">
                  <el-input placeholder="updateForm[index].their_role" v-model="updateForm[index].their_role" style="width:300px;"></el-input>
                </el-form-item>
                <el-form-item label="Label:" prop="their_label">
                  <el-input placeholder="updateForm[index].their_label" v-model="updateForm[index].their_label" style="width:300px;"></el-input>
                  <br/><el-button type="primary" @click="updateAgentConnection(connection)">update</el-button>
                  <el-button type="primary" @click="deleteAgentConnection(connection)">delete</el-button>
                </el-form-item>
                <el-button v-on:click="collapse_expanded_item(index)">^</el-button>
              </el-form>
            </div>
          </el-row>
        </el-collapse-item>
      </div>
    </el-collapse>
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';

export default {
  name: 'collapse-list',
  props: [ 'items', 'title_key', 'obj_key'],
  components: {
    VueJsonPretty,
  },
  methods: {
    collapse_expanded_item(index){
        this.exspanded_items.splice(index, 1);
    },
  },
  data () { 
    return {
      'exspanded_items':[],
      'updateForm':this.items,
    }
  },
  computed: {
  },
  watch: {
    list: function(){ 
      this.updateForm = this.items
    }
  }
}
</script>
