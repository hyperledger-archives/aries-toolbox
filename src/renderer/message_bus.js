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

export default function() {
    return {
        beforeCreate: function() {
            function derive(component) {
                if (component.$message_bus) {
                    console.log('Found message bus on component:', component);
                    return component.$message_bus;
                }
                if (component.$parent) {
                    return derive(component.$parent);
                }
                return new Vue();
            }
            this.$message_bus = derive(this);
        }
    };
}
