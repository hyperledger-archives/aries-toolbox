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

const wait_for = (prom, time) => {
	let timer;
	return Promise.race([
		prom,
		new Promise((_r, rej) => timer = setTimeout(rej, time))
	]).finally(() => clearTimeout(timer));
}

/**
 * Vue Component Mixin for adding a message bus, accessed through
 * "$message_bus", a send_message method for trigger a new DIDComm message to
 * be sent, and a listen method for subscribing to an event through the message
 * bus.
 * @param {object} options - Object with nested events object where the key is
 * an event to subscribe to and the value is the function to run when that
 * event is triggered. Event functions are passed the current Vue object
 * (this), and any data emitted with the event.
 */
export default function(options = {}) {
  return {
    beforeCreate: function() {
      /**
       * Look in this components Vue heirarchy for a defined message bus.
       */
      function derive(component) {
        if (component.$message_bus) {
          console.log('Found message bus on component:', component);
          return component.$message_bus;
        }
        if (component.$parent) {
          return derive(component.$parent);
        }
        console.log('Creating new message bus.');
        return new Vue();
      }
      this.$message_bus = derive(this);
    },
    created: function() {
      if (options && options.events) {
        Object.keys(options.events).forEach((event) => {
          this.$message_bus.$on(event, (...data) => {
            options.events[event](this, ...data);
          });
        });
      }
    },
    methods: {
      send_message: function(message) {
        this.$message_bus.$emit('send-message', message);
      },
      listen: function(event, listener) {
        this.$message_bus.$on(event, (data) => {
          listener(this, data);
        });
      },
      message_of_type: function(type, timeout) {
        const promise = new Promise((resolve, _reject) => {
          this.$message_bus.$once(type, (msg) => {
            resolve(msg);
          });
        });
        if (timeout != null) {
          return wait_for(promise, timeout);
        } else {
          return promise;
        }
      }
    }
  };
}
