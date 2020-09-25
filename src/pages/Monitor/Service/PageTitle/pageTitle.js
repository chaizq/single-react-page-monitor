import React, { Component } from 'react';
import { Row, Col, message } from 'antd';
import { connect } from 'dva';
import styles from './pageTitle.less';

@connect((example) => ({
  // pageTitle命名空间未生效
  totalApiNum: example.gatewayConsole.totalApiNum

}))
class PageTitle extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.getGlobalData();

    const { dispatch } = this.props
    dispatch({
      type: 'gatewayConsole/getApiNum',
    })
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      totalApiNum:nextProps.totalApiNum
    })
  }

  getGlobalData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'gatewayConsole/getGlobalStaticData',
      payload: {},
    }).then(response => {
      let res = response
      // res = response.body;
      if (res instanceof Object) {
        const totalIvkCount = res.totalIvkCount.total;
        const totalIvkErrorCountRes = res.totalIvkErrorCountRes.total;

        let totalAvgExecuteTimeRes;
        // let serviceErrorCountRes;
        if (JSON.stringify(res.totalAvgExecuteTimeRes.aggregations) === '{}') {
          totalAvgExecuteTimeRes = 0;
        } else {
          totalAvgExecuteTimeRes = res.totalAvgExecuteTimeRes.aggregations.avg_execute_time.value;
        }
        // if (JSON.stringify(res.serviceErrorCountRes.aggregations) === "{}"){serviceErrorCountRes = '--'} else {
        //   serviceErrorCountRes = res.serviceErrorCountRes.aggregations.api_ids.value; // 异常服务数
        // }

        this.setState({
          totalIvkCount,
          totalIvkErrorCountRes,
          totalAvgExecuteTimeRes,
          // serviceErrorCountRes
        });
      } else {
        message.error('获取全局统计数据失败！');
      }
    });
  };

  getApiData = () => {
    // DI提供接口
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/getApiAnalyzeStatisticInfo',
    }).then(response => {
      let res = null;
      if (response.code !== 200) {
        message.error('获取DI API服务数据失败！');
        // console.log(response.message);
        return;
      }
      res = JSON.parse(response.data);
      if (res instanceof Object) {
        const {
          userCount, // 用户（接入系统）数
          apiDistCount, // 服务总数
          orgCount, // 接入机构
          apiSubCount, // 订阅资源数
        } = res;

        this.setState({ userCount, apiDistCount, orgCount, apiSubCount });
      } else {
        message.error('获取DI API服务数据失败！');
      }
    });
  };

  // 工具类方法
  isRealNum = val => {
    return parseFloat(val).toString() !== 'NaN';
  };

  toFixedNum = (val, keepNum) => {
    let result;
    if (this.isRealNum(val)) {
      result = val.toFixed(keepNum);
    } else {
      result = ``;
    }
    return result;
  };

  // 渲染
  render() {
    const {
      totalIvkCount,
      totalIvkErrorCountRes,
      totalAvgExecuteTimeRes, // globalData from gatewayConsole
      userCount,
      apiDistCount,
      orgCount,
      apiSubCount,
      // serviceErrorCountRes   // apiData from monitor

      totalApiNum
    } = this.state;

    return (
      <div className={styles.pageTitleContent}>
        <Row type="flex" justify="start" className={styles.statisticBackground} />

        <Row type="flex" justify="center">
          {/*<Col span={7} className={styles.titleCard}>
            <Col className={styles.box}>
              <div className={styles.text}>接入机构</div>
               <div className={styles.value}>{orgCount}</div>
              <div className={styles.value}>11</div>
            </Col>

            <Col className={styles.box}>
              <div className={styles.text}>接入系统</div>
              <div className={styles.value}>{userCount}</div>
              <div className={styles.value}>2</div>
            </Col>
          </Col>*/}

          {/*<Col span={7} className={styles.titleCard}>
            <Col className={styles.boxShort}>
              <div className={styles.text}>服务总数</div>
               <div className={styles.value} style={{ textDecoration: 'underline' }}>
                {apiDistCount}
              </div>
            </Col>

            <Col className={styles.boxLong}>
              <Row gutter={16}>
                <Col span={12} className={styles.textSmall}>
                  异常服务总数
                </Col>
                <Col span={8} className={styles.valueSmall} style={{ color: '#FE5562' }}>
                  【--】
                </Col>
                 <Col span={8} className={styles.valueSmall} style={{color:'#FE5562', textDecoration: 'underline'}}>{serviceErrorCountRes}</Col>
              </Row>

              <Row gutter={16}>
                <Col span={12} className={styles.textSmall} style={{ marginTop: '10px' }}>
                  订阅服务总数
                </Col>
                <Col span={8} className={styles.valueSmall} style={{ marginTop: '10px' }}>
                  {apiSubCount}
                </Col>
                <Col span={8} className={styles.valueSmall} style={{ marginTop: '10px' }}>
                  81
                </Col>
              </Row>
            </Col>
          </Col>*/}

          {/*<Col span={7} className={styles.titleCard}>
            <Col className={styles.boxShort}>
              <div className={styles.text}>调用服务总量</div>
              <div className={styles.value}>{totalIvkCount}</div>
            </Col>

            <Col className={styles.boxLong}>
              <Row>
                <Col className={styles.textSmall}>调用服务错误总量</Col>
                <Col
                  className={styles.valueSmall}
                  style={{ color: '#FE5562', textDecoration: 'underline', marginLeft: '35px' }}
                >
                  {totalIvkErrorCountRes}
                </Col>
              </Row>

              <Row>
                <Col className={styles.textSmall} style={{ marginTop: '10px' }}>
                  服务平均响应时间(ms)
                </Col>
                <Col
                  className={styles.valueSmall}
                  style={{ marginTop: '10px', marginLeft: '10px' }}
                >
                  {this.toFixedNum(totalAvgExecuteTimeRes, 2)}
                </Col>
              </Row>
            </Col>
          </Col>*/}

          <Col span={6} className={styles.titleCard}>
              <Col className={styles.boxShortServiceNum}>
                <div className={styles.text}>服务总数</div>
                <div className={styles.value}>{totalApiNum}</div>
                {/*<div className={styles.value}>42511</div>*/}
                <div >
                  <img
                    className={styles.image}
                    src={[require("@/assets/dcat/monitor/boxShortServiceNum.png")]} alt=""/>
                </div>
              </Col>
          </Col>
          <Col span={6} className={styles.titleCard}>
              <Col className={styles.boxShortServiceTotal}>
                <div className={styles.text}>调用服务总量</div>
                <div className={styles.value}>{totalIvkCount}</div>
                {/*<div className={styles.value}>212112</div>*/}
                <div className={styles.image}>
                  <img src={[require("@/assets/dcat/monitor/boxShortServiceTotal.png")]} alt=""/>
                </div>

              </Col>
          </Col>
          <Col span={6} className={styles.titleCard}>
              <Col className={styles.boxShortServiceErrorNum}>
                <div className={styles.text}>调用服务错误总量</div>
                <div className={styles.valueRed}>{totalIvkErrorCountRes}</div>
                {/*<div className={styles.value}>32313</div>*/}
                <div className={styles.image}>
                  <img src={[require("@/assets/dcat/monitor/boxShortServiceErrorNum.png")]} alt=""/>
                </div>
              </Col>
          </Col>
          <Col span={6} className={styles.titleCard}>
              <Col className={styles.boxShortServiceResponseTime}>
                <div className={styles.text}>服务平均响应时间(ms)</div>
                {/*<div className={styles.value}>323234</div>*/}
                <div className={styles.value}>
                  {this.toFixedNum(totalAvgExecuteTimeRes, 2)}
                </div>
                <div className={styles.image}>
                  <img src={[require("@/assets/dcat/monitor/boxShortServiceResponseTime.png")]} alt=""/>
                </div>
              </Col>
          </Col>
        </Row>
      </div>
    );
  }
}
export default PageTitle;
