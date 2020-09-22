import  getUserRole  from '@/services/Apim/gatewayIvokDi';

export default {
  namespace: 'gatewayIvokDi',

  state: {
    createDeveloperResult: {},
    getDeveloperByAccountResult: {},
    updateAppSecretResult: {},
    isDeveloperResult: null,
  },

  effects: {
    *getUserRole(action, { call }) {
      const response = yield call(getUserRole);
      return response;
    },
  },

  reducers: {
    setState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
