// import request from '@/utils/Platform/request';
import request from '@/utils/Apim/request';
import { getSessionCache } from '@/utils/Platform/platformUtil';

/**
 * 创建开发者
 * @param {*} account
 */
export async function createDeveloper(account) {
  const diToken = getSessionCache('diToken');
  return request(
    `/di/DataCatalog/apimConsoleService/ws/developer/createDeveloper?account=${account}&diToken=${diToken}`,
    {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'POST',
      body: {},
    }
  );
}

/**
 * 根据account查询开发者信息
 * @param {*} account
 */
export async function getDeveloperByAccount(account) {
  const diToken = getSessionCache('diToken');
  return request(
    `/di/DataCatalog/apimConsoleService/ws/developer/getDeveloperByAccount?account=${account}&diToken=${diToken}`
  );
}
/**
 * 根据account查询防伪信息
 * @param {*} account
 */
export async function getPlatformDeveloper(account) {
  const diToken = getSessionCache('diToken');
  return request(
    `/di/DataCatalog/apimConsoleService/ws/developer/getPlatformDeveloper?account=${account}&diToken=${diToken}`
  );
}

/**
 * 根据account删除开发者
 * @param {*} account
 */
export async function deleteDeveloper(account) {
  const diToken = getSessionCache('diToken');
  return request(
    `/di/DataCatalog/apimConsoleService/ws/developer/deleteDeveloper?account=${account}&diToken=${diToken}`,
    {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'POST',
      body: {},
    }
  );
}

/**
 * 更新开发者秘钥
 * @param {*} account
 */
export async function updateAppSecret(account) {
  const diToken = getSessionCache('diToken');
  return request(
    `/di/DataCatalog/apimConsoleService/ws/developer/updateAppSecret?account=${account}&diToken=${diToken}`,
    {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'POST',
      body: {},
    }
  );
}

/**
 * 查询account是否为开发者
 * @param {*} account
 */
export async function isDeveloper(account) {
  const diToken = getSessionCache('diToken');
  return request(
    `/di/DataCatalog/apimConsoleService/ws/developer/isDeveloper?account=${account}&diToken=${diToken}`
  );
}

export async function transApiParameters(data) {
  const diToken = getSessionCache('diToken');
  if (data) {
    const transApiUrl = `/di/DataCatalog/apimConsoleService/ws/serviceapi/transApiParameters?diToken=${diToken}`;
    return request(transApiUrl, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'POST',
      body: data,
    });
  }
  return {};
}

export async function saveOrUpdataApi(data) {
  const diToken = getSessionCache('diToken');
  if (data) {
    const transApiUrl = `/di/DataCatalog/apimConsoleService/ws/gateway/service/saveOrUpdateExAPI?diToken=${diToken}`;
    return request(transApiUrl, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'POST',
      body: data,
    });
  }
  return {};
}

export async function updateHeartbeat(params) {
  const diToken = getSessionCache('diToken');
  return request(
    `/di/DataCatalog/apimConsoleService/ws/gateway/service/saveOrUpdateExAPIForExtraInfo?diToken=${diToken}`,
    {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 判断ip是否已存在，传入ipAuth的list对象，返回true or false
 * @param data
 * @returns {Promise<{}>}
 */
export async function ipExisted(data) {
  const diToken = getSessionCache('diToken');
  if (data) {
    const transApiUrl = `/di/DataCatalog/apimConsoleService/ws/gateway/service/ipExisted?diToken=${diToken}`;
    return request(transApiUrl, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'POST',
      body: data,
    });
  }
  return {};
}

/**
 * 保存授权IP
 * @param data
 * @returns {Promise<{}>}
 */
export async function saveIpAuth(data) {
  const diToken = getSessionCache('diToken');
  if (data) {
    const transApiUrl = `/di/DataCatalog/apimConsoleService/ws/gateway/service/saveIpAuth?diToken=${diToken}`;
    return request(transApiUrl, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'POST',
      body: data,
    });
  }
  return {};
}

/**
 * 获取ip授权信息，在url后面传参，参数为api标识和订阅者账号
 */
export async function getIpAuth(data) {
  const diToken = getSessionCache('diToken');
  const { apiId, subscriber } = data;
  const reqUrl = `/di/DataCatalog/apimConsoleService/ws/gateway/service/getIpAuth?apiId=${apiId}&subscriber=${subscriber}&diToken=${diToken}`;
  return request(reqUrl, {
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    method: 'GET',
  });
}

export function getApisById(data) {
  const diToken = getSessionCache('diToken');
  if (data) {
    const getApisByIdsurl = `/di/DataCatalog/apimConsoleService/ws/gateway/service/getApisByApiId?diToken=${diToken}&apiId=${data}`;
    return request(getApisByIdsurl, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'POST',
    });
  }
  return {};
}

export function changeApiToUnpublished(data) {
  const diToken = getSessionCache('diToken');
  if (data) {
    const { diJson, apiId } = data;
    const url = `/di/DataCatalog/apimConsoleService/ws/gateway/service/changeApi/unpublished?diToken=${diToken}&apiId=${apiId}`;
    return request(url, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'POST',
      body: diJson,
    });
  }
  return {};
}

export function changeApiToProcessing(data) {
  const diToken = getSessionCache('diToken');
  if (data) {
    const { diJson, apiId } = data;
    const url = `/di/DataCatalog/apimConsoleService/ws/gateway/service/changeApi/processing?diToken=${diToken}&apiId=${apiId}`;
    return request(url, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'POST',
      body: diJson,
    });
  }
  return {};
}

export async function getRestApplications() {
  const diToken = getSessionCache('diToken');
  const restUrl = `/di/DataCatalog/apimConsoleService/ws/gateway/api/getRestApplications?diToken=${diToken}`;
  return request(restUrl, {
    method: 'get',
  });
}

