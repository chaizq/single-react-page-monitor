import  testApi  from '@/services/Apim/gateway';

export default {
  namespace: 'gateway',

  state: {
    createDeveloperResult: {},
    getDeveloperByAccountResult: {},
    updateAppSecretResult: {},
    isDeveloperResult: null,
  },

  effects: {

    *testApi(action, { call }) {
      const data = action.payload;
      const response = yield call(testApi, data);
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
