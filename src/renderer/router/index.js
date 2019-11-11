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
            component: require('@/components/AgentBase').default,
            children: [
                {
                    path: 'dids', // Default path
                    name: 'dids',
                    component: require('@/components/Dids').default
                },
                {
                    path: 'invitations',
                    name: 'invitations',
                    component: require('@/components/Invitations').default
                },
                {
                    path: 'connections',
                    name: 'connections',
                    component: require('@/components/Connections').default
                },
                {
                    path: 'static-connections',
                    name: 'static-connections',
                    component: require('@/components/StaticConnections').default
                },
                {
                    path: 'credential-issuance',
                    name: 'credential-issuance',
                    component: require('@/components/CredentialIssuance').default
                },
                {
                    path: 'trusted-issuers',
                    name: 'trusted-issuers',
                    component: require('@/components/TrustedIssuers').default
                },
                {
                    path: 'my-credentials',
                    name: 'my-credentials',
                    component: require('@/components/MyCredentials').default
                },
                {
                    path: 'presentations',
                    name: 'presentations',
                    component: require('@/components/Presentations').default
                },
                {
                    path: 'verifications',
                    name: 'verifications',
                    component: require('@/components/Verifications').default
                },
                {
                    path: 'feature-discovery',
                    name: 'feature-discovery',
                    component: require('@/components/FeatureDiscovery').default
                },
                {
                    path: 'compose',
                    name: 'compose',
                    component: require('@/components/Compose').default
                },
                {
                    path: 'message-history',
                    name: 'message-history',
                    component: require('@/components/MessageHistory').default
                },
                {
                    path: 'basic-message',
                    name: 'basic-message',
                    component: require('@/components/BasicMessage').default
                },
            ]
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
})
