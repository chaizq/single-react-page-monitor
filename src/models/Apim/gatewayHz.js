import {
  saveHzServiceData,
  getHzApiById,
  getHzApiByIds,
  getServicesByPage,
  deleteApiById,
} from '@/services/Apim/gatewayHz';

export default {
  namespace: 'gatewayHz',

  state: {
    getHzApiDataList: [],
  },

  effects: {
    /**
     * 杭州服务数据
     * @param {*} action
     * @param {*} param1
     */
    *saveHzServiceData(action, { call }) {
      const data = action.payload;
      return yield call(saveHzServiceData, data);
    },

    *getHzApiById(action, { put, call }) {
      const data = action.payload;
      const response = yield call(getHzApiById, data);
      yield put({
        type: 'setState',
        payload: {
          getHzApiDataList: response,
        },
      });
      return response;
    },

    *getHzApiByIds(action, { call }) {
      const data = action.payload;
      return yield call(getHzApiByIds, data);
    },

    *getServicesByPage(action, { call }) {
      const data = action.payload;
      return yield call(getServicesByPage, data);
    },

    *deleteApiById(action, { call }) {
      const data = action.payload;
      return yield call(deleteApiById, data);
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
