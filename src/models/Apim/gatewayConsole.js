import {
  createDeveloper,
  getDeveloperByAccount,
  updateAppSecret,
  isDeveloper,
  transApiParameters,
  saveOrUpdataApi,
  ipExisted,
  getIpAuth,
  saveIpAuth,
  getApisById,
  getRestApplications,
  getServices,
  getAccessTokenByAccount,
  changeApiToProcessing,
  changeApiToUnpublished,
  getAccessToken,
  getTraceData,
  getSoapMethod,
  getGlobalStaticData,
  getInvokeStaticData,
  getApiNum,
  getServiceFailure,
  deleteServiceFailureById,
  getInvokeApiList,
  getInvokeApiInfo,
  getPlatformDeveloper,
  getServiceFailureById,
  getServiceMapStaticData,
  updateHeartbeat,
} from '@/services/Apim/gatewayConsole';
import { message } from 'antd';

export default {
  namespace: 'gatewayConsole',

  state: {
    createDeveloperResult: {},
    getDeveloperByAccountResult: {},
    updateAppSecretResult: {},
    isDeveloperResult: null,
    totalApiNum: 0,
    moreInfoChartType: 'top20',
  },

  effects: {
    /**
     * 创建开发者
     * @param {*} action
     * @param {*} param1
     */
    *createDeveloper(action, { call, put }) {
      const { account } = action.payload;
      if (account) {
        const createDeveloperResult = yield call(createDeveloper, account);
        if (createDeveloperResult) {
          yield put({
            type: 'setState',
            payload: {
              createDeveloperResult,
            },
          });
        } else {
          message.error('创建开发者接口调用失败，请检查gatewayconsole地址是否正确!');
        }
        return createDeveloperResult;
      }
      return {};
    },

    /**
     * 根据账号获取开发者信息
     * @param {*} action
     * @param {*} param1
     */
    *getDeveloperByAccount(action, { call, put }) {
      const { account } = action.payload;
      if (account) {
        const getDeveloperByAccountResult = yield call(getDeveloperByAccount, account);
        if (getDeveloperByAccountResult) {
          yield put({
            type: 'setState',
            payload: {
              getDeveloperByAccountResult,
            },
          });
        } else {
          message.error('根据账号获取开发者信息接口调用失败，请检查gatewayconsole地址是否正确!');
        }
        return getDeveloperByAccountResult;
      }
      return {};
    },
    /**
     * 根据账号获取防伪信息
     * @param {*} action
     * @param {*} param1
     */
    *getPlatformDeveloper(action, { call }) {
      const { account } = action.payload;
      if (account) {
        const getDeveloperByAccountResult = yield call(getPlatformDeveloper, account);
        if (getDeveloperByAccountResult && getDeveloperByAccountResult.code === 200) {
          if (getDeveloperByAccountResult.body.status === 'success') {
            return getDeveloperByAccountResult.body.object;
          }
          message.error(getDeveloperByAccountResult.body.msg);
        } else {
          message.error('根据账号获取开发者信息接口调用失败，请检查gatewayconsole地址是否正确!');
        }
      }
      return {};
    },
    /**
     * 更新开发者账号秘钥
     * @param {*} action
     * @param {*} param1
     */
    *updateAppSecret(action, { call, put }) {
      const { account } = action.payload;
      if (account) {
        const updateAppSecretResult = yield call(updateAppSecret, account);
        if (updateAppSecretResult) {
          yield put({
            type: 'setState',
            payload: {
              updateAppSecretResult,
            },
          });
        } else {
          message.error('重新生成开发者账号信息接口调用失败，请检查gatewayconsole地址是否正确!');
        }
        return updateAppSecretResult;
      }
      return {};
    },

    /**
     * 根据账号判断是否为开发者
     * @param {*} action
     * @param {*} param1
     */
    *isDeveloper(action, { call, put }) {
      const { account } = action.payload;
      if (account) {
        const isDeveloperResult = yield call(isDeveloper, account);
        if(isDeveloperResult && isDeveloperResult.code === 200){
          yield put({
            type: 'setState',
            payload: {
              isDeveloperResult,
            },
          });
          return isDeveloperResult;
        }
      }
      return false;
    },

    /**
     * 转换json
     */
    *transcation(action, { call }) {
      const data = action.payload;
      const response = yield call(transApiParameters, data);
      return response;
    },

    /**
     * @summary:获取应用
     * @param {*} action
     * @param {*} param1
     */
    *getRestApplications(action, { call }) {
      const data = action.payload;
      const response = yield call(getRestApplications, data);
      return response;
    },

    *saveOrUpdataApi(action, { call }) {
      const data = action.payload;
      const response = yield call(saveOrUpdataApi, data);
      return response;
    },

    /**
     * 心跳检测开关
     * @param {*} action
     * @param {*} param1
     */
    *updateHeartbeat(action, { call }) {
      const data = action.payload;
      return yield call(updateHeartbeat, data);
    },

    *ipExisted(action, { call }) {
      const data = action.payload;
      const response = yield call(ipExisted, data);
      return response;
    },

    *getIpAuth(action, { call }) {
      const data = action.payload;
      const response = yield call(getIpAuth, data);
      return response;
    },

    *saveIpAuth(action, { call }) {
      const data = action.payload;
      const response = yield call(saveIpAuth, data);
      return response;
    },

    *getApisById(action, { call }) {
      const data = action.payload;
      const response = yield call(getApisById, data);
      return response;
    },

    *getAccessTolen(action, { call }) {
      const data = action.payload;
      const response = yield call(getAccessToken, data);
      return response;
    },

    *changeApiToProcessing(action, { call }) {
      const data = action.payload;
      const response = yield call(changeApiToProcessing, data);
      return response;
    },

    *changeApiToUnpublished(action, { call }) {
      const data = action.payload;
      const response = yield call(changeApiToUnpublished, data);
      return response;
    },

    /**
     * @summary: 获取服务
     * @param {*} action
     * @param {*} param1
     */
    *getServices(action, { call }) {
      const data = action.payload;
      const response = yield call(getServices, data);
      return response;
    },

    *getAccessTokenByAccount(action, { call }) {
      const data = action.payload;
      const response = yield call(getAccessTokenByAccount, data);
      return response;
    },

    *getTraceData(action, { call }) {
      const data = action.payload;
      const response = yield call(getTraceData, data);
      return response;
    },

    *getSoapMethod(action, { call }) {
      const data = action.payload;
      const response = yield call(getSoapMethod, data);
      return response;
    },

    /**
     * @summary: 获取服务资源监控数据
     * @param {*} action
     * @param {*} param1
     */

    *getGlobalStaticData(action, { call }) {
      const data = action.payload;
      const response = yield call(getGlobalStaticData, data);
      return response;
    },

    *getInvokeStaticData(action, { call }) {
      const data = action.payload;
      const response = yield call(getInvokeStaticData, data);
      return response;
    },

    *getApiNum(action, { call, put }) {
      const response = yield call(getApiNum);
      yield put({
        type: 'setState',
        payload: {
          totalApiNum: response,
        },
      });
      return response;
    },

    /**
     * 获取推送失败的服务，作为手动Retry的服务列表
     * @param {*} _
     * @param {*} action 请求体参数
     */
    *getServiceFailure(action, { call, put }) {
      const data = action.payload;
      const getServiceFailureResult = yield call(getServiceFailure, data);
      if (getServiceFailureResult && getServiceFailureResult.code === 200) {
        yield put({
          type: 'setState',
          payload: {
            getServiceFailureResult,
          },
        });
        return getServiceFailureResult;
      }
      return '';
    },

    /**
     * 在手动补偿页的服务列表中，删除推送失败的服务
     * @param {*} _
     * @param {*} action 请求体参数
     */
    *deleteServiceFailureById(action, { call, put }) {
      const data = action.payload;
      const deleteServiceFailureByIdResult = yield call(deleteServiceFailureById, data);
      if (deleteServiceFailureByIdResult && deleteServiceFailureByIdResult.code === 200) {
        yield put({
          type: 'setState',
          payload: {
            deleteServiceFailureByIdResult,
          },
        });
        return deleteServiceFailureByIdResult;
      }
      return '';
    },

    /**
     * 在服务监控页的更多按钮，获取全部服务列表
     * @param {*} _
     * @param {*} action 请求体参数
     */
    *getInvokeApiList(action, { call, put }) {
      const data = action.payload;
      const getInvokeApiListResult = yield call(getInvokeApiList, data);
      if (getInvokeApiListResult) {
        yield put({
          type: 'setState',
          payload: {
            getInvokeApiListResult,
          },
        });
        return getInvokeApiListResult;
      }
      return '';
    },

    /**
     * 获取服务监控页单项服务的相关指标随时间变化的图表数据
     * @param {*} _
     * @param {*} action 请求体参数
     */
    *getInvokeApiInfo(action, { call, put }) {
      const data = action.payload;
      const getInvokeApiInfoResult = yield call(getInvokeApiInfo, data);
      if (getInvokeApiInfoResult && getInvokeApiInfoResult.code === 200) {
        yield put({
          type: 'setState',
          payload: {
            getInvokeApiInfoResult,
          },
        });
      }
      return getInvokeApiInfoResult;
    },

    /**
     * 获取补偿页失败调用的详情信息
     * @param {*} _
     * @param {*} action 服务列表中的ID
     */
    *getServiceFailureById(action, { call, put }) {
      const data = action.payload;
      const getServiceFailureByIdResult = yield call(getServiceFailureById, data);
      if (getServiceFailureByIdResult && getServiceFailureByIdResult.code === 200) {
        yield put({
          type: 'setState',
          payload: {
            getServiceFailureByIdResult,
          },
        });
        return getServiceFailureByIdResult;
      }
      return getServiceFailureByIdResult;
    },

    /**
     * @summary: 获取服务地图统计数据
     * @param {*} action 请求体参数
     */
    *getServiceMapStaticData(action, { call }) {
      const data = action.payload;
      return yield call(getServiceMapStaticData, data);
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
