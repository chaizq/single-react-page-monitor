import { apimRequest } from '@/utils/Platform/request';

export default async function testApi(condition) {
  if (condition) {
    const { method, headers, consumes, produces, data, serviceAddress } = condition;
    let tempReqBody; // 根据method及请求体data的有无，确定param参数中的body项
    if (
      !(
        method === 'get' ||
        method === 'GET' ||
        method === 'delete' ||
        method === 'DELETE' ||
        data === null ||
        typeof data === 'undefined'
      )
    ) {
      tempReqBody = data;
    }
    debugger;
    const restUrl = serviceAddress;
    const param = {
      method,
      headers,
      consumes,
      produces,

      body: tempReqBody,
    };
    const res = apimRequest(restUrl, param);
    return res;
  }
  return {};
}
