import Vue from 'vue';

const SHARED_PROPERTIES = {
    connections: [],
    dids: {},
    public_did: '',
    trusted_issuers: [],
    issuer_presentations:[],
    holder_presentations: [],
    cred_defs: [],
};

const COMPUTED_PROPERTIES = {
    active_connections: function() {
      return Object.values(this.connections).filter(
        conn => "state" in conn && conn.state === "active"
      );
    }
}

export default function(property_list) {
    return{
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
        computed: property_list.reduce(
            (acc, prop) => {
                acc[prop] = subscribe(prop);
                return acc;
            },
            {}
        )
    };
}

export function subscribe(subject) {
    return {
        get: function() {
            return this.$share[subject];
        },
        set: function(data) {
            this.$share.mutate(subject, data);
        }
    }
}
