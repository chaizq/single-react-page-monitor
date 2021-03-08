import ReactDOM from 'react-dom';
import { Empty } from 'antd';
import DataSet from '@antv/data-set';
import { Axis, Chart, Geom, Legend, Tooltip } from 'bizcharts';
import React from 'react';

/**
 * editType与服务类型对照表
 */
export const editTypeMap = {
  manual: '通用服务(REST)',
  soap: '通用服务(SOAP)',
  hz_soap: '杭州通用服务(SOAP)',
  dataApi: '数据服务(REST)',
  publish: '推送服务(REST)',
  fixed: '定点推送服务(REST)',
  auto: '服务池服务(REST)',
  hz_pub_soap: '杭州推送服务(SOAP)',
  hz_unite_soap: '杭州统一入口服务(SOAP)',
};

/**
 * 图表组件以Arr中的attr属性作为索引，绘制柱状图
 * 该方法用于处理索引属性重名的情况，正确显示Arr中的所有数据
 * attr取值：”label“
 * @param {图表数据数组} Arr
 * @param {索引属性} attr
 */
// eslint-disable-next-line import/prefer-default-export
export const modifyDuplicateLabel = (Arr, attr) => {
  const map = new Map();
  const resArr = [];
  let count = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const item of Arr) {
    if (!map.has(item[attr])) {
      map.set(item[attr], item);
    } else {
      item[attr] = `${item[attr]}_(${(count += 1)})`;
      map.set(`${item[attr]}`, item);
    }
  }
  map.forEach(value => {
    resArr.push(value);
  });
  return resArr;
};

/**
 * 判断字符串是否为JSON str
 * @param {String} str
 */
export const isJsonStr = str => {
  if (typeof str === 'string' && str.startsWith('{')) {
    try {
      const obj = JSON.parse(str);
      return typeof obj === 'object' && obj;
    } catch (e) {
      return false;
    }
  }
  return false;
};

/**
 * 判断字符串是否为XML str
 * 目前无法判断普通文本字符串与XML字符串
 * @param {String} str
 */
export const isXmlStr = str => {
  if (typeof str === 'string') {
    try {
      // Internet Explorer
      let xmlDoc;
      // eslint-disable-next-line no-undef,prefer-const
      xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
      xmlDoc.async = 'false';
      xmlDoc.loadXML(str);
      return true;
    } catch (e) {
      try {
        // Other Explorer
        const parser = new DOMParser();
        parser.parseFromString(str, 'text/xml');
        return true;
      } catch (e2) {
        return false;
      }
    }
  }
  return false;
};

/**
 * String 转 XML
 * @param {String} str
 */
export const string2XML = str => {
  const parser = new DOMParser();
  return parser.parseFromString(str, 'text/xml');
};

/**
 * XML 转 String
 * @param {Object} xmlObj
 */
export const xml2String = xmlObj => {
  return new XMLSerializer().serializeToString(xmlObj);
};

/**
 * 判断输入参数是否为数字
 * @param {String} str
 */
export const isRealNum = str => {
  return parseFloat(str).toString() !== 'NaN';
};

/**
 * 小数转百分数
 * @param {String} str
 * @param {Number} fixed
 */
export const numToPercent = (str, fixed) => {
  let result;
  if (isRealNum(str)) {
    result = (str * 100).toFixed(fixed);
    result += '%';
  } else {
    result = str;
  }
  return result;
};

/**
 * 小数保留位数
 * @param {number} val
 * @param {number} fixed
 */
export const toFixedNum = (val, fixed) => {
  let result;
  if (isRealNum(val)) {
    result = val.toFixed(fixed);
  } else {
    result = val;
  }
  return result;
};

/**
 * 时间戳 转 日期
 * 时间范围小于一天
 * @param {number} timestamp
 */
export const oneDayTimestampToDate = timestamp => {
  const date = new Date(timestamp);
  const addZero = t => {
    if (t < 10) {
      return '0' + t;
    }
    return t;
  };
  const res =
    date.getFullYear() +
    '-' +
    addZero(date.getMonth() + 1) +
    '-' +
    addZero(date.getDate()) +
    ' ' +
    addZero(date.getHours()) +
    ':' +
    addZero(date.getMinutes());
  return res;
};