export async function getAccessToken(condition) {
  const restUrl = '/di/DataCatalog/apimConsoleService/ws/gateway/service/addApiAuth';
  if (condition) {
    return request(restUrl, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'POST',
      body: condition,
    });
  }
  return {};
}

export async function getServices(condition) {
  const diToken = getSessionCache('diToken');
  const restUrl = `/di/DataCatalog/apimConsoleService/ws/gateway/api/getServices?diToken=${diToken}`;
  if (condition) {
    return request(restUrl, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'POST',
      body: condition,
    });
  }
  return {};
}

export async function getAccessTokenByAccount(data) {
  const diToken = getSessionCache('diToken');
  if (data) {
    const transApiUrl = `/di/DataCatalog/apimConsoleService/ws/apiTest/getAccessTokenByAccount?account=${data}&diToken=${diToken}`;
    return request(transApiUrl, {
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
      method: 'POST',
    });
  }
  return {};
}

export async function getTraceData(data) {
  const diToken = getSessionCache('diToken');
  if (data) {
    let traceUrl = '/di/DataCatalog/apimConsoleService/ws/gateway/service/getApiTable/';
    const { start, end, apiName, success, account, pageSize, pageNumber } = data;
    traceUrl = traceUrl + start + '/' + end + '?pageSize=' + pageSize + '&pageNumber=' + pageNumber;
    if (apiName) {
      traceUrl = traceUrl + '&apiName=' + apiName;
    }
    if (success) {
      traceUrl = traceUrl + '&success=' + success;
    }
    if (account) {
      traceUrl = traceUrl + '&userAccount=' + account;
    }
    traceUrl = traceUrl + '&diToken=' + diToken;
    return request(traceUrl, {
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
      method: 'GET',
    });
  }
  return {};
}

export async function getSoapMethod(data) {
  const diToken = getSessionCache('diToken');
  const restUrl = `/di/DataCatalog/apimConsoleService/ws/gateway/service/import/url?diToken=${diToken}`;
  if (data) {
    return request(restUrl, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'POST',
      body: data,
    });
  }
  return {};
}

export function getGlobalStaticData(data) {
  const diToken = getSessionCache('diToken');
  if (data) {
    const globalStaticUrl = `/console/ws/gateway/service/getGlobalStaticData?diToken=${diToken}`;
    return request(globalStaticUrl, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET',
    });
  }
  return {};
}

export function getInvokeStaticData(data) {
  const diToken = getSessionCache('diToken');
  if (data) {
    const { start, end, topK } = data;
    const InvokeStaticUrl = `/console/ws/gateway/service/getInvokeStaticData?diToken=${diToken}&start=${start}&end=${end}&topK=${topK}`;
    return request(InvokeStaticUrl, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET',
    });
  }
  return {};
}

/**
 * 获取监控服务总数
 * @returns {Promise<{}>}
 */
export function getApiNum() {
  const reqUrl = `/console/ws/gateway/service/getApiNum`;
  return request(reqUrl, {
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    method: 'GET',
  });
}

/**
 * 获取推送失败的服务，作为手动Retry的服务列表
 */
export async function getServiceFailure(data) {
  const diToken = getSessionCache('diToken');
  const { serviceName, user, subscriber, start, end, pageNumber, pageSize } = data;
  const reqUrl = `/di/DataCatalog/apimConsoleService/ws/gateway/service/getServiceFailure?name=${serviceName}&user=${user}&subscriber=${subscriber}&startTime=${start}&endTime=${end}&pageNumber=${pageNumber}&pageSize=${pageSize}&diToken=${diToken}`;
  return request(reqUrl, {
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    method: 'GET',
  });
}

/**
 * 在手动补偿页的服务列表中，删除推送失败的服务
 */
export async function deleteServiceFailureById(id) {
  const diToken = getSessionCache('diToken');
  const reqUrl = `/di/DataCatalog/apimConsoleService/ws/gateway/service/deleteServiceFailureById/${id}?diToken=${diToken}`;
  return request(reqUrl, {
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    method: 'GET',
  });
}

/**
 * 服务监控页，获取全部服务的列表
 */
export function getInvokeApiList(data) {
  const diToken = getSessionCache('diToken');
  const { start, end } = data;
  if (data) {
    const reqUrl = `/console/ws/gateway/service/getInvokeApiList?start=${start}&end=${end}&diToken=${diToken}`;
    return request(reqUrl, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET',
    });
  }
  return {};
}

/**
 * 服务监控页，获取单项服务指标随时间变化的数据
 */
export function getInvokeApiInfo(data) {
  const diToken = getSessionCache('diToken');
  const { apiId, start, end } = data;
  if (data) {
    const reqUrl = `/console/ws/gateway/service/getInvokeApiInfo?apiId=${apiId}&start=${start}&end=${end}&diToken=${diToken}`;
    return request(reqUrl, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET',
    });
  }
  return {};
}

/**
 * 获取补偿页失败调用的详情信息
 * @param {*} id 服务列表中的ID
 */
export function getServiceFailureById(id) {
  const diToken = getSessionCache('diToken');
  if (id) {
    const reqUrl = `/di/DataCatalog/apimConsoleService/ws/gateway/service/getServiceFailureById?id=${id}&diToken=${diToken}`;
    return request(reqUrl, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET',
    });
  }
  return {};
}

export function getServiceMapStaticData(data) {
  const diToken = getSessionCache('diToken');
  if (data) {
    const url = `/di/DataCatalog/apimConsoleService/ws/gateway/service/getServiceMapStaticData?diToken=${diToken}`;
    return request(url, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'POST',
      body: data,
    });
  }
  return {};
}
