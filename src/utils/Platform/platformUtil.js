import { homepage } from '@/defaultSettings';
import { dcatHomepageArray } from '@/dcatSettings';
import moment from 'moment';
import { parse, stringify } from 'qs';
import React from 'react';

/**
 * 当前用户是否有某种权限
 * @param {*} currentUser 当前登录的用户对象
 * @param {*} authorityArr 判断是否有某些权限的列表
 */
export const hasAuthority = (currentUser, authorityArr) => {
  if (!currentUser || JSON.stringify(currentUser) === '{}' || !authorityArr) {
    return false;
  }
  const { privilegeList } = currentUser;
  if (!privilegeList || privilegeList.length === 0) {
    return false;
  }
  const authority = privilegeList.filter(item => authorityArr.indexOf(item.code) > -1);
  if (!authority || authority.length === 0) {
    return false;
  }
  return true;
};

/**
 * 根据url获取productid
 * @param {*} pathname
 */
export const getProductId = pathname => {
  let productid = '';
  if (pathname.includes('console/framepage/')) {
    const arr = pathname.split('/');
    productid = arr[arr.indexOf('framepage') + 1];
    return productid;
  }
  return productid;
};

/**
 * 获取menu的层级路径
 * @param {*} pathname
 */
export const getMenuUri = pathname => {
  let menuUri = '';
  if (pathname.includes('console/framepage/')) {
    const arr = pathname.split('/');
    if (arr.length >= 4) {
      arr.splice(0, 4);
      menuUri = arr.join('/');
    }
    return menuUri;
  }
  return menuUri;
};

/**
 * 获取登录的重定向url
 * @param {*} location
 */
export const getRedirectUrl = location => {
  if (!location) {
    return 'home';
  }
  return `${location.origin}/authorization`;
};

/**
 * 在SessionStorage
 * @param {*} diToken
 */
export const addSessionCache = (key, value) => {
  if (key) {
    window.sessionStorage.setItem(key, value);
  }
};

/**
 * 从sessionStorage中获取缓存的内容
 * @param {*} key
 */
export const getSessionCache = key => {
  if (key) {
    return window.sessionStorage.getItem(key);
  }
  return null;
};

/**
 * 清空sessionStorage中缓存
 * @param {*} key
 */
export const clearSessionCache = () => {
  return window.sessionStorage.clear();
};

/**
 * 获取param中的参数
 * @param {*} url
 * @param {*} paraName
 */
export const getUrlParam = (url, paraName) => {
  if (!url || !paraName) {
    return '';
  }
  const arrObj = url.split('?');
  if (arrObj.length > 1) {
    const arrPara = arrObj[1].split('&');
    let arr;
    for (let i = 0; i < arrPara.length; i += 1) {
      arr = arrPara[i].split('=');
      if (arr != null && arr[0] === paraName) {
        return arr[1];
      }
    }
    return '';
  }
  return '';
};

/**
 * 翻译单值代码
 * @param {*} codeList
 * @param {*} codeValue
 */
export const translateCode = (codeList, codeValue) => {
  let result = codeValue;
  if (codeList && codeValue) {
    const codeTmp = codeList.find(codeitem => {
      return codeitem.code === codeValue;
    });
    if (codeTmp) {
      result = codeTmp.name;
    }
  }
  return result;
};

/**
 * 获取产品信息
 * @param {*} productList
 * @param {*} codeValue
 */
export const getProductMenuDto = (productMenuList, codeValue) => {
  let result = {};
  if (productMenuList && codeValue) {
    const productMenuDto = productMenuList.find(product => {
      return product.code === codeValue;
    });
    if (productMenuDto) {
      result = productMenuDto;
    }
  }
  return result;
};

/**
 * 根据产品和code获取产品地址
 * @param {*} productList
 * @param {*} code
 */
export const getProductAddress = (productList, code) => {
  if (productList && code) {
    const product = productList.find(item => item.code === code);
    if (product) {
      return product.address;
    }
  }
  return '';
};

/**
 * 获取当前页面url参数，不存在返回undefined
 * @param {参数名称} variable
 */
export const getQueryVariable = variable => {
  const query = window.location.search.substring(1);
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i += 1) {
    const pair = vars[i].split('=');
    if (pair[0] === variable) {
      return pair[1];
    }
  }
  return undefined;
};

/**
 * 去掉所有的html标记
 * @param {*} str
 */
export const delHtmlTag = str => {
  return str.replace(/<[^>]+>/g, '');
};

export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}

/**
 * 获取成功登陆页面
 * @param currentUser
 * @returns {string}
 */
export const getLoginSuccessPage = currentUser => {
  const productCode = getSessionCache('productCode');
  const { privilegeList } = currentUser;
  let reLoginSucessPage = homepage;
  // 如果是目录，需要特殊处理一下
  if (productCode === 'DataCatalog' && privilegeList) {
    reLoginSucessPage = dcatHomepageArray.find(item => {
      return privilegeList.some(pItem => `/${pItem.code}` === item);
    });
  }
  return reLoginSucessPage;
};

