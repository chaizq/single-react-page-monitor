import fetch from 'dva/fetch';
import { notification } from 'antd';
import React,{ Fragment } from 'react';
import { eurekaProducts, homepage, integrateProducts, productServices } from '@/defaultSettings';
import { getSessionCache, isAntdPro } from '@/utils/Platform/platformUtil';
import hash from 'hash.js';
// import router from 'umi/router';

const checkStatus = response => {
  const { status } = response;
  if (status >= 200 && status < 300) {
    return;
  }
  let bodyContent = '';
  const reader = response.body.getReader();
  reader.read().then(function processText({ done, value }) {
    if (done) {
      notification.error({
        message: `请求错误： ${status}`,
        description: (
          <Fragment>
            <div
              dangerouslySetInnerHTML={{ __html: bodyContent }}
            />
          </Fragment>
        ),
      });
      return;
    }
    const temp = new TextDecoder('utf-8').decode(value);
    bodyContent += temp;
    // eslint-disable-next-line consistent-return
    return reader.read().then(processText);
  });

  // 直接抛出异常阻塞后续进程
  const error = new Error(status);
  error.name = response.status;
  error.response = response;
  throw error;
};

/**
 * 发送请求的核心方法
 * @param url
 * @param option
 * @returns {Promise<unknown>}
 */
const doRequest = (url, option) => {
  const options = {
    ...option,
  };
  const defaultOptions = {
    credentials: 'include',
  };
  const newOptions = { ...defaultOptions, ...options };
  if (
    newOptions.method === 'POST' ||
    newOptions.method === 'PUT' ||
    newOptions.method === 'DELETE'
  ) {
    if (!(newOptions.body instanceof FormData)) {
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        ...newOptions.headers,
      };
      newOptions.body = JSON.stringify(newOptions.body);
    } else {
      // newOptions.body is FormData
      newOptions.headers = {
        Accept: 'application/json',
        ...newOptions.headers,
      };
    }
  }
  const result = fetch(url, newOptions)
    .then(response => {
      // 校验响应，如果出现异常，直接抛错，不进行后续代码逻辑
      checkStatus(response);
      // DELETE and 204 do not return data by default
      // using .json will report an error.
      if (newOptions.method === 'DELETE' || response.status === 204) {
        return response.text();
      }
      if (response.headers.get('Content-Type').indexOf('application/octet-stream') !== -1) {
        return response.blob();
      }
      return response.json();
    })
    .catch(e => {
      const status = e.name;
      if (status === 401) {
        // @HACK
        /* eslint-disable no-underscore-dangle */
        // 非登录状态路由登出跳转
        // window.g_app._store.dispatch({
        //   type: 'login/fetchLogout',
        // });
      }
    });
  if (result) {
    result.then(res => {
      if (res && res.code === 401 && window.location.pathname !== homepage) {
        // 非登录状态路由登出跳转
        // window.g_app._store.dispatch({
        //   type: 'login/fetchLogout',
        // });
      }
    });
  }
  return result;
};

/**
 * 自定义请求，单个ID不进行json处理
 * @param {*} url
 * @param {*} option
 */
const doRequestCustom = (url, option) => {
  const options = {
    ...option,
  };
  const defaultOptions = {
    credentials: 'include',
  };
  const newOptions = { ...defaultOptions, ...options };
  if (
    newOptions.method === 'POST' ||
    newOptions.method === 'PUT' ||
    newOptions.method === 'DELETE'
  ) {
    if (!(newOptions.body instanceof FormData)) {
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        ...newOptions.headers,
      };
      newOptions.body =
        newOptions.body.constructor !== String ? JSON.stringify(newOptions.body) : newOptions.body;
    } else {
      // newOptions.body is FormData
      newOptions.headers = {
        Accept: 'application/json',
        ...newOptions.headers,
      };
    }
  }
  const result = fetch(url, newOptions)
    .then(response => {
      // 校验响应，如果出现异常，直接抛错，不进行后续代码逻辑
      checkStatus(response);
      // DELETE and 204 do not return data by default
      // using .json will report an error.
      if (newOptions.method === 'DELETE' || response.status === 204) {
        return response.text();
      }
      return response.json();
    })
    .catch(e => {
      const status = e.name;
      if (status === 401) {
        // @HACK
        /* eslint-disable no-underscore-dangle */
        window.g_app._store.dispatch({
          type: 'login/fetchLogout',
        });
      }
    });
  if (result) {
    result.then(res => {
      if (res && res.code === 401 && window.location.pathname !== homepage) {
        window.g_app._store.dispatch({
          type: 'login/fetchLogout',
        });
      }
    });
  }
  return result;
};

