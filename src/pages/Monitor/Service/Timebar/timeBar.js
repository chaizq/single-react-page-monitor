import React, { Component } from 'react';
import { Row, Col, Button, DatePicker } from 'antd';
import 'moment/locale/zh-cn';
import moment from 'moment';
import styles from './timeBar.less';

const { RangePicker } = DatePicker;

const map = {
  今日: 0,
  本周: 1,
  本月: 2,
  本季: 3,
  本年: 4,
};

class TimeBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      btnIndex: null,
    };
  }

  // TimeBar首次加载时执行，配置一些初始状态
  componentDidMount() {
    const { initValue } = this.props;
    if (initValue !== null && typeof initValue !== 'undefined') {
      this.getButtonCurrent(initValue, map[initValue]);
    } else {
      this.getButtonCurrent('今日', 0); // 初始加载时令页面显示今日日期,0为今日按钮索引号
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { initValue } = this.props;
    if (initValue !== nextProps.initValue) {
      this.getButtonCurrent(nextProps.initValue, map[nextProps.initValue]);
    }
  }

  getButtonCurrent = (val, index) => {
    let startTime;
    let endTime;
    const Now = new Date();
    switch (val) {
      case '本周': {
        let today = Now.getDay();
        if (today === 0) {
          today = 7;
        }

        const WeekFirstDay = new Date(
          new Date(new Date().toLocaleDateString()).getTime() - (today - 1) * 86400000
        );
        const WeekLastDay = new Date((WeekFirstDay / 1000 + 7 * 86400 - 1) * 1000);

        startTime = WeekFirstDay.getTime();
        endTime = WeekLastDay.getTime();
        // alert(WeekFirstDay+':'+WeekLastDay);
        break;
      }

      case '本月': {
        const MonthFirstDay = new Date(Now.getFullYear(), Now.getMonth(), 1);
        const MonthNextFirstDay = new Date(Now.getFullYear(), Now.getMonth() + 1, 1);
        const MonthLastDay = new Date(MonthNextFirstDay - 1);
        // alert(MonthFirstDay+':'+MonthLastDay);

        startTime = MonthFirstDay.getTime();
        endTime = MonthLastDay.getTime();
        break;
      }

      case '本季': {
        const thisMonth = Now.getMonth();
        let quarterStartMonth = 0;
        if (thisMonth < 3) {
          quarterStartMonth = 0;
        }
        if (thisMonth > 2 && thisMonth < 6) {
          quarterStartMonth = 3;
        }
        if (thisMonth > 5 && thisMonth < 9) {
          quarterStartMonth = 6;
        }
        if (thisMonth > 8) {
          quarterStartMonth = 9;
        }
        const QuarterFirstDay = new Date(Now.getFullYear(), quarterStartMonth, 1);
        const QuarterNextFirstDay = new Date(Now.getFullYear(), quarterStartMonth + 3, 1);
        const QuarterLastDay = new Date(QuarterNextFirstDay - 1);
        // alert(QuarterFirstDay+':'+QuarterLastDay);

        startTime = QuarterFirstDay.getTime();
        endTime = QuarterLastDay.getTime();
        break;
      }

      case '本年': {
        const YearFirstDay = new Date(Now.getFullYear(), 0, 1);
        const YearLastDayTimeStamp = new Date(Now.getFullYear() + 1, 0, 1) - 1;
        // alert(YearFirstDay+':'+new Date(YearLastDayTimeStamp));
        startTime = YearFirstDay.getTime();
        endTime = YearLastDayTimeStamp;
        break;
      }

      default: {
        // 默认为今日起止时间
        startTime = new Date(new Date().toLocaleDateString()).getTime();
        endTime = new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1;
        // alert(new Date(startTime)+':'+new Date(endTime));
        break;
      }
    }

    this.setState({
      btnIndex: index,
    });

    return {
      start: startTime,
      end: endTime,
      text: val,
    };
  };

  // 工具类方法
  notEmpty = val => {
    return typeof val !== 'undefined' && val !== null && val.length !== 0;
  };

  change = t => {
    if (t < 10) {
      return `0${t}`;
    }
    return t;
  };

  setPeriod = value => {
    if (this.notEmpty(value)) {
      const { transValue } = this.props;
      const [first, second] = value;

      const data = {
        start: first.valueOf(),
        end: second.valueOf(),
        text: '范围内',
      };

      this.setState({ btnIndex: -1 }); // btnIndex赋值-1，令默认时间段按钮置灰
      transValue(data);
    }
  };

  // 渲染
  render() {
    const timeArr = [
      {
        id: 'timeBtnArr_today',
        value: '今日',
      },
      {
        id: 'timeBtnArr_week',
        value: '本周',
      },
      {
        id: 'timeBtnArr_month',
        value: '本月',
      },
      {
        id: 'timeBtnArr_season',
        value: '本季',
      },
      {
        id: 'timeBtnArr_year',
        value: '本年',
      },
    ];

    const { btnIndex } = this.state;
    const { transValue } = this.props;

    const buttons = timeArr.map((item, index) => {
      const ButtonDom = (
        <Col key={item.id} className={styles.timeButton}>
          <Button
            type="primary"
            className={index === btnIndex ? styles.btnSelected : styles.btnUnselected}
            onClick={() => {
              transValue(this.getButtonCurrent(item.value, index));
            }}
          >
            {item.value}
          </Button>
        </Col>
      );
      return ButtonDom;
    });
    const dateFormat = 'YYYY-MM-DD HH:mm';
    const a = new Date().toLocaleDateString();
    const startData = new Date(a);
    const endData = new Date(new Date(a).getTime() + 24 * 60 * 60 * 1000 - 1);
    const showStart =
      startData.getFullYear() +
      '-' +
      this.change(startData.getMonth() + 1) +
      '-' +
      this.change(startData.getDate()) +
      ' ' +
      this.change(startData.getHours()) +
      ':' +
      this.change(startData.getMinutes());

    const showEnd =
      endData.getFullYear() +
      '-' +
      this.change(endData.getMonth() + 1) +
      '-' +
      this.change(endData.getDate()) +
      ' ' +
      this.change(endData.getHours()) +
      ':' +
      this.change(endData.getMinutes());

    return (
      <div className={styles.timeBarContent}>
        <Row type="flex" justify="start"  style={{ height: '50px' }}>
          <Col span={3}> </Col>
          {buttons}
          <Col span={5}> </Col>

          <RangePicker
            defaultValue={[moment(showStart, dateFormat), moment(showEnd, dateFormat)]}
            showTime={{ format: 'HH:mm' }}
            format={dateFormat}
            allowClear={false}
            placeholder={['Start Time', 'End Time']}
            onChange={this.setPeriod}
            onOk={this.setPeriod}
            className={styles.rangePicker}
          />

        </Row>
      </div>
    );
  }
}
export default TimeBar;
