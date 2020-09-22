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
  productCode : 'DataCatalog',
  dcatHomepageArray: [
    '/api',
    '/data',
    '/file',
    '/assets/assets',
    '/assets/datamap',
    '/monitor',
    '/DataCatalog/consoleHome',
  ], // 依据先后顺序进行匹配，使用时需要根据使用用户的权限判断
  modulePrivilegeMap: {
    api: ['api', 'DataCatalog/api', 'monitor/service'],
    data: ['data', 'DataCatalog/data'],
    file: ['file', 'DataCatalog/file'],
  },
};
