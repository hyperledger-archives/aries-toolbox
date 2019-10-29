const state = {
  agent_list: []
}

const mutations = {
  ADD_AGENT (state, detail) {
    state.agent_list.push(detail);
  },
  DELETE_AGENT (state, id) {
    state.agent_list = state.agent_list.filter(function(element, index, arr){
      return element.id != id;
    });
  }
};

const actions = {
  add_agent (context, detail) {
    // do something async
    context.commit('ADD_AGENT', detail);
  },
  delete_agent (context, detail) {
    // do something async
    context.commit('DELETE_AGENT', detail.id);
  },
  get_agent (context, id) {
    // do something async
    let detail = context.state.agent_list.find(function(element){
      return element.id == id;
    });
    return detail;
  }
};

export default {
  namespaced: true,   // ADD THIS LINE
  state,
  mutations,
  actions,
};
