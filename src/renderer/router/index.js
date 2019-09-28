import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'connection-list',
      component: require('@/components/ConnectionList').default
    },
    {
      path: '/agent/:agentid/',
      name: 'agent-base',
      component: require('@/components/Agent/AgentBase').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
