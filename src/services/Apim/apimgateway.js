import request, { requestCustom } from '@/utils/Platform/request';
import { getSessionCache } from '@/utils/Platform/platformUtil';


/**
 * 根据appId和appSecret获取accessToken
 * @param {*} appId
 * @param {*} appSecret
 */
export async function createApimAccessToken(appId, appSecret) {
  const diToken = getSessionCache('diToken');
  return request(
    `/di/DataCatalog/apimGatewayService/auth/accesstoken/create?appId=${appId}&appSecret=${appSecret}&diToken=${diToken}`
  );
}

/**
 * 获取APIM-网关服务的地址
 */
export async function getApimGatewayUrl() {
  const diToken = getSessionCache('diToken');
  return requestCustom(
    `/di/DataCatalog/config?diToken=${diToken}`,
    {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'POST',
      body: "di.apimGatewayOuter.url",
    }
  );
}

/**
 * 手动重试发布失败的服务
 * @param {*} id 服务列表中的ID
 */
export async function retryService(id) {
  const diToken = getSessionCache('diToken');
  return requestCustom(
    `/di/DataCatalog/apimGatewayService/gateway/retryService/${id}?diToken=${diToken}`
  );
}
