import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'agent-list',
      component: require('@/components/AgentList').default
    },
    {
      path: '/agent/:agentid/',
      name: 'agent-base',
      component: require('@/components/AgentBase').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
