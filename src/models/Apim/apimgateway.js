import {
  createApimAccessToken,
  getApimGatewayUrl,
  retryService,
} from '@/services/Apim/apimgateway';
import { message } from 'antd';

export default {
  namespace: 'apimgateway',

  state: {
    accessTokenResult: {},
    apimgatewayUrl: '',
  },

  effects: {
    /**
     * 根据appId和appSecret获取accessToken
     * @param {*} action
     * @param {*} param1
     */
    *createApimAccessToken(action, { call, put }) {
      const { appId, appSecret } = action.payload;
      if (appId && appSecret) {
        const accessTokenResult = yield call(createApimAccessToken, appId, appSecret);
        if (accessTokenResult) {
          yield put({
            type: 'setState',
            payload: {
              accessTokenResult,
            },
          });
        } else {
          message.error('获取accessToken失败，接口调用失败!');
        }
        return accessTokenResult;
      }
      message.error('获取accessToken失败，appId或appSecret缺失!');
      return {};
    },

    /**
     * 获取apim网关服务的地址
     * @param {*} _
     * @param {*} param1
     */
    *getApimGatewayUrl(_, { call, put }) {
      const apimGatewayUrlResult = yield call(getApimGatewayUrl);
      if (apimGatewayUrlResult && apimGatewayUrlResult.code === 200) {
        yield put({
          type: 'setState',
          payload: {
            apimgatewayUrl: apimGatewayUrlResult.data,
          },
        });
        return apimGatewayUrlResult.data;
      }
      return '';
    },

    /**
     * 手动重试发布失败的服务
     * @param {*} _
     * @param {*} action 服务列表中的ID
     */
    *retryService(action, { call, put }) {
      const data = action.payload;
      const retryServiceResult = yield call(retryService, data);
      if (retryServiceResult && retryServiceResult.code === 200) {
        yield put({
          type: 'setState',
          payload: {
            retryServiceResult
          },
        });
        return retryServiceResult;
      }
      return '';
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
