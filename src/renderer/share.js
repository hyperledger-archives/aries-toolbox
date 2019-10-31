import Vue from 'vue';

const SHARED_PROPERTIES = {
    connections: [],
    dids: {},
    public_did: '',
    trusted_issuers: [],
    issuer_presentations:[],
    issued_credentials: [],
    schemas: [],
    cred_defs: []
};

const COMPUTED_PROPERTIES = {
    active_connections: function() {
        return Object.values(this.connections).filter(
            conn => "state" in conn && conn.state === "active"
        );
    },
    issuer_cred_defs: function() {
        return Object.values(this.cred_defs).filter(
            cred_def => {
                return cred_def.author === 'self' ||
                    cred_def.cred_def_id.split(':', 2)[0] === this.public_did
            }
        );
    },
    proposal_cred_defs: function() {
        return Object.values(this.cred_defs).filter(
            cred_def => {
                return cred_def.author !== 'self' ||
                    cred_def.cred_def_id.split(':', 2)[0] !== this.public_did
            }
        );
    },
}

export default function(options) {
    let properties = [];
    // Flat list (backwards compatibility)
    if (options.constructor === Array) {
        options.forEach((prop) => {
            properties.push({name: prop, mutable: true});
        });
    } else {
        if (options && options.use) {
            options.use.forEach((prop) => {
                properties.push({name: prop, mutable: false});
            });
        }
        if (options && options.use_mut) {
            options.use_mut.forEach((prop) => {
                properties.pus({name: prop, mutable: true});
            });
        }
    }
    return {
        beforeCreate: function() {
            function derive(component) {
                if (component.$share) {
                    return component.$share;
                }
                if (component.$parent) {
                    derive(component.$parent);
                }
                return new Vue({
                    data: function() {
                        return SHARED_PROPERTIES;
                    },
                    methods: {
                        mutate(subject, data) {
                            this[subject] = data;
                        },
                    },
                    computed: COMPUTED_PROPERTIES,
                });
            }
            this.$share = derive(this);
        },
        computed: properties.reduce(
            (acc, prop) => {
                if (prop in COMPUTED_PROPERTIES) {
                    acc[prop.name] = subscribe(prop.name, false);
                    return acc;
                }
                acc[prop.name] = subscribe(prop.name, prop.mutable);
                return acc;
            },
            {}
        ),
        created: function() {
            if (options && options.events) {
                Object.keys(options.events).forEach((event) => {
                    share_event_listener(
                        this.$share,
                        this.$message_bus,
                        event,
                        options.events[event]
                    );
                });
            }
        }
    };
}

export function subscribe(subject, mutable = true) {
    return {
        get: function() {
            return this.$share[subject];
        },
        set: function(data) {
            if (mutable) {
                this.$share.mutate(subject, data);
            } else {
                throw subject + ' is not mutable in this context.'
            }
        }
    }
}

export function share_event_listener(share, message_bus, event, listener) {
    if (!share.listeners) {
        share.listeners = new Set();
    }
    if (share.listeners.has(event)) {
        console.log('Listener already registered for event; skipping. Skipped event:', event);
        return;
    }
    share.listeners.add(event);
    message_bus.$on(event, function(data) {
        listener(share, data);
    });
}
