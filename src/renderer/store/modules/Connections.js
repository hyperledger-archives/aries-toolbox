const rp = require('request-promise');
const bs58 = require('bs58');
var uuid = require('uuid-v4');
import Vue from 'vue';

const state = {
  agents:{},
  agent_ids:[], // [...id,...]
  schemas:{}, // {id:{schema}}
  published:{},// {txn_id : {meta_data}} 
  dids:{},// {did:{did_doc}}
  cred_defs:{}, // {id: {cred_def}}
  presentations:{}, // {id: {presentation}}
}

const mutations = {
  ADD_CONNECTION (state, detail) {
    state.agents[detail.id]=detail;
    state.agent_ids=[...state.agent_ids,detail.id]
  },
  DELETE_CONNECTION (state, payload) {
    Vue.delete(state.agents,payload.id);
    //TODO: remove schemas, and .....
    state.agent_ids.splice(payload.index, 1);
  },
  ADD_SCHEMA(state, payload){
    console.log("agent_id, schema_id, schema",payload.agent_id, payload.schema_id,payload.schema)
    state.schemas = {...state.schemas, ...payload.schema};
    state.agents[payload.agent_id].schemas = [...state.agents[payload.agent_id].schemas , payload.schema_id];
  },
  
}

const actions = {
  add_connection ({commit}, agent) {
    // do something async
    console.log("add_connection action called", agent)
    let schema_id = random_id();
    console.log("schema_id", schema_id)
    let default_schema = {
      [schema_id]:{'id':schema_id,
        'name':'BasicID',
        'version':'1.9',
        'attributes':['first_name','last_name','company','type'],
        'published_ids':[]}
    };
    agent = {... agent,
            ...{'schemas':[],
            'dids':[],
            'cred_defs':[],
            'presentations':[],
            'publishes':[]} }
    agent.my_key.privateKeyDecoded = bs58.decode(agent.my_key.privateKey_b58);
    agent.my_key.publicKeyDecoded = bs58.decode(agent.my_key.publicKey_b58);
    commit('ADD_CONNECTION', agent);
    let payload = {'agent_id': agent.id,'schema_id':schema_id,'schema':default_schema}
    console.log("agent_id, schema_id, schema",payload.agent_id, payload.schema_id,payload.schema)
    commit('ADD_SCHEMA',payload);
  },
  delete_connection ({commit}, payload) {
    // TODO: notify agent on other side of connection
    console.log("add_connection called", payload);
    commit('DELETE_CONNECTION', payload);
  },

  
  async send_connection_request (context, request_options, toolbox_did, didcomm) {
    console.log("send_connection_request called")
    // Do something here... lets say, a http call using vue-resource
    let parsedBody = await rp(request_options)
    // POST succeeded...
    //console.log("request post response", parsedBody);
    const unpackedResponse = await didcomm.unpackMessage(parsedBody, toolbox_did);
    //console.log("unpacked", unpackedResponse);
    const response = JSON.parse(unpackedResponse.message);
    //console.log("response message", response);
    //TODO: Validate signature against invite.
    //console.log("connection sig b64 data", response['connection~sig'].sig_data);
    let buff = new Buffer(response['connection~sig'].sig_data, 'base64');
    let text = buff.toString('ascii');
    //first 8 chars are a timestamp for the signature, so we ignore those before parsing value
    response.connection = JSON.parse(text.substring(8));
    console.log("response message", response);
    let connection_detail = {
      'id': new Date().getTime(), //FIXME:
      'label': invite.label,
      'did_doc': response.connection.DIDDoc,
      'my_key': toolbox_did
    };
    console.log("connection detail", connection_detail);
    context.commit('ADD_CONNECTION', detail);
  },
  
  addSchema({commit},agent_id,name,version,attributes){
    let schema_id = random_id();
    let schema = {
      [schema_id]:{
        id:schema_id,
        name: name,
        version: version,
        attributes: attributes
      }    
    }
    commit("ADD_SCHEMA", agent_id,schema)
  },
}
const getters = {
  get_agents: state => state.agent_ids.map(id => state.agents[id]),
  get_agent: state => id => state.agents[id],
  get_schemas: (state, get_agent) => 
    agent_id => 
      get_agent(agent_id)['schemas'].map(schema_id => state.schemas[schema_id]),
}

function random_id() {
  return uuid();// Generate a new UUID
}

export default {
  //namespaced: true,  // this done in store/index.js
  state,
  mutations,
  actions,
  getters,
};
