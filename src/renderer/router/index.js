import Vue from 'vue'
import Router from 'vue-router'
import components from '../components/components.js';

Vue.use(Router)

let agent_routes = Object.entries(components).map(([modulename, module]) => ({
  path: module.default.name,
  name: module.default.name,
  component: require('@/components/' + modulename).default
}));

/*
each agent component is listed like this
{
    path: 'dids',
    name: 'dids',
    component: require('@/components/Dids').default
},
*/

export default new Router({
    routes: [
        {
            path: '/',
            name: 'agent-list',
            component: require('@/components/AgentList').default
        },
        {
            path: '/agent/:agentid/',
            //redirect: '/agent/:agentid/dids', //TODO: Needs to point to a screen not dependant on a protocol
            component: require('@/components/AgentBase').default,
            props: true,
            children: agent_routes, //calculated above
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
})
