<template>
  <div id="wrapper" class="container-fluid">

    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">Agent Toolkit</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" href="#">New Connection</a>
          </li>
        </ul>
      </div>
    </nav>

    <div class="card" style="">
      <div class="card-body">
        <h5 class="card-title">Alice Agent</h5>
        <a href="#" class="card-link">Connect</a>
        <a href="#" class="card-link">Edit</a>
      </div>
    </div>
    <div class="card" style="">
      <div class="card-body">
        <h5 class="card-title">Bob Agent</h5>
        <a href="#" class="card-link">Connect</a>
        <a href="#" class="card-link">Edit</a>
      </div>
    </div>

  </div>
</template>

<script>

  export default {
    name: 'connection-list',
    components: {  },
    methods: {

    }
  }
</script>

<style>
</style>
