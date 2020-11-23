import React, { Component } from 'react';
import { Button, Card, Col, message, Modal, Row } from 'antd';
// import { connect } from 'umi';
import { connect } from 'dva';
import DataSet from '@antv/data-set';
import numeral from 'numeral';
import ReactDOM from 'react-dom';
import { Axis, Chart, Coord, Geom, Label, Legend, Tooltip } from 'bizcharts';
import {
  drawSingleSerLineChart,
  drawSingleSerMixChart,
  modifyDuplicateLabel,
  oneDayTimestampToDate,
  timestampToDate,
  toFixedNum,
} from '@/utils/Apim/apimUtils';
import TimeBar from '@/pages/Monitor/Service/Timebar/timeBar';
// import { BarChartOutlined } from '@ant-design/icons';
import styles from './performanceChart.less';

const Now = new Date();
const MonthFirstDay = new Date(Now.getFullYear(), Now.getMonth(), 1);
const MonthNextFirstDay = new Date(Now.getFullYear(), Now.getMonth() + 1, 1);
const MonthLastDay = new Date(MonthNextFirstDay - 1);

@connect((gatewayConsole) => ({
  moreInfoChartType: gatewayConsole.moreInfoChartType
}))
class PerformanceChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalCurrent: this.props.current,
      // modalCurrent: {
      //   start: MonthFirstDay.getTime(),
      //   end: MonthLastDay.getTime(),
      //   text: '本月',
      // },
      singleSerParam: {},
      lineModalVisible: false,
      barModalVisible: false,
    };
  }

  // 页面首次加载时执行一次
  componentDidMount() {
    const { current, invokeStaticData } = this.props;

    this.setState({ currentText: current.text });
    this.getPerformanceData(invokeStaticData, current);
  }

  // 可以接收动态传值并在render()之前更新state
  UNSAFE_componentWillReceiveProps = nextProps => {
    // nextProps接收父组件中props传值的变化情况，父组件中current变化，nextProps.current值变化
    const { current, invokeStaticData } = this.props;

    if (nextProps.current !== current) {
      this.setState({
        currentText: nextProps.current.text,
        modalCurrent: nextProps.current
      });
    }
    if (nextProps.invokeStaticData !== invokeStaticData) {
      this.getPerformanceData(nextProps.invokeStaticData, nextProps.current);
    }
  };

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
    return (parseFloat(sortArr[0]) + 0.05).toFixed(3); // 百分数轴max值增加5%,拉长轴宽以显示label
  };

  // 获取数据与绘制图表
  getPerformanceData = (data, current) => {
    if (typeof data === 'undefined' || JSON.stringify(data) === '{}' || data === null) return;
    const res = data;

    const avgExecuteTimeRes = res.avgExecuteTiemRes.aggregations.avg_execute_time.value;
    const topKExecuteTimeRes = res.topKExecuteTimeRes.aggregations.api_ids; // Top20响应时间图表
    const topKExecuteTimeResArr = [];
    topKExecuteTimeRes.forEach(item => {
      const temp = {
        label: '',
        count: '',
        executeTime: '',
      };
      temp.key = item.key;
      // eslint-disable-next-line
      temp.label = item.topK.hits.hits[0]._source['gateway.monitor.api_name'];
      temp.count = item.doc_count;

      if (item.avg_execute.value === null || typeof item.avg_execute.value === 'undefined') {
        message.error('响应时间数据加载失败');
      } else {
        temp.executeTime = toFixedNum(item.avg_execute.value, 0);
      }
      topKExecuteTimeResArr.push(temp);
    });

    const topKInvkRes = res.topKInvkRes.aggregations.api_ids; // Top20服务并发数占比
    const topKInvkResTotal = res.topKInvkRes.total; // Top20服务并发量
    const topTPS = (1000 * topKInvkResTotal) / (current.end - current.start);
    const topKInvkResArr = [];
    topKInvkRes.forEach(item => {
      const temp = {
        label: '',
        count: '',
      };
      temp.key = item.key;
      // eslint-disable-next-line
      temp.label = item.topK.hits.hits[0]._source['gateway.monitor.api_name'];
      temp.count = item.doc_count / topKInvkResTotal;
      topKInvkResArr.push(temp);
    });

    this.setState({
      avgExecuteTimeRes: avgExecuteTimeRes === null ? '--' : avgExecuteTimeRes,
      topTPS,
      // topKExecuteTimeResArr,
      // topKInvkResArr,
    });
    if (typeof topKExecuteTimeResArr !== 'undefined') {
      this.lineColumnChart(topKExecuteTimeResArr);
    }
    if (typeof topKInvkResArr !== 'undefined') {
      this.barChart(topKInvkResArr);
    }
  };

  lineColumnChart = chartData => {
    const data = modifyDuplicateLabel(chartData, 'label');
    const ds = new DataSet();
    ds.setState('type', '');
    const dv = ds.createView().source(data);

    dv.transform({
      type: 'fold',
      fields: ['count'], // 展开字段集
      key: 'type', // key字段
      value: 'value', // value字段
    }).transform({
      type: 'filter',
      callback: d => {
        return d.type !== ds.state.type;
      },
    });

    const scale = {
      executeTime: {
        type: 'linear',
        alias: '响应时间',
      },
    };

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

    /*
    let chartIns = null;

    const getG2Instance = (chart) => {
      chartIns = chart;
    };
    */

    const legendItems = [
      { value: 'count', marker: { symbol: 'square', fill: '#F57900', radius: 5 } },
      {
        value: 'executeTime',
        marker: { symbol: 'hyphen', stroke: '#0DE488', radius: 5, lineWidth: 3 },
      },
    ];

    // 渲染图表
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
          this.chartClick(e, 'resTime');
        }}
      >
        <h3 className="main-title" style={localStyles.mainTitle}>
          TOP20 最慢响应时间（ms）
        </h3>
        <h4 className="sub-title" style={localStyles.yAxisLabelLeft}>
          响应时间(ms)<span style={localStyles.yAxisLabelRight}>调用量</span>
        </h4>
        <Legend
          custom
          allowAllCanceled
          items={legendItems}
          itemFormatter={val => {
            const obj = { count: '调用量', executeTime: '响应时间' };
            return obj[val]; // val 为每个图例项的文本值
          }}
          onClick={ev => {
            setTimeout(() => {
              const { checked } = ev;
              const { value } = ev.item;
              if (value === 'count') {
                if (checked) {
                  this.top20Chart.get('geoms')[0].show();
                  // get.get('geoms')[1] 指本chart内index为1的<Geom>标签
                } else {
                  this.top20Chart.get('geoms')[0].hide();
                }
              }
              if (value === 'executeTime') {
                if (checked) {
                  this.top20Chart.get('geoms')[1].show();
                  // get.get('geoms')[1] 指本chart内index为1的<Geom>标签
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
          visible // 默认显示
          label={{
            rotate: -50,
            offset: 48,
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
        <Axis name="value" position="right" />
        <Axis name="executeTime" position="left" />
        <Tooltip />
        <Geom
          type="interval"
          position="label*value"
          color={[
            'type',
            value => {
              if (value === 'count') {
                return '#F57900';
              }
              return null;
            },
          ]}
          tooltip={[
            'type*value',
            (type, val) => {
              const obj = { count: '调用量' };
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
        <Geom type="line" shape="dotSmooth" position="label*executeTime" color="#0DE488" size={2} />
      </Chart>,
      document.getElementById('top20_response')
    );
  };

  barChart = chartData => {
    const tempData = modifyDuplicateLabel(chartData, 'label');
    const data = tempData.sort(this.compare('count'));
    let maxVal = this.getMaxVal(chartData, 'count');

    if (typeof maxVal === 'undefined' || maxVal === null || maxVal === '') {
      maxVal = 1;
    }
    // console.log(maxVal);
    const sales = {
      count: {
        min: 0,
        max: maxVal,
        tickInterval: 0.1,
      },
    };

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
      subTitle: {
        fontFamily: 'PingFangSC-Regular',
        fontSize: '12px',
        color: '#666666',
        letterSpacing: 0,
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
          this.chartClick(e, 'call');
        }}
      >
        <h3 className="main-title" style={localStyles.mainTitle}>
          服务并发数排名占比
        </h3>
        <h4 className="main-title" style={localStyles.subTitle}>
          {' '}
        </h4>
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
        {/* 凸显类型 color={['age', '#E6F6C8-#3376CB']} */}
        <Geom
          type="interval"
          color={['count', '#F57900']}
          position="label*count"
          tooltip={[
            'count',
            val => {
              return {
                name: '并发数占比',
                value: val,
              };
            },
          ]}
        >
          <Label content={['label*count', (name, value) => numeral(value || 0).format('0.0%')]} />{' '}
        </Geom>
      </Chart>,
      document.getElementById('service_concurrency')
    );
  };

  chartClick = (e, type) => {
    let toolData;
    let param = {};

    switch (type) {
      case 'resTime':
        drawSingleSerMixChart(
          {
            data: [],
            title: {},
            categoryType: type,
          },
          'single_service_resTime_chart'
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
      case 'call':
        drawSingleSerLineChart(
          {
            data: [],
            title: {},
            categoryType: type,
          },
          'single_service_call_chart'
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

          if (param.type === 'resTime') {
            drawSingleSerMixChart(chartParam, 'single_service_resTime_chart');
          } else {
            drawSingleSerLineChart(chartParam, 'single_service_call_chart');
          }
        } else {
          message.error('获取该项服务数据失败');
        }
      });
    }
  };

  hideModal = () => {
    this.setState({
      modalCurrent: this.props.current,
      singleSerParam: {},
      lineModalVisible: false,
      barModalVisible: false,
    });
  };

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

  setChartTypeAndShow() {
    const { dispatch } = this.props
    const { showMoreInfo } = this.props;
    // 生成服务资源性能图表 resTime
    dispatch({
      type: 'gatewayConsole/setState',
      payload: {
        moreInfoChartType: 'resTime',
      },
    });
    showMoreInfo();
  }

  render() {
    const {
      avgExecuteTimeRes,
      topTPS,
      currentText,
      lineModalVisible,
      barModalVisible,
      modalCurrent,
    } = this.state;


    return (
      <div className={styles.chartsContent}>
        <Modal
          title="服务响应时间"
          visible={lineModalVisible}
          footer={null}
          width="76%"
          forceRender
          onCancel={this.hideModal}
          centered
          style={{ minWidth: '700px' }}
        >
          <div id="single_service_resTime_chart" />
          <TimeBar transValue={this.receiveValue} initValue={modalCurrent.text} />
        </Modal>

        <Modal
          title="服务并发量"
          visible={barModalVisible}
          footer={null}
          width="76%"
          forceRender
          onCancel={this.hideModal}
          centered
          style={{ minWidth: '700px' }}
        >
          <div id="single_service_call_chart" />
          <TimeBar transValue={this.receiveValue} initValue={modalCurrent.text} />
        </Modal>

        <Row>
          <Col span={20}>
             <span className={styles.currentText}>{currentText}
             <span className={styles.staticTitle}>&nbsp;服务资源性能情况</span>
          </span>
          </Col>
          <Col span={4}>
            <Button
              icon='bar-chart'
              onClick={() => {
                this.setChartTypeAndShow();
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
          <Col span={12}>
            <Card bordered className={styles.labelCard} style={{ borderLeft: 'none' }}>
              <Row>
                <Col span={12} className={styles.labelText}>
                  平均响应时间(ms)
                </Col>
                <Col span={12} className={styles.value}>
                  {toFixedNum(avgExecuteTimeRes, 2)}
                </Col>
              </Row>
            </Card>
          </Col>

          {/* <Col span={6}>
            <Card className={styles.labelCard}>
              <Col span={12} className={styles.labelText}>平均并发数</Col>
              <Col span={12} className={styles.value}>---</Col>
            </Card>
          </Col>

          <Col span={6}>
            <Card className={styles.labelCard}>
              <Col span={12} className={styles.labelText}>平均QPS</Col>
              <Col span={12} className={styles.value}>---</Col>
            </Card>
          </Col> */}

          <Col span={12}>
            <Card className={styles.labelCard} style={{ borderRight: 'none' }}>
              <Row>
                <Col span={12} className={styles.labelText}>
                  平均TPS
                </Col>
                <Col span={12} className={styles.value}>
                  {/*{topTPS < 0.001 ? '< 0.001' : toFixedNum(topTPS, 3)}*/}
                  { toFixedNum(1000/avgExecuteTimeRes,0) }
                </Col>
              </Row>
              {/* <Col span={12} className={styles.value}>{topTPS}</Col> */}
            </Card>
          </Col>
        </Row>
        <Row style={{ marginTop: '10px' }}>
          <Col span={12}>
            <div id="top20_response" />
          </Col>
          <Col span={2}> </Col>
          <Col span={10}>
            <div id="service_concurrency" />
          </Col>
        </Row>
      </div>
    );
  }
}
export default PerformanceChart;
