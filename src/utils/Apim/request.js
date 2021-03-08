import fetch from 'dva/fetch';
import { notification } from 'antd';
import React,{ Fragment } from 'react';
import { gatewayUrl, homepage } from '@/defaultSettings';
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
  // 请求的URL: gatewayUrl + url
  let reqUrl = gatewayUrl + url;
  // if (url==='/console/ws/gateway/service/getApiNum'){
  //   reqUrl = 'http://10.4.45.127:8040' + url
  // }
  const result = fetch(reqUrl, newOptions)
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
        // 用户未登录，直接登出
        // window.g_app._store.dispatch({
        //   type: 'login/fetchLogout',
        // });
      }
    });
  if (result) {
    result.then(res => {
      if (res && res.code === 401 && window.location.pathname !== homepage) {
        // 用户未登录，直接登出
        // window.g_app._store.dispatch({
        //   type: 'login/fetchLogout',
        // });
      }
    });
  }
  return result;
};

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [option] The options we want to pass to "fetch"
 */
export default function request(url, option) {
  return doRequest(url, option);
}

