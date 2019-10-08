<template v-if="list.length">
  <div>
    <p>{{ title }}</p>
    <el-collapse v-model="exspanded_active_connection_items">
      <div v-for="connection in list"><!-- - Connections (state == active) -->
        <el-collapse-item v-bind:title="connection[itemlabel]" :name="connection.connection_id">
          <el-row>
            <div>
              <vue-json-pretty
                :deep=1
                :data="connection">
              </vue-json-pretty>
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
  name: 'agent-connection-list',
  props: ['title', 'list', 'itemlabel'],
  components: {
    VueJsonPretty,
  }
}
</script>
