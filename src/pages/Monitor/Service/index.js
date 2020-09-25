import React, { Component, Fragment } from 'react';
// import { connect } from 'umi';
import { connect } from 'dva';
import { Row, Col, Card, Modal, List, message, Avatar } from 'antd';
import {
  oneDayTimestampToDate,
  timestampToDate,
  drawSingleSerMixChart,
  editTypeMap,
} from '@/utils/Apim/apimUtils';
import backImg from "@/assets/dcat/monitor/banner-monitor.png";
// import { AreaChartOutlined } from '@ant-design/icons';
import styles from './index.less';
import ResourceChart from './ResourceChart/resourceChart';
import PerformanceChart from './PerformanceChart/performanceChart';
import PageTitle from './PageTitle/pageTitle';
import TimeBar from './Timebar/timeBar';

// import FrameBreadcrumb from '@/components/PageBreadcrumb/FrameBreadcrumb';
const Now = new Date();
@connect(({ gatewayConsole }) => ({
  // currentUser: login.currentUser,
  // currentUserLoading: loading.effects['login/fetchCurrentUser'],
  moreInfoChartType: gatewayConsole.moreInfoChartType

}))
class ConsoleHomeView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // 设置初始页面时间戳,今日时间
      current: {
        start: new Date(Now.getFullYear(), 0, 1).getTime(),
        end: new Date(Now.getFullYear() + 1, 0, 1) - 1,
        text: '本年',
      },

      invokeStaticData: {},
      invokeApiList: [],
      apiListModalVisible: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { current } = this.state;
    dispatch({
      type: 'login/fetchCurrentUser',
    });

    this.getInvokeStaticData(current);
  }

  UNSAFE_componentWillUpdate(nextProps, nextState, nextContext) {
    const { current } = this.state;

    if (nextState.current !== current) {
      this.getInvokeStaticData(nextState.current);
    }
  }

  // 接收TimeBar组件传的起止时间戳
  transValue = val => {
    this.setState({
      current: {
        start: val.start,
        end: val.end,
        text: val.text,
      },
    });
  };

  hideModal = () => {
    drawSingleSerMixChart(
      {
        data: [],
        title: {},
        categoryType: '',
      },
      'single_chart_more_info'
    );

    this.setState({
      apiListModalVisible: false,
    });
  };

  showModal = () => {
    // 清空脏数据
    this.setState({
      invokeApiList: [],
    });
    // 清空脏数据
    drawSingleSerMixChart(
      {
        data: [],
        title: {},
        categoryType: '',
      },
      'single_chart_more_info'
    );

    this.getApiListData();

    this.setState({
      apiListModalVisible: true,
    });
  };

  apiTitleClick = param => {
    const { dispatch, moreInfoChartType } = this.props;
    // console.log('ChartType',moreInfoChartType)
    const { current } = this.state;
    dispatch({
      type: 'gatewayConsole/getInvokeApiInfo',
      payload: {
        apiId: param.key,
        start: current.start,
        end: current.end,
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
          if (current.end - current.start <= 86340000) {
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
          temp.executeTime = item.avg_execute_time.value === null ? 0 : item.avg_execute_time.value;
          singleChartData.push(temp);
        });

        const chartParam = {
          data: singleChartData,
          title: {
            serName: param.title,
            date: dateTitle,
          },
          // categoryType: 'top20',
          categoryType: moreInfoChartType,
        };

        drawSingleSerMixChart(chartParam, 'single_chart_more_info');

      } else {
        message.error('获取该项服务数据失败');
      }
    });
  };

  getApiListData = () => {
    const { dispatch } = this.props;
    const { current } = this.state;
    dispatch({
      type: 'gatewayConsole/getInvokeApiList',
      payload: {
        start: current.start,
        end: current.end,
      },
    }).then(response => {
      let res = null;
      if (!response) {
        message.error('获取全部服务列表失败');
        return;
      }
      res = response;
      if (res instanceof Object) {
        const apiListRes = res.aggregations.api_ids;
        const apiListResArr = [];
        apiListRes.forEach(item => {
          const temp = {
            key: '',
            title: '',
            type: '',
          };
          temp.key = item.key; // 服务key，即服务id
          temp.title = item.api_name.buckets[0].key;
          temp.type = item.edit_type.buckets[0].key;
          apiListResArr.push(temp);
        });
        this.setState({
          invokeApiList: apiListResArr,
        });
      } else {
        message.error('获取全部服务列表失败');
      }
    });
  };

  getInvokeStaticData = current => {
    const { dispatch } = this.props;
    dispatch({
      type: 'gatewayConsole/getInvokeStaticData',
      payload: {
        start: current.start,
        end: current.end,
        topK: 20,
      },
    }).then(response => {
      debugger
      const res = response;
      if (res instanceof Object) {
        this.setState({ invokeStaticData: res });
      } else {
        message.error('获取服务资源数据失败！');
      }
    });
  };

  render() {
    const { current, invokeStaticData, apiListModalVisible, invokeApiList } = this.state;

    return (
      <Fragment>
        {/* <FrameBreadcrumb breadcrumbList={breadcrumbList} /> */}
        {/*<div className={styles.monitorBgCol}>*/}
        {/*  <img alt='background img' className={styles.monitorBgDiv} src={backImg} />*/}
        {/*</div>*/}

        <div className={styles.countDiv}>
          <div className={styles.countTitle}>网关监控平台</div>
          <div className={styles.countMsg}>
            依托实时计算、大数据存储、安全等技术，基于高可用、高可靠的技术中台，实现零代码平台的服务资源监控与分析
          </div>
        </div>

        <div className={styles.pageContent}>
          <PageTitle />
          <Row className={styles.timeBarRow}>
            <Col span={22}>
              <TimeBar transValue={this.transValue} initValue="本年" />
            </Col>
            <Col span={2}>
              {/* <Button
                icon="bar-chart"
                onClick={this.showModal}
                style={{ marginTop: '18px', float: 'right' }}
              >
                更多
              </Button> */}
            </Col>
          </Row>

          <Modal
            // title="更多信息"
            visible={apiListModalVisible}
            footer={null}
            width="76%"
            forceRender
            onCancel={this.hideModal}
            centered
            style={{ minWidth: '700px' }}
          >
            <Row>
              <p style={{ height: '15px' }}> </p>
              <Col span={8}>
                <Card bordered className={styles.content} style={{ minHeight: '461px' }}>
                  <List
                    size="default"
                    itemLayout="horizontal"
                    pagination={{
                      // onChange: page => {
                      //   console.log(page);
                      // },
                      size: 'small',
                      pageSize: 5,
                    }}
                    // footer={
                    //   <div>
                    //     <b>ant design</b> footer part
                    //   </div>
                    // }
                    dataSource={invokeApiList}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon="area-chart" />}
                          title={<a onClick={this.apiTitleClick.bind(this, item)}>{item.title}</a>}
                          description={`类型：${editTypeMap[item.type]}`}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col span={1}> </Col>
              <Col span={15}>
                <Card bordered className={styles.content} style={{ marginBottom: '10px' }}>
                  <div id="single_chart_more_info" />
                </Card>
              </Col>
            </Row>
          </Modal>

          <Row className={styles.targetRow}>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={24}
              xl={24}
              style={{ paddingBottom: 16, height: '100%' }}
            >
              <Col span={24}>
                <Card bordered className={styles.content}>
                  <ResourceChart
                    current={current}
                    invokeStaticData={invokeStaticData}
                    showMoreInfo={this.showModal}
                  />
                </Card>
              </Col>
            </Col>
          </Row>

          <Row className={styles.targetRow}>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={24}
              xl={24}
              style={{ paddingBottom: 16, height: '100%' }}
            >
              <Col span={24}>
                <Card bordered className={styles.content} style={{ marginBottom: '62px' }}>
                  <PerformanceChart
                    current={current}
                    invokeStaticData={invokeStaticData}
                    showMoreInfo={this.showModal}
                  />
                </Card>
              </Col>
            </Col>
          </Row>

          {/* <Row gutter={16} className={styles.footRow}>
              <Col xs={24} sm={24} md={24} lg={18} xl={18}>

              </Col>
            </Row> */}
        </div>
      </Fragment>
    );
  }
}
export default ConsoleHomeView;
