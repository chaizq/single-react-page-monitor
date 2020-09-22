import request from '@/utils/Platform/request';
import { getSessionCache } from '@/utils/Platform/platformUtil';

/**
 * 杭州服务数据临时接口
 * @param {*} data
 */

// eslint-disable-next-line
export async function saveHzServiceData(data) {
  const diToken = getSessionCache('diToken');
  if (data) {
    const restUrl = `/di/DataCatalog/apimConsoleService/ws/gateway/service/hz/saveOrUpdateExAPI?diToken=${diToken}`;
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
// 根据API ID获取该服务（主服务）相关的所有数据
export async function getHzApiById(data) {
  const diToken = getSessionCache('diToken');
  if (typeof data !== 'undefined') {
    const restUrl = `/di/DataCatalog/apimConsoleService/ws/gateway/service/hz/getApiById?diToken=${diToken}&apiId=${data}`;
    return request(restUrl, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET',
    });
  }
  return {};
}

// 服务列表中的已选服务
export async function getHzApiByIds(data) {
  const diToken = getSessionCache('diToken');
  if (typeof data !== 'undefined') {
    const { body } = data;
    const restUrl = `/di/DataCatalog/apimConsoleService/ws/gateway/service/hz/getApiByIds?diToken=${diToken}`;
    return request(restUrl, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'POST',
      body,
    });
  }
  return {};
}

export async function getServicesByPage(data) {
  const diToken = getSessionCache('diToken');
  if (typeof data !== 'undefined' && data !== null) {
    const {
      query: { condition, pageNumber, pageSize },
      body,
    } = data;

    const restUrl = `/di/DataCatalog/apimConsoleService/ws/gateway/service/hz/getServicesByPage?diToken=${diToken}&condition=${condition}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
    return request(restUrl, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'POST',
      body,
    });
  }
  return {};
}

export async function deleteApiById(data) {
  const diToken = getSessionCache('diToken');
  if (typeof data !== 'undefined' && data !== null) {
    const {
      query: { apiId },
    } = data;

    const restUrl = `/di/DataCatalog/apimConsoleService/ws/gateway/service/hz/deleteApiById?diToken=${diToken}&apiId=${apiId}`;
    return request(restUrl, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET',
    });
  }
  return {};
}