export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - day * oneDay;

    return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [
      moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000),
    ];
  }

  const year = now.getFullYear();
  return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
}

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach(node => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}


function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!'); // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  }
  if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

function getRenderArr(routes) {
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    // 去重
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    // 是否包含
    const isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  return renderArr;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes(path, routerData) {
  let routes = Object.keys(routerData).filter(
    routePath => routePath.indexOf(path) === 0 && routePath !== path
  );
  // Replace path to '' eg. path='user' /user/name => name
  routes = routes.map(item => item.replace(path, ''));
  // Get the route to be rendered to remove the deep rendering
  const renderArr = getRenderArr(routes);
  // Conversion and stitching parameters
  const renderRoutes = renderArr.map(item => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      exact,
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
    };
  });
  return renderRoutes;
}

export function getPageQuery() {
  return parse(window.location.href.split('?')[1]);
}

export function getQueryPath(path = '', query = {}) {
  const search = stringify(query);
  if (search.length) {
    return `${path}?${search}`;
  }
  return path;
}

/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export function isUrl(path) {
  return reg.test(path);
}

export function formatWan(val) {
  const v = val * 1;
  if (!v || Number.isNaN(v)) return '';

  let result = val;
  if (val > 10000) {
    result = Math.floor(val / 10000);
    result = (
      <span>
        {result}
        <span
          style={{
            position: 'relative',
            top: -2,
            fontSize: 14,
            fontStyle: 'normal',
            marginLeft: 2,
          }}
        >
          万
        </span>
      </span>
    );
  }
  return result;
}

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export function isAntdPro() {
  return window.location.hostname === 'preview.pro.ant.design';
}

export const importCDN = (url, name) =>
  new Promise(resolve => {
    const dom = document.createElement('script');
    dom.src = url;
    dom.type = 'text/javascript';
    dom.onload = () => {
      resolve(window[name]);
    };
    document.head.appendChild(dom);
  });

/**
 * 转换数据库类型为汉字描述
 * @param type
 * @returns {string}
 */
export function convertColumnType(type) {
  if (
    type &&
    (type.toLowerCase().includes('char') ||
      type.toLowerCase().includes('text') ||
      type.toLowerCase().includes('longvarchar') ||
      type.toLowerCase().includes('varchar2') ||
      type.toLowerCase().includes('clob') ||
      type.toLowerCase().includes('varchar'))
  ) {
    return '字符串';
  } else if (
    type &&
    (type.toLowerCase().includes('int') ||
      type.toLowerCase().includes('decimal') ||
      type.toLowerCase().includes('numeric') ||
      type.toLowerCase().includes('number') ||
      type.toLowerCase().includes('long') ||
      type.toLowerCase().includes('float') ||
      type.toLowerCase().includes('double') ||
      type.toLowerCase().includes('short') ||
      type.toLowerCase().includes('byte') ||
      type.toLowerCase().includes('real') ||
      type.toLowerCase().includes('bit'))
  ) {
    return '数值';
  } else if (
    type &&
    (type.toLowerCase().includes('time') ||
      type.toLowerCase().includes('date') ||
      type.toLowerCase().includes('timestamp'))
  ) {
    return '时间';
  } else if (
    type &&
    (type.toLowerCase().includes('image') ||
      type.toLowerCase().includes('binary') ||
      type.toLowerCase().includes('varbinary') ||
      type.toLowerCase().includes('blob') ||
      type.toLowerCase().includes('varbinary_max'))
  ) {
    return '二进制';
  } else if (
    type &&
    (type.toLowerCase().includes('money') || type.toLowerCase().includes('smallmoney'))
  ) {
    return '货币';
  }
  return '其他';
}

/**
 * 生成UUID
 * @returns {string}
 */
export function generateUUID() {
  /* eslint no-bitwise: ["error", { "allow": ["|","&"] }] */
  let d = new Date().getTime();
  const uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, c => {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = (d / 16) | 0;
    if (r < 0) {
      r = -r;
    }
    return (c === 'x' ? r : (r & 0x7) | 0x8).toString(16);
  });
  return uuid;
}

export const getTextFromRichText = richText => {
  if (!richText) {
    return richText;
  }
  return richText.replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, '');
};

/**
 * 消息业务类型-code-0007
 */
export const getMessageBusinessType = () => {
  return {
    APPLY_DB_ALLOW: '1',
    APPLY_DB_NOTALLOW: '2',
    PUBLISH_DB_ALLOW: '3',
    PUBLISH_DB_NOTALLOW: '4',
    APPLY_API_ALLOW: '5',
    APPLY_API_NOTALLOW: '6',
    PUBLISH_API_ALLOW: '7',
    PUBLISH_API_NOTALLOW: '8',
    PUBLISH_FILE_ALLOW: '9',
    PUBLISH_FILE_NOTALLOW: '10',
    REVIEW_APPLY: '11',
    // MM消息业务类型
    ADD_ELEMENT_TYPE: 'MM0001',
    EDIT_ELEMENT_TYPE: 'MM0002',
    DELETE_ELEMENT_TYPE: 'MM0003',
    INGESTION_UPDATE_TYPE: 'MM0004',
  };
};