/**
 * 时间戳 转 日期
 * 时间范围大于一天
 * @param {number} timestamp
 */
export const timestampToDate = timestamp => {
  const date = new Date(timestamp);
  const addZero = t => {
    if (t < 10) {
      return '0' + t;
    }
    return t;
  };

  const res =
    date.getFullYear() + '-' + addZero(date.getMonth() + 1) + '-' + addZero(date.getDate());
  return res;
};

/**
 * 服务监控页图表统一样式设置，在如下两个方法中使用
 * drawSingleSerMixChart
 * drawSingleSerLineChart
 */
const localStyles = {
  mainTitle: {
    padding: '5px 0 8px 0',
    fontFamily: 'PingFangSC-Semibold',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#444444',
    letterSpacing: '0',
    lineHeight: '30px',
  },
  yAxisLabelLeft: {
    fontFamily: 'PingFangSC-Regular',
    fontSize: '12px',
    color: '#666666',
    letterSpacing: 0,
  },
  yAxisLabelRight: {
    fontFamily: 'PingFangSC-Regular',
    fontSize: '12px',
    float: 'right',
    color: '#666666',
    letterSpacing: 0,
  },
};

/**
 * 服务监控页，处理单个服务综合图表的数据，并为其分配节点ID
 * @param {Object} param 图表数据
 * @param {String} domId 图表Dom节点ID
 */
