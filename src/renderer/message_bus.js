/* Message Bus Vue Plugin
 * ======================
 * This Vue plugin adds `$message_bus` attributes to Vue components specifying
 * the `message_bus` option. Values of this option can either be `source` or
 * `derive`. `source` will create a new message bus and make that component the
 * primary holder of the message bus. `derive` will look in the components
 * parent heirarchy for a defined message bus and use the first found message
 * bus.
 */

import Vue from 'vue';
const uuidv4 = require('uuid/v4');

export default function() {
    Vue.message_bus_directory = {};
    Vue.getMessageBus = function(key) {
        if (!(key in Vue.message_bus_directory)) {
            Vue.message_bus_directory[key] = new Vue();
        }
        return Vue.message_bus_directory[key];
    };
    Vue.mixin({
        beforeCreate: function() {
            const options = this.$options;
            if (options.message_bus) {
                if (options.message_bus === 'source') {
                    this.$message_bus = Vue.getMessageBus(uuidv4().toString());
                } else if (options.message_bus === 'derive') {
                    // Recursively find a message bus in parent heirarchy.
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
                        message_bus = {
                            $on: function () {
                                console.error('A message_bus could not be derived on this component. Make sure message bus "source" has been specified in this components parent tree.')
                            },
                            $emit: function() {
                                console.error('A message_bus could not be derived on this component. Make sure message bus "source" has been specified in this components parent tree.')
                            }
                        }
                    }
                    this.$message_bus = message_bus;
                } else {
                    console.error('Unrecognized message bus option:', options.message_bus);
                }
            } else {
                // Gaurdrails to assist agent component developers.
                this.$message_bus = {
                    $on: function () {
                        console.error('The `message_bus` option on this component was not specified. Add `message_bus: "[source|derive],"` to your options.')
                    },
                    $emit: function() {
                        console.error('The `message_bus` option on this component was not specified. Add `message_bus: "[source|derive],"` to your options.')
                    }
                };
            }
        }
    });
}
