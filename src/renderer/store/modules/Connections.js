const state = {
  agent_list: []
}

const mutations = {
  ADD_CONNECTION (state, detail) {
    state.agent_list.push(detail);
  },
  DELETE_CONNECTION (state, label) {
    state.agent_list = state.agent_list.filter(function(element, index, arr){
      return element.label != label;
    });
  }
};

const actions = {
  add_connection (context, detail) {
    // do something async
    console.log("add_connection called", detail);
    context.commit('ADD_CONNECTION', detail);
  },
  delete_connection (context, detail) {
    // do something async
    console.log("add_connection called", detail);
    context.commit('DELETE_CONNECTION', detail.label);
  },
  get_connection (context, id) {
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