// compChartRef 即官方demo中的 this.chart，工具类中调用该函数this不指向此处apimUtils，因此需要声明一个chartRef代替原this.chart
let compChartRef = null;
export const drawSingleSerMixChart = (param, domId) => {
  const { title, data, categoryType } = param;
  // let compChartRef = null;

  if (typeof data === 'undefined' || data === null || JSON.stringify(data) === '[]') {
    ReactDOM.render(
      <Empty style={{ minHeight: '413px' }} description={false} />,
      document.getElementById(domId)
    );
    return;
  }

  const ds = new DataSet();
  ds.setState('type', '');
  const dv = ds.createView().source(data);

  let legendItems = [];
  let axisTitle = '';

  if (categoryType === 'top20') {
    axisTitle = '调用量/错误量';
    legendItems = [
      { value: 'invkCount', marker: { symbol: 'square', fill: '#259BFF', radius: 5 } },
      { value: 'invkErrorCount', marker: { symbol: 'square', fill: '#FE5562', radius: 5 } },
      {
        value: 'executeTime',
        marker: { symbol: 'hyphen', stroke: '#0DE488', radius: 5, lineWidth: 3 },
      },
    ];

    dv.transform({
      type: 'fold',
      fields: ['invkCount', 'invkErrorCount'], // 展开字段集
      key: 'type', // 键 key字段
      value: 'value', // 值 value字段
    }).transform({
      type: 'filter',
      callback: d => {
        // console.log(ds.state.type);
        return d.type !== ds.state.type;
      },
    });
  } else if (categoryType === 'resTime') {
    axisTitle = '调用量';
    legendItems = [
      { value: 'invkCount', marker: { symbol: 'square', fill: '#F57900', radius: 5 } },
      {
        value: 'executeTime',
        marker: { symbol: 'hyphen', stroke: '#0DE488', radius: 5, lineWidth: 3 },
      },
    ];

    dv.transform({
      type: 'fold',
      fields: ['invkCount'], // 展开字段集
      key: 'type', // 键 key字段
      value: 'value', // 值 value字段
    }).transform({
      type: 'filter',
      callback: d => {
        // console.log(ds.state.type);
        return d.type !== ds.state.type;
      },
    });
  }
  const scale = {
    // x轴label属性设为cat离散型
    label: {
      type: 'cat',
      // type: 'timeCat', // timeCat 更美观，但单日期的显示仍有问题，需要进一步处理
      mask: 'YYYY-MM-DD HH:mm',
    },
    executeTime: {
      type: 'linear',
      alias: '响应时间',
    },
  };

  const TimeLineGemo = <Geom type="line" position="label*executeTime" color="#0DE488" shape="smooth" size={2} />
  const CountBarGemo = <Geom
    type="interval"
    position="label*value"
    color={['type', value => {
      if (value === 'invkErrorCount') {
          return '#FE5562';
        }
        if (value === 'invkCount') {
          if (categoryType === 'resTime') {
            return '#F57900';
          }
          return '#259BFF';
        }
        return null;
      },
    ]}
    tooltip={[
      'type*value',
      (type, val) => {
        const obj = { invkCount: '调用量', invkErrorCount: '错误量' };
        return {
          name: obj[type],
          value: val,
        };
      },
    ]}
    adjust={[
      {
        type: 'dodge',
        marginRatio: 1 / 32,
      },
    ]}
  />

  ReactDOM.render(
    <Chart
      height={339}
      forceFit
      data={dv}
      scale={scale}
      padding="auto"
      onGetG2Instance={c => {
        compChartRef = c;
      }}
    >
      <h3 className="main-title" style={localStyles.mainTitle}>
        {title.serName + title.date}
      </h3>
      { categoryType === "resTime" ? <h4 style={localStyles.yAxisLabelLeft}>
          响应时间(ms)
          <span style={localStyles.yAxisLabelRight}>{axisTitle}</span>
        </h4>:
        <h4 style={localStyles.yAxisLabelLeft}>
          {axisTitle}
          <span style={localStyles.yAxisLabelRight}>响应时间(ms)</span>
        </h4>
      }

      <Legend
        custom
        allowAllCanceled
        items={legendItems}
        itemFormatter={val => {
          const obj = { invkCount: '调用量', invkErrorCount: '错误量', executeTime: '响应时间' };
          return obj[val]; // val 为每个图例项的文本值
        }}
        onClick={ev => {
          setTimeout(() => {
            const { checked } = ev;
            const { value } = ev.item;
            if (value === 'executeTime') {
              if (checked) {
                compChartRef.get('geoms')[1].show(); // get('geoms')[1] 指本chart内index为1的<Geom>标签
              } else {
                compChartRef.get('geoms')[1].hide();
              }
            }
            const newLegend = legendItems.map(item => {
              const tempItem = item;
              if (tempItem.value === value) {
                tempItem.checked = checked;
              }
              return tempItem;
            });
            compChartRef.filter('type', t => {
              const legendCfg = newLegend.find(i => i.value === t);
              return legendCfg && legendCfg.checked;
            });
            compChartRef.legend({
              items: newLegend,
            });
            compChartRef.repaint();
            // console.log(this.view)
          }, 0);
        }}
      />
      <Axis
        name="label"
        visible
        label={{
          rotate: -55,
          offset: 28,
          autoRotate: false,
          textStyle: {
            fontSize: '12',
            textAlign: 'center',
            fill: '#000000',
          }, // 坐标轴文本属性配置
          // eslint-disable-next-line
          formatter(text, item, index) {
            if (title.date !== '' && typeof title.date !== 'undefined') {
              return text.substring(10, text.length);
            }
            return text.substring(5);
          },
        }}
      />
      <Axis name="invkCount" position={categoryType === "resTime" ? "left" : "right"} />

      <Tooltip />
      {/*根据Geom的先后顺序确定y轴顺序，第一个Geom的y轴默认在左侧，第二个在右侧，
         因此调整JSX DOM先后顺序即可实现y轴位置调整，两个JSX用数组的方式拼接即可 */}
      { categoryType === "resTime" ? [TimeLineGemo, CountBarGemo] : [CountBarGemo, TimeLineGemo]}
      {/* <Geom type="line" position="label*executeTime" color="#0DE488" shape="dotSmooth" size={2} /> */}
    </Chart>,
    document.getElementById(domId)
  );
};

/**
 * 服务监控页，处理单个服务线性图表的数据，并为其分配节点ID
 * @param {Object} param 图表数据
 * @param {String} domId 图表Dom节点ID
 */
