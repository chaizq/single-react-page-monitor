import { IConfig } from 'umi-types';

// ref: https://umijs.org/config/
const config: IConfig =  {
  treeShaking: true,
  routes: [
    {
      path: '/',
      component: '../pages/Monitor/Service/index',
      routes: [
        { path: '/', component: '../pages/index' },
        { path: '/monitor', component: '../pages/Monitor/Service/index' }
      ]
    }
  ],
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react', {
      // umi 2.x 配置dva,antd
      antd: true,
      dva: true,
      dynamicImport: false,
      title: 'single-page-monitor',
      dll: false,

      routes: {
        exclude: [
          /components\//,
        ],
      },
    }],
  ],
  // 设置打包生成相对路径
  base:'./',
  publicPath:'./',
  history:'hash'
}

export default config;
