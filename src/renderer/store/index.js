import Vue from 'vue'
import Vuex from 'vuex'

import { createPersistedState, createSharedMutations } from 'vuex-electron'

import modules from './modules'

Vue.use(Vuex)

export default new Vuex.Store({
  namespaced: true,  // ADD THIS LINE
  modules,
  plugins: [
    createPersistedState(),
    //createSharedMutations()
  ],
  strict: process.env.NODE_ENV !== 'production'
})