let lineChartRef = null;
export const drawSingleSerLineChart = (param, domId) => {
  const { title, data, categoryType } = param;
  if (typeof data === 'undefined' || data === null || JSON.stringify(data) === '[]') {
    ReactDOM.render(
      <Empty style={{ minHeight: '413px' }} description={false} />,
      document.getElementById(domId)
    );
    return;
  }

  const ds = new DataSet();
  ds.setState('type', '');
  const dv = ds.createView().source(data);

  let chartTitle = '';
  let color_code = '';
  let legendItems = [];

  if (categoryType === 'error') {
    chartTitle = '错误量';
    color_code = '#FE5562';
    legendItems = [
      { value: 'invkErrorCount', marker: { symbol: 'square', fill: '#FE5562', radius: 5 } },
    ];

    dv.transform({
      type: 'fold',
      fields: ['invkErrorCount'], // 展开字段集
      key: 'type', // 键 key字段
      value: 'value', // 值 value字段
    }).transform({
      type: 'filter',
      callback: d => {
        // console.log(ds.state.type);
        return d.type !== ds.state.type;
      },
    });
  } else if (categoryType === 'call') {
    chartTitle = '并发量';
    color_code = '#F57900';
    legendItems = [
      { value: 'invkCount', marker: { symbol: 'square', fill: '#F57900', radius: 5 } },
    ];

    dv.transform({
      type: 'fold',
      fields: ['invkCount'], // 展开字段集
      key: 'type', // 键 key字段
      value: 'value', // 值 value字段
    }).transform({
      type: 'filter',
      callback: d => {
        // console.log(ds.state.type);
        return d.type !== ds.state.type;
      },
    });
  }
  const scale = {
    // x轴label属性设为cat离散型
    label: {
      type: 'cat',
      // type: 'timeCat', // timeCat 更美观，但单日期的显示仍有问题，需要进一步处理
      mask: 'YYYY-MM-DD HH:mm',
    },
    executeTime: {
      type: 'linear',
      alias: '响应时间',
    },
  };

  ReactDOM.render(
    <Chart
      height={339}
      forceFit
      data={dv}
      scale={scale}
      padding="auto"
      onGetG2Instance={c => {
        lineChartRef = c;
      }}
    >
      <h3 className="main-title" style={localStyles.mainTitle}>
        {title.serName + title.date}
      </h3>
      <h4 style={localStyles.yAxisLabelLeft}>{chartTitle}</h4>
      <Legend
        custom
        allowAllCanceled
        items={legendItems}
        itemFormatter={val => {
          const obj = { invkErrorCount: '错误量', invkCount: '并发量' };
          return obj[val]; // val 为每个图例项的文本值
        }}
        onClick={ev => {
          setTimeout(() => {
            const { checked } = ev;
            const { value } = ev.item;
            const newLegend = legendItems.map(item => {
              const tempItem = item;

              if (tempItem.value === value) {
                tempItem.checked = checked;
              }
              return tempItem;
            });
            lineChartRef.filter('type', t => {
              const legendCfg = newLegend.find(i => i.value === t);
              return legendCfg && legendCfg.checked;
            });

            lineChartRef.legend({
              items: newLegend,
            });
            lineChartRef.repaint();
            // console.log(this.view)
          }, 0);
        }}
      />
      {/* 默认的横轴name="label"，label在该图表组件中代表横轴数据，类似关键字 */}
      <Axis
        name="label"
        visible
        label={{
          rotate: -55,
          offset: 28,
          autoRotate: false,
          textStyle: {
            fontSize: '12',
            textAlign: 'center',
            fill: '#000000',
          }, // 坐标轴文本属性配置
          // eslint-disable-next-line
          formatter(text, item, index) {
            if (title.date !== '' && typeof title.date !== 'undefined') {
              return text.substring(10, text.length);
            }
            return text.substring(5);
          },
        }}
      />
      <Axis name="invkErrorCount" position="left" />
      <Tooltip />
      <Geom
        type="interval"
        position="label*value"
        size={8}
        color={color_code}
        tooltip={[
          'type*value',
          (type, val) => {
            const obj = { invkErrorCount: '错误量', invkCount: '调用量' };
            return {
              name: obj[type],
              value: val,
            };
          },
        ]}
      />
      {/* <Geom
        type="point"
        position="label*value"
        size={4}
        shape="circle"
        color={color_code}
        style={{
          stroke: '#fff',
          lineWidth: 1,
        }}
      /> */}
    </Chart>,
    document.getElementById(domId)
  );
};

/**
 * 根据key属性数组去重
 * @param {Array} Arr
 * @param {String} attr
 */
export const uniq = (Arr, attr) => {
  if (typeof Arr === 'undefined' || Arr === null) {
    console.log('输入数组或字段不正确，请检查');
    return Arr;
  }
  const res = new Map();
  return Arr.filter(item => !res.has(item[attr]) && res.set(item[attr], 1));
};
