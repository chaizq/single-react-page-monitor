module.exports = {
  navTheme: 'dark', // theme for nav menu
  primaryColor: '#1890FF', // primary color of ant design
  layout: 'sidemenu', // nav menu position: sidemenu or topmenu
  contentWidth: 'Fluid', // layout of content: Fluid or Fixed, only works when layout is topmenu
  fixedHeader: true, // sticky header
  autoHideHeader: false, // auto hide header
  fixSiderbar: true, // sticky siderbar
  menu: {
    disableLocal: false,
  },
  pwa: true,
  iconfontUrl: '',
  homepage: '/home',

  // 内部集成的产品信息(大驼峰命名)
  eurekaProducts: ['DataModel'],
  // 外部集成的产品信息(大驼峰命名)
  integrateProducts: [
    'Common', // 占位产品，用于部分服务不对接产品的场景，如审批服务。
    'MM',
    'DataCatalog',
    'DataStandard',
    'Issue',
  ],
  // 单产品多服务配置(小驼峰命名+“Service”)
  productServices: {
    Common: ['reviewService'],
    DataCatalog: ['apimConsoleService', 'apimGatewayService', 'mmService'],
    DataModel: ['dsdService'],
  },
  // APIM后台服务地址设置（单页面使用到的地址）
  gatewayUrl :'http://10.16.52.88:8090',
  // gatewayUrl :'http://10.4.46.34:8040',
};
