const state = {
    schemas:[
        {'name':'BasicID','version':'1.9','attributes':['first_name','last_name','company','type']}
    ]
}

const mutations = {
    ADD_SCHEMA(state, schema){
        console.log("CREATE_SCHEMA")
        console.log("new schema: ", schema)
        console.log("current schemas: ", state.schemas)
        state.schemas = [...state.schemas,schema];
    }
}
const actions = {
    ADD_SCHEMA({commit},name,version,attributes){
        var schema = {
            'name': name,
            'version':version,
            'attributes':attributes
        }    
        commit("ADD_SCHEMA",schema)
    }
}

export default {
    state,
    mutations,
    actions
}
