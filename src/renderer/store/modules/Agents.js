import Vue from 'vue';

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
  },
  UPDATE_AGENT (state, detail) {
    let idx = state.agent_list.findIndex(item => item.id === detail.id);
    Vue.set(state.agent_list, idx, Object.assign(state.agent_list[idx], detail));
  }
};

const getters = {
  get_agent: (state, getters) => (id) => {
    // do something async
    let detail = state.agent_list.find(function(element){
      return element.id === id;
    });
    return detail;
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

  update_agent (context, detail){
    context.commit('UPDATE_AGENT', detail);
  }
};

export default {
  namespaced: true,   // ADD THIS LINE
  state,
  getters,
  mutations,
  actions,
};
