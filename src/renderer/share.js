import Vue from 'vue';
import message_bus from '@/message_bus.js';

const SHARED_PROPERTIES = {
    dids: {},
    public_did: '',
    trusted_issuers: [],
    issuer_presentations:[],
    holder_presentations: [],
    issued_credentials: [],
    holder_credentials: [],
    schemas: [],
    cred_defs: [],
    protocols: []
};

const COMPUTED_PROPERTIES = {
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

export function Share(data = {}, computed = {}, methods = {}) {
    return new Vue({
        data: function() {
            return {
                ...SHARED_PROPERTIES,
                ...data
            };
        },
        computed: {
            ...COMPUTED_PROPERTIES,
            ...computed
        },
        methods: {
            ...methods,
            mutate(subject, data) {
                this[subject] = data;
            },
        },
    });
}

export function share_source(modules) {
    let data = {};
    let computed = {};
    let listeners = {};
    let methods = {};
    modules.forEach((module) => {
        data = {
            ...data,
            ...module.data
        };
        computed = {
            ...computed,
            ...module.computed
        };
        listeners = {
            ...listeners,
            ...module.listeners
        };
        methods = {
            ...methods,
            ...module.methods
        };
    });
    let mutated_methods = Object.keys(methods).reduce((acc, action) => {
        acc[action] = function(...data) {
            methods[action]({
                share: this,
                message_bus: this.message_bus,
                send: (msg) => this.message_bus.$emit('send-message', msg)
            }, ...data);
        };
        return acc;
    }, {});
    return {
        beforeCreate: function() {
            this.$share = Share(data, computed, mutated_methods);
            this.$share.message_bus = this.$message_bus;
        },
        created: function() {
            Object.keys(listeners).forEach((event) => {
                share_event_listener(
                    this.$share,
                    this.$message_bus,
                    event,
                    listeners[event]
                );
            });
        },
    }
}

export default function(options = {use: [], use_mut: [], actions: []}) {
    let properties = [];
    let actions = [];
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
        if (options && options.actions) {
            actions = options.actions;
        }
    }
    return {
        beforeCreate: function() {
            function derive(component) {
                if (component.$share) {
                    let share = component.$share;
                    // Assume conection is on share source
                    // TODO better handling here
                    share.loaded = component.connection_loaded;
                    return component.$share;
                }
                if (component.$parent) {
                    return derive(component.$parent);
                }
                return undefined;
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
        methods: {
            ...actions.reduce((acc, action) => {
                acc[action] = function(...data) {
                    return this.$share[action](...data);
                }
                return acc;
            }, {}),
            ready: async function() {
                await this.$share.loaded;
            }
        },
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
