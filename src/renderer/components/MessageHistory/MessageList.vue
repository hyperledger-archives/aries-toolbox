<template>
  <el-row>
    <div class="message-display" v-for="m in messages.slice().reverse()" :key="m.msg['@id']">
      <i>{{m.direction}}</i>
      <vue-json-pretty
        :deep=1
        :data="m.msg">
      </vue-json-pretty>
    </div>
  </el-row>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

export default {
  name: 'message-list',
  components: {
    VueJsonPretty
  },
  props: [
    "messages"
  ]
}
</script>
