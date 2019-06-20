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

    <div class="card" style="" v-for="a in agents">
      <div class="card-body">
        <h5 class="card-title">{{a.name}}</h5>
        <a href="#" class="card-link" v-on:click="openConnection(a)">Connect</a>
        <a href="#" class="card-link">Edit</a>
      </div>
    </div>


  </div>
</template>

<script>
  const electron = require('electron')

  export default {
    name: 'connection-list',
    components: {  },
    methods: {
      openConnection: function(a) {
        const modalPath = process.env.NODE_ENV === 'development'
          ? 'http://localhost:9080/#/base?a='+a.name
          : `file://${__dirname}/index.html#base?a=`+a.name;
        let win = new electron.remote.BrowserWindow({ width: 400, height: 320, webPreferences: {webSecurity: false} })
        win.on('close', function () { win = null });
        win.loadURL(modalPath)

      }
    },
    data() {
      return {
        agents: [
          {
            'name': 'Alice Agent'
          },
          {
            'name': 'Bob Agent'
          }
        ]
      }

    }
  }
</script>

<style>
</style>
