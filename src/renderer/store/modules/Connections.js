const rp = require('request-promise');
const bs58 = require('bs58');

const state = {
  agents:{},
  schemas:{},
}

const mutations = {
  ADD_CONNECTION (state, detail) {
    state.agents[detail.id]=detail;
  },
  DELETE_CONNECTION (state, label) {
    delete state.agents[label];
  },
  ADD_SCHEMA(state, agent_id, schema){
    state.schemas= {...state.schemas, ...schema};
    state.agents[agent_id][schemas]=[...state.agents[agent_id][schemas],schema.id];
  },
  
}

const actions = {
  add_connection (context, detail) {
    // do something async
    let schema_id = random_id();
    let default_schema = {
      [schema_id]:{'id':schema_id,
        'name':'BasicID',
        'version':'1.9',
        'attributes':['first_name','last_name','company','type'],
        'published':false}
    };
    detail[schemas]=[schema_id];
    detail.my_key.privateKeyDecoded = bs58.decode(detail.my_key.privateKey_b58);
    detail.my_key.publicKeyDecoded = bs58.decode(detail.my_key.publicKey_b58);
    context.commit('ADD_CONNECTION', detail);
    context.commit('ADD_SCHEMA',default_schema);
  },
  delete_connection (context, detail) {
    // do something async
    console.log("add_connection called", detail);
    context.commit('DELETE_CONNECTION', detail.label);
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
  
  ADD_SCHEMA({commit},agent_id,name,version,attributes){
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
  get_agents: state => state.agents.map(id => state.agents[id]),
  get_agent: state => id => state.agents[id],
  get_schemas: (state, get_agent) => 
    agent_id => 
      get_agent(agent_id)['schemas'].map(schema_id => state.schemas[schema_id]),
}

function random_id() {//https://gist.github.com/gordonbrander/2230317
  return '_' + (
    Number(String(Math.random()).slice(2)) + 
    Date.now() + 
    Math.round(performance.now())
  ).toString(36);
}

export default {
  //namespaced: true,  // this done in store/index.js
  state,
  mutations,
  actions,
  getters,
};
