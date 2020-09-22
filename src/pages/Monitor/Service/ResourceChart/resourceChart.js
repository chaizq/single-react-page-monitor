import React, { Component } from 'react';
import { Card, Row, Col, Modal, message, Button } from 'antd';
// import { connect } from 'umi';
import { connect } from 'dva';
import DataSet from '@antv/data-set';
import numeral from 'numeral';

import ReactDOM from 'react-dom';
import { Chart, Geom, Axis, Tooltip, Legend, Coord, Label } from 'bizcharts';
import {
  numToPercent,
  toFixedNum,
  modifyDuplicateLabel,
  oneDayTimestampToDate,
  timestampToDate,
  drawSingleSerMixChart,
  drawSingleSerLineChart,
} from '@/utils/Apim/apimUtils';
import TimeBar from '@/pages/Monitor/Service/Timebar/timeBar';
import {BarChartOutlined} from "@ant-design/icons";
import styles from './resourceChart.less';

const Now = new Date();
const MonthFirstDay = new Date(Now.getFullYear(), Now.getMonth(), 1);
const MonthNextFirstDay = new Date(Now.getFullYear(), Now.getMonth() + 1, 1);
const MonthLastDay = new Date(MonthNextFirstDay - 1);
const localStyles = {
  mainTitle: {
    padding: '25px 0 8px 0',
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

@connect(() => ({}))
class ResourceChart extends Component {
  constructor(props) {
    super(props);
    // 单个服务图表首次加载默认显示本月的数据
    this.state = {
      modalCurrent: {
        start: MonthFirstDay.getTime(),
        end: MonthLastDay.getTime(),
        text: '本月',
      },
      // modalCurrent:{
      //   start:new Date(new Date().toLocaleDateString()).getTime(),
      //   end:new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1,
      //   text:'今日'
      // },
      singleSerParam: {},
      lineModalVisible: false,
      barModalVisible: false,
    };
  }

  componentDidMount() {
    const { current, invokeStaticData } = this.props;
    this.setState({ currentText: current.text });
    this.getResourceData(invokeStaticData);
  }

  UNSAFE_componentWillReceiveProps = nextProps => {
    // nextProps接收父组件中props传值的变化情况，父组件中current变化，nextProps.current值变化
    const { current, invokeStaticData } = this.props;

    if (nextProps.current !== current) {
      this.setState({ currentText: nextProps.current.text });
    }
    if (nextProps.invokeStaticData !== invokeStaticData) {
      this.getResourceData(nextProps.invokeStaticData);
    }
  };

  // 工具类方法
  compare = key => {
    return (a, b) => {
      return a[key] - b[key];
    };
  };

  getMaxVal = (arr, key) => {
    const sortArr = [];
    arr.forEach(item => {
      sortArr.push(item[key]);
    });

    sortArr.sort((a, b) => {
      return b - a;
    });
    return (sortArr[0] + 0.05).toFixed(3); // 百分数轴max值增加5%,拉长轴宽以显示label
  };

  chartClick = (e, type) => {
    /*
    console.log(e)
    console.log(this.chart)
    console.log(this.chart.getTooltipItems({
      x:e.x,
      y:e.y
    }))
    */
    let toolData;
    let param = {};

    switch (type) {
      case 'top20':
        drawSingleSerMixChart(
          {
            data: [],
            title: {},
            categoryType: type,
          },
          'single_service_line_chart'
        );
        toolData = this.top20Chart.getTooltipItems({
          x: e.x,
          y: e.y,
        });
        if ('point' in toolData[0]) {
          param = {
            // eslint-disable-next-line no-underscore-dangle
            title: toolData[0].point._origin.label,
            // eslint-disable-next-line no-underscore-dangle
            key: toolData[0].point._origin.key,
            type,
          };
        }
        this.setState({
          singleSerParam: param,
        });
        this.getSingleSerData(param);
        this.setState({
          lineModalVisible: true,
        });

        break;
      case 'error':
        drawSingleSerLineChart(
          {
            data: [],
            title: {},
            categoryType: type,
          },
          'single_service_error_chart'
        );
        toolData = this.barChartRef.getTooltipItems({
          x: e.x,
          y: e.y,
        });
        toolData.forEach(item => {
          if ('point' in item) {
            param = {
              title: item.point.point.label,
              key: item.point.point.key,
              type,
            };
          }
        });
        this.setState({
          singleSerParam: param,
        });
        this.getSingleSerData(param);
        this.setState({
          barModalVisible: true,
        });

        break;
      default:
        break;
    }
  };

  getSingleSerData = param => {
    if (param.key !== null) {
      const { dispatch } = this.props;
      const { modalCurrent } = this.state;

      dispatch({
        type: 'gatewayConsole/getInvokeApiInfo',
        payload: {
          apiId: param.key,
          start: modalCurrent.start,
          end: modalCurrent.end,
        },
      }).then(response => {
        let res = null;
        if (!response) {
          message.error('获取该项服务数据失败');
          return;
        }
        res = response;
        if (res instanceof Object) {
          const singleChartData = [];
          let dateTitle = '';

          res.aggregations.api_over_time.forEach(item => {
            const temp = {
              key: '',
              label: '',
              invkCount: '',
              invkErrorCount: '',
              executeTime: '',
            };
            temp.key = item.key; // 服务key，即服务id
            // temp.label = item.key_as_string;
            if (modalCurrent.end - modalCurrent.start <= 86400000) {
              const tempDate = new Date(item.key);
              dateTitle = ` [${tempDate.getFullYear()}-${tempDate.getMonth() +
              1}-${tempDate.getDate()}]`;

              temp.label = oneDayTimestampToDate(item.key);
            } else {
              temp.label = timestampToDate(item.key);
            }
            temp.invkCount = item.doc_count;
            temp.invkErrorCount = 0;
            if ('exception' in item && 'buckets' in item.exception) {
              item.exception.buckets.forEach(i => {
                if ('key_as_string' in i && 'doc_count' in i) {
                  if (i.key_as_string === 'true') {
                    // 该字段为ture时，代表是错误调用
                    temp.invkErrorCount = i.doc_count;
                  }
                }
              });
            }
            temp.executeTime =
              item.avg_execute_time.value === null ? 0 : toFixedNum(item.avg_execute_time.value, 0);
            singleChartData.push(temp);
          });

          const chartParam = {
            data: singleChartData,
            title: {
              serName: param.title,
              date: dateTitle,
            },
            categoryType: param.type,
          };

          if (param.type === 'top20') {
            drawSingleSerMixChart(chartParam, 'single_service_line_chart');
          } else {
            drawSingleSerLineChart(chartParam, 'single_service_error_chart');
          }
        } else {
          message.error('获取该项服务数据失败');
        }
      });
    }
  };

  hideModal = () => {
    this.setState({
      modalCurrent: {
        start: MonthFirstDay.getTime(),
        end: MonthLastDay.getTime(),
        text: '本月',
      },
      singleSerParam: {},
      lineModalVisible: false,
      barModalVisible: false,
    });
  };

  // TimeBar按钮点击或日期选择器改变时会触发该函数，用于接收TimeBar组件传的起止时间戳
  receiveValue = val => {
    this.setState(
      {
        modalCurrent: {
          start: val.start,
          end: val.end,
          text: val.text,
        },
      },
      () => {
        // 回调中可以取到新的state值
        const { singleSerParam } = this.state;
        this.getSingleSerData(singleSerParam);
      }
    );
  };

  // 获取数据与绘制图表
  getResourceData = data => {
    if (typeof data === 'undefined' || JSON.stringify(data) === '{}' || data === null) return;
    const res = data;

    let serviceCountRes;
    if (JSON.stringify(res.serviceCountRes.aggregations) === '{}') {
      serviceCountRes = 0;
    } else {
      serviceCountRes = res.serviceCountRes.aggregations.api_ids.value; // 调用服务总数
    }

    let UVCountRes;
    if (JSON.stringify(res.UVCountRes.aggregations) === '{}') {
      UVCountRes = 0;
    } else {
      UVCountRes = res.UVCountRes.aggregations.accountCount.value; // UV数
    }

    let topKServiceInvkCountRes;
    if (JSON.stringify(res.topKServiceInvkCountRes.aggregations) === '{}') {
      topKServiceInvkCountRes = [];
    } else {
      topKServiceInvkCountRes = res.topKServiceInvkCountRes.aggregations.api_ids; // Top20调用量图表
    }

    // const serviceErrorCountRes = res.serviceErrorCountRes.aggregations.api_ids.value; // 调用异常服务数
    const serviceInvkCountRes = res.serviceInvkCountRes.total; // 调用量
    const serviceInvkErrorCountRes = res.serviceInvkErrorCountRes.total; // 调用量错误量
    const errorRate = serviceInvkErrorCountRes / serviceInvkCountRes; // 调用错误率
    const top20ServiceCountArr = [];

    topKServiceInvkCountRes.forEach(item => {
      const temp = {
        key: '',
        label: '',
        invkCount: '',
        invkErrorCount: '',
        executeTime: '',
      };
      // eslint-disable-next-line
      temp.key = item.key; // 服务key，即服务id
      // eslint-disable-next-line no-underscore-dangle
      temp.label = item.topK.hits.hits[0]._source['gateway.monitor.api_name'];
      temp.invkCount = item.doc_count;
      temp.invkErrorCount = 0;
      if ('exception' in item && 'buckets' in item.exception) {
        item.exception.buckets.forEach(i => {
          if ('key_as_string' in i && 'doc_count' in i) {
            if (i.key_as_string === 'true') {
              // 该字段为ture时，代表是错误调用
              temp.invkErrorCount = i.doc_count;
            }
          }
        });
      }
      temp.executeTime = toFixedNum(item.avg_execute_time.value, 0);
      top20ServiceCountArr.push(temp);
    });

    let topKServiceInvkErrorCountRes;
    if (JSON.stringify(res.topKServiceInvkErrorCountRes.aggregations) === '{}') {
      topKServiceInvkErrorCountRes = 0;
    } else {
      topKServiceInvkErrorCountRes = res.topKServiceInvkErrorCountRes.aggregations.api_ids; // Top20错误数
    }
    const topKServiceInvkErrorCountResTotal = res.topKServiceInvkErrorCountRes.total; // Top20错误总量数
    const top20ServiceErrorCountArr = [];

    topKServiceInvkErrorCountRes.forEach(item => {
      const temp = {
        label: '',
        count: '',
      };
      temp.key = item.key; // 服务key，即服务id
      // eslint-disable-next-line
      temp.label = item.topK.hits.hits[0]._source['gateway.monitor.api_name'];
      temp.count = item.doc_count / topKServiceInvkErrorCountResTotal;
      top20ServiceErrorCountArr.push(temp);
    });
    this.setState({
      serviceCountRes,
      serviceInvkCountRes,
      serviceInvkErrorCountRes,
      errorRate: Number.isNaN(errorRate) ? '--' : errorRate,
      UVCountRes,
      // top20ServiceCountArr,
      // top20ServiceErrorCountArr
    });

    if (typeof top20ServiceCountArr !== 'undefined') {
      this.lineColumnChart(top20ServiceCountArr);
    }
    if (typeof top20ServiceErrorCountArr !== 'undefined') {
      this.barChart(top20ServiceErrorCountArr);
    }
  };

  lineColumnChart(chartData) {
    const data = modifyDuplicateLabel(chartData, 'label');

    const ds = new DataSet();
    ds.setState('type', '');
    const dv = ds.createView().source(data);

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
    const scale = {
      executeTime: {
        type: 'linear',
        alias: '响应时间',
      },
    };

    /* let chartIns = null;

    const getG2Instance = (chart) => {
      chartIns = chart;
    }; */

    const legendItems = [
      { value: 'invkCount', marker: { symbol: 'square', fill: '#259BFF', radius: 5 } },
      { value: 'invkErrorCount', marker: { symbol: 'square', fill: '#FE5562', radius: 5 } },
      {
        value: 'executeTime',
        marker: { symbol: 'hyphen', stroke: '#0DE488', radius: 5, lineWidth: 3 },
      },
    ];

    ReactDOM.render(
      <Chart
        height={300}
        width={500}
        forceFit
        data={dv}
        scale={scale}
        padding="auto"
        onGetG2Instance={c => {
          this.top20Chart = c;
        }}
        onPlotClick={e => {
          this.chartClick(e, 'top20');
        }}
      >
        <h3 className="main-title" style={localStyles.mainTitle}>
          TOP20 服务调用量
        </h3>
        {/* eslint-disable-next-line no-unused-expressions */}
        <h4 style={localStyles.yAxisLabelLeft}>
          调用量/错误量<span style={localStyles.yAxisLabelRight}>响应时间(ms)</span>
        </h4>
        <Legend
          custom
          allowAllCanceled
          items={legendItems}
          itemFormatter={val => {
            const obj = {
              invkCount: '调用量',
              invkErrorCount: '错误量',
              executeTime: '响应时间',
            };
            return obj[val]; // val 为每个图例项的文本值
          }}
          onClick={ev => {
            setTimeout(() => {
              const { checked } = ev;
              const { value } = ev.item;
              if (value === 'executeTime') {
                if (checked) {
                  this.top20Chart.get('geoms')[1].show(); // get('geoms')[1] 指本chart内index为1的<Geom>标签
                } else {
                  this.top20Chart.get('geoms')[1].hide();
                }
              }
              const newLegend = legendItems.map(item => {
                const tempItem = item;
                if (tempItem.value === value) {
                  tempItem.checked = checked;
                }
                return tempItem;
              });
              this.top20Chart.filter('type', t => {
                const legendCfg = newLegend.find(i => i.value === t);
                return legendCfg && legendCfg.checked;
              });
              this.top20Chart.legend({
                items: newLegend,
              });
              this.top20Chart.repaint();
              // console.log(this.view)
            }, 0);
          }}
        />
        <Axis
          name="label"
          visible
          label={{
            rotate: -50,
            offset: 48, // 与坐标x轴距离
            autoRotate: false,
            textStyle: {
              fontSize: '12',
              textAlign: 'center',
              fill: '#000000',
            }, // 坐标轴文本属性配置
            // eslint-disable-next-line
            formatter(text, item, index) {
              if (text.length > 10) {
                const str = text.substring(0, 10);
                return str + '..';
              }
              return text;
            },
          }}
        />
        <Axis name="key" label={null} />
        <Axis name="invkCount" position="left" />
        <Axis name="executeTime" position="right" />
        <Tooltip />
        <Geom
          type="interval"
          position="label*value"
          color={[
            'type',
            value => {
              if (value === 'invkCount') {
                return '#259BFF';
              }
              if (value === 'invkErrorCount') {
                return '#FE5562';
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
        <Geom type="line" position="label*executeTime" color="#0DE488" shape="dotSmooth" size={2} />
      </Chart>,
      document.getElementById('top20_count_chart')
    );
  }

  barChart(chartData) {
    const tempData = modifyDuplicateLabel(chartData, 'label');
    const data = tempData.sort(this.compare('count'));

    let maxVal = this.getMaxVal(chartData, 'count');
    if (typeof maxVal === 'undefined' || maxVal === null || maxVal === '') {
      maxVal = 1;
    }

    const sales = {
      count: {
        min: 0,
        max: maxVal,
        tickInterval: 0.1,
      },
    };

    ReactDOM.render(
      <Chart
        height={300}
        width={500}
        data={data}
        scale={sales}
        padding="auto"
        onGetG2Instance={c => {
          this.barChartRef = c;
        }}
        onPlotClick={e => {
          this.chartClick(e, 'error');
        }}
      >
        <h3 className="main-title" style={localStyles.mainTitle}>
          服务调用错误量排名占比
        </h3>
        <Coord transpose />
        <Axis
          name="label"
          label={{
            // eslint-disable-next-line
            formatter(text, item, index) {
              if (text.length > 10) {
                const front = text.substring(0, 10);
                return front + '...';
              }
              return text;
            },
          }}
        />
        <Axis name="count" visible position="left" />
        <Tooltip />
        {/* 凸显类型 color={['label', '#E6F6C8-#3376CB']} */}
        <Geom
          type="interval"
          color={['count', '#259BFF']}
          position="label*count"
          tooltip={[
            'count',
            val => {
              return {
                name: '错误量占比',
                value: val,
              };
            },
          ]}
        >
          <Label content={['label*count', (name, value) => numeral(value || 0).format('0.0%')]} />{' '}
        </Geom>
      </Chart>,
      document.getElementById('error_chart')
    );
  }

  // 渲染
  render() {
    const {
      serviceCountRes,
      serviceInvkCountRes,
      serviceInvkErrorCountRes,
      errorRate,
      UVCountRes,
      currentText,
      lineModalVisible,
      barModalVisible,
      modalCurrent,
    } = this.state;
    const { showMoreInfo } = this.props;

    return (
      <div className={styles.chartsContent}>
        <Modal
          title="服务综合图表"
          visible={lineModalVisible}
          footer={null}
          width="76%"
          forceRender
          onCancel={this.hideModal}
          centered
          style={{ minWidth: '700px' }}
        >
          <div id="single_service_line_chart" />
          <TimeBar transValue={this.receiveValue} initValue={modalCurrent.text} />
        </Modal>

        <Modal
          title="服务调用错误量"
          visible={barModalVisible}
          footer={null}
          width="76%"
          forceRender
          onCancel={this.hideModal}
          centered
          style={{ minWidth: '700px' }}
        >
          <div id="single_service_error_chart" />
          <TimeBar transValue={this.receiveValue} initValue={modalCurrent.text} />
        </Modal>

        <Row>
          <Col span={20}>
             <span className={styles.currentText}>
            {currentText}
               <span className={styles.staticTitle}>&nbsp;服务资源情况</span>

          </span>
          </Col>
          <Col span={4}>
            <Button
              icon={<BarChartOutlined />}
              onClick={() => {
                showMoreInfo();
              }}
              style={{ marginTop: '7px', float: 'right',background: '#e6f7ff', borderRadius:'10px' }}
            >
              更多
            </Button>
          </Col>

        </Row>
        <Row
          type="flex"
          justify="center"
          className={styles.labelRow}
          style={{ margin: '0 -15px 0 -15px' }}
        >
          <Col style={{ width: '20%' }}>
            <Card className={styles.labelCard} style={{ borderLeft: 'none' }}>
              <Row>
                <Col span={12} className={styles.labelText}>
                  调用服务总数
                </Col>
                <Col span={12} className={styles.value}>
                  {serviceCountRes}
                </Col>
              </Row>

            </Card>
          </Col>

          <Col style={{ width: '20%' }}>
            <Card className={styles.labelCard}>
              <Row>
                <Col span={12} className={styles.labelText}>
                  UV量
                </Col>
                <Col span={12} className={styles.value}>
                  {UVCountRes}
                </Col>
              </Row>

            </Card>
          </Col>

          <Col style={{ width: '20%' }}>
            <Card className={styles.labelCard}>
              <Row>
                <Col span={12} className={styles.labelText}>
                  调用量
                </Col>
                <Col span={12} className={styles.value}>
                  {serviceInvkCountRes}
                </Col>
              </Row>

            </Card>
          </Col>

          <Col style={{ width: '20%' }}>
            <Card className={styles.labelCard}>
              <Row>
                <Col span={12} className={styles.labelText}>
                  调用错误量
                </Col>
                <Col span={12} className={styles.value}>
                  {serviceInvkErrorCountRes}
                </Col>
              </Row>
            </Card>
          </Col>

          <Col style={{ width: '20%' }}>
            <Card className={styles.labelCard} style={{ borderRight: 'none' }}>
              <Row>
                <Col span={12} className={styles.labelText}>
                  调用错误率
                </Col>
                <Col span={12} className={styles.value}>
                  {numToPercent(errorRate, 2)}
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        <Row style={{ marginTop: '10px' }}>
          <Col span={12}>
            <div id="top20_count_chart" />
          </Col>
          <Col span={2}> </Col>
          <Col span={10}>
            <div id="error_chart" />
          </Col>
        </Row>
      </div>
    );
  }
}
export default ResourceChart;
