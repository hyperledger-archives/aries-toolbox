import Vue from 'vue';
const uuidv4 = require('uuid/v4');

export default function() {
    Vue.message_bus = {};
    Vue.getMessageBus = function(key) {
        if (!(key in Vue.message_bus)) {
            Vue.message_bus[key] = new Vue();
        }
        return Vue.message_bus[key];
    };
    Vue.mixin({
        beforeCreate: function() {
            const options = this.$options;
            if (options.message_bus) {
                if (options.message_bus === 'source') {
                    this.$message_bus = Vue.getMessageBus(uuidv4().toString());
                } else if (options.message_bus == 'derive') {
                    function derive(component) {
                        if (component.$message_bus) {
                            console.log('Found message bus on component:', component);
                            return component.$message_bus;
                        }
                        if (component.$parent) {
                            return derive(component.$parent);
                        }
                        return undefined;
                    }
                    let message_bus = derive(options.parent);
                    if (!message_bus) {
                        console.error('Could not derive message bus from parent tree');
                    }
                    this.$message_bus = message_bus;
                } else {
                    console.error('Unrecognized message bus option:', options.message_bus);
                }
            }
        }
    });
}
