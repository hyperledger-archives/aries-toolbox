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
                    component: require('@/components/Dids/Dids').default
                },
                {
                    path: 'invitations',
                    name: 'invitations',
                    component: require('@/components/Invitations/Invitations').default
                },
                {
                    path: 'connections',
                    name: 'connections',
                    component: require('@/components/Connections/Connections').default
                },
                {
                    path: 'static-connections',
                    name: 'static-connections',
                    component: require('@/components/StaticConnections/StaticConnections').default
                },
                {
                    path: 'credential-issuance',
                    name: 'credential-issuance',
                    component: require('@/components/CredentialIssuance/CredentialIssuance').default
                },
                {
                    path: 'trusted-issuers',
                    name: 'trusted-issuers',
                    component: require('@/components/TrustedIssuers/TrustedIssuers').default
                },
                {
                    path: 'my-credentials',
                    name: 'my-credentials',
                    component: require('@/components/MyCredentials/MyCredentials').default
                },
                {
                    path: 'presentations',
                    name: 'presentations',
                    component: require('@/components/Presentations/Presentations').default
                },
                {
                    path: 'verifications',
                    name: 'verifications',
                    component: require('@/components/Verifications/Verifications').default
                },
                {
                    path: 'feature-discovery',
                    name: 'feature-discovery',
                    component: require('@/components/FeatureDiscovery/FeatureDiscovery').default
                },
                {
                    path: 'compose',
                    name: 'compose',
                    component: require('@/components/Compose/Compose').default
                },
                {
                    path: 'message-history',
                    name: 'message-history',
                    component: require('@/components/MessageHistory/MessageHistory').default
                },
                {
                    path: 'basic-message',
                    name: 'basic-message',
                    component: require('@/components/BasicMessage/BasicMessage').default
                },
            ]
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
})