const getOptionAndUrl = (products, tempUrl, url, option, productId, eurekaTag) => {
  let tempOption = null;
  const diToken = getSessionCache('diToken');
  // eslint-disable-next-line guard-for-in,no-restricted-syntax
  for (const i in products) {
    const productCode = products[i];
    const productPrefix = '/di/' + productCode + '/';
    if (url.startsWith(productPrefix)) {
      const service = productServices[productCode];
      // 初设处理后的url
      if (!eurekaTag) {
        // eslint-disable-next-line no-param-reassign
        tempUrl = url.replace(productPrefix, '/di/' + productId + '/');
      }
      // 二次校验是否存在产品内部转发的场景
      // eslint-disable-next-line guard-for-in,no-restricted-syntax
      for (const j in service) {
        const productServicePrefix = productPrefix + service[j] + '/';
        if (url.startsWith(productServicePrefix)) {
          const servicePath = url.substring(productPrefix.length);
          if (!eurekaTag) {
            // eslint-disable-next-line no-param-reassign
            tempUrl = '/di/' + productId + '/redirect?diToken=' + diToken;
          } else {
            // eslint-disable-next-line no-param-reassign
            tempUrl = '/di/' + productCode + '/redirect?diToken=' + diToken;
          }
          let tempBody = option;
          if (!tempBody) {
            tempBody = {};
          }
          tempBody.redirect = servicePath;
          tempOption = {
            headers: {
              'Content-Type': 'application/json;charset=utf-8',
              Accept: 'application/json;charset=UTF-8',
            },
            method: 'POST',
            body: tempBody,
          };
          break;
        }
      }
      break;
    }
  }
  return { tempOption, tempUrl };
};

