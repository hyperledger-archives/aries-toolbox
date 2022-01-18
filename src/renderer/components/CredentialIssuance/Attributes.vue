<template>
  <div v-if="!inline && !values">
    {{joined}}
  </div>
  <span v-else-if="!values">
    {{joined}}
  </span>
  <div v-else-if="!inline && values">
    <ul>
      <li v-for="value in values" :key="value.name"><strong>{{value.name}}:</strong> {{value.value}}</li>
    </ul>
  </div>
</template>
<script>
export default {
  name: "attributes",
  props: {
    list: Array,
    values: Array,
    inline: Boolean,
  },
  computed: {
    joined: function() {
      return this.list.join(', ')
    }
  }
}
</script>
