<template>
  <div id="wrapper" class="container-fluid">

    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">Connection Base</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
    </nav>

  <p>Base for connection: {{name}}.</p>


  </div>
</template>

<script>

  export default {
    name: 'connection-base',
    components: {  },
    methods: {

    },
    data() {
      return {
        'name': this.$route.query.a
      }
    }
  }
</script>

<style>
</style>