const operateRequest = (url, option) => {
  // 获取Session中缓存的productId
  const productId = getSessionCache('productId');
  let tempUrl = url;
  let tempOption = null;
  if (productId) {
    // 对支持的服务替换产品标识,为做动态路由
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    const result = getOptionAndUrl(integrateProducts, tempUrl, url, option, productId, false);
    // eslint-disable-next-line prefer-destructuring
    tempOption = result.tempOption;
    // eslint-disable-next-line prefer-destructuring
    tempUrl = result.tempUrl;
    if (!tempOption) {
      const eurekaResult = getOptionAndUrl(eurekaProducts, tempUrl, url, option, productId, true);
      // eslint-disable-next-line prefer-destructuring
      tempOption = eurekaResult.tempOption;
      // eslint-disable-next-line prefer-destructuring
      tempUrl = eurekaResult.tempUrl;
    }
  }
  if (!tempOption) {
    tempOption = option;
  }
  return [tempUrl, tempOption];
};

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [option] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export async function apimRequest(url, option) {
  const options = {
    expirys: isAntdPro(),
    ...option,
  };
  /**
   * Produce fingerprints based on url and parameters
   * Maybe url has the same parameters
   */
  const fingerprint = url + (options.body ? JSON.stringify(options.body) : '');
  const hashcode = hash
    .sha256()
    .update(fingerprint)
    .digest('hex');

  const defaultOptions = {
    credentials: 'include',
  };
  const newOptions = { ...defaultOptions, ...options };
  if (
    newOptions.method === 'POST' ||
    newOptions.method === 'PUT' ||
    newOptions.method === 'DELETE'
  ) {
    if (!(newOptions.body instanceof FormData)) {
      if (newOptions.consumes && newOptions.consumes === 'application/xml') {
        newOptions.headers = {
          'Content-Type': 'application/xml',
          ...newOptions.headers,
        };
        newOptions.body = newOptions.body;
        // } else if (newOptions.consumes && newOptions.consumes==="application/json"){
      } else if (newOptions.consumes && newOptions.consumes === "text/plain") {
        newOptions.body = newOptions.body;
      } else {
        newOptions.headers = {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=utf-8',
          ...newOptions.headers,
        };
        newOptions.body = JSON.stringify(newOptions.body);
      }
    } else {
      // newOptions.body is FormData
      newOptions.headers = {
        Accept: 'application/json',
        ...newOptions.headers,
      };
    }
  }

  const expirys = options.expirys && 60;
  // options.expirys !== false, return the cache,
  if (options.expirys !== false) {
    const cached = sessionStorage.getItem(hashcode);
    const whenCached = sessionStorage.getItem(`${hashcode}:timestamp`);
    if (cached !== null && whenCached !== null) {
      const age = (Date.now() - whenCached) / 1000;
      if (age < expirys) {
        const response = new Response(new Blob([cached]));
        return response.json();
      }
      sessionStorage.removeItem(hashcode);
      sessionStorage.removeItem(`${hashcode}:timestamp`);
    }
  }
  const response = await fetch(url, newOptions);
  const wrappedresponse = response.clone();
  const ret = {};
  try {
    const responseBody = await response.json();
    const {code,msg}=responseBody;
    if(code && code !== 200 && code.search(/^\d{3}$/)===0 ){
      ret.code=code;
      ret.message=msg || 'apimConsole报错，具体请查看apim日志';
      ret.msg=msg || 'apimConsole报错，具体请查看apim日志';
    }else{
      ret.code = response.status;
      ret.message = response.statusText;
      ret.msg = response.statusText;
    }
    // 解析headers
    const headers = [];
    response.headers.forEach((value, key) => {
      const temp = {};
      temp.key = key;
      temp.value = value;
      headers.push(temp);
    });
    ret.headers = headers;
    if (newOptions.method === 'DELETE' || response.status === 204) {
      const text = await response.text();
      ret.body = text;
      return ret;
    }
    ret.body = responseBody;
    return ret;
  } catch (e) {
    ret.code = response.status;
    ret.message = response.statusText;
    // 解析headers
    const headers = [];
    response.headers.forEach((value, key) => {
      const temp = {};
      temp.key = key;
      temp.value = value;
      headers.push(temp);
    });
    ret.headers = headers;
    ret.message = response.statusText;
    const { status } = response;
    if (status === 200) {
      const text = await wrappedresponse.text();
      ret.body = text;
      return ret;
    }
    if (status === 401) {
      // @HACK
      /* eslint-disable no-underscore-dangle */
      window.g_app._store.dispatch({
        type: 'login/logout',
      });
      // eslint-disable-next-line consistent-return
      return;
    }
    // environment should not be used
    if (status === 403) {
      // router.push('/exception/403');
      // eslint-disable-next-line consistent-return
      return;
    }
    if (status <= 504 && status >= 500) {
      const text = await wrappedresponse.text();
      ret.message = text;
      ret.body={
        message:text,
      }
      return ret;
    }
    if (status >= 404 && status < 422) {
      // router.push('/exception/404');
    }
  }
  return ret;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [option] The options we want to pass to "fetch"
 */
export default function request(url, option) {
  const params = operateRequest(url, option);
  if (
    params[1] &&
    params[1].body &&
    params[1].body.redirect &&
    params[1].body.redirect.startsWith('apimConsoleService')
  ) {
    return apimRequest(params[0], params[1]);
  }
  return doRequest(params[0], params[1]);
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [option] The options we want to pass to "fetch"
 */
export function requestCustom(url, option) {
  const params = operateRequest(url, option);
  return doRequestCustom(params[0], params[1]);
}
