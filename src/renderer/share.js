import Vue from 'vue';
import message_bus from '@/message_bus.js';

/**
 * Create a new Share. This shamelessly takes advantage of Vue (as in an actual
 * Vue instance) to get all the fancy observer stuff Vue does (computed values
 * from data, auto-updating UIs).
 * @constructor
 */
export function Share(vm, data = {}, computed = {}, methods = {}) {
    return new Vue({
        data: function() {
            return {
                vm: vm,
                ...data
            };
        },
        computed: computed,
        methods: {
            ...methods,
            mutate(subject, data) {
                this[subject] = data;
            },
        },
    });
}

/**
 * Vue Component Mixin for marking the component as a source for some shared
 * resource.
 *
 * @param {object} modules - Object containing data, computed, methods, and
 * listeners attributes. See components' shared exports for examples.
 * @returns {object} - Mixin object.
 */
export function share_source(modules) {
    let data = {};
    let computed = {};
    // Share can have multiple listeners for the same event name
    // Store a list of key value pairs instead of map
    let listeners = [];
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
        methods = {
            ...methods,
            ...module.methods
        };

        if (module.listeners) {
            let module_listeners_list = Object.keys(module.listeners).map(
                key => ({ event: key, listener: module.listeners[key] })
            );
            listeners.push(...module_listeners_list);
        }
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
            this.$share = Share(this, data, computed, mutated_methods);
            this.$share.message_bus = this.$message_bus;
        },
        created: function() {
            listeners.forEach(({event, listener}) => {
                this.$message_bus.$on(event,
                    (...data) => {
                        listener(this.$share, ...data);
                    });
            });
        },
    }
}

/**
 * Vue Component Mixin for "importing" shared resources into the component.
 * @param {object} options - See component's share mixin call for examples.
 */
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

/**
 * Return computed property getter/setter object used to "subscribe" to a
 * shared resource. Used by default function to make shared objects accessible
 * in Vue Components.
 * @param {string} subject - The name of the shared resource to subscribe to.
 * @param {boolean} mutable - Whether the imported resource should be
 * considered mutable by the subscribing entity.
 */
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
