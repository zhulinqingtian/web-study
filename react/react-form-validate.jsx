'use strict';

import React from 'react';
import { Feedback, Form, Field, Input, Radio, Button } from 'Blue';
import API from 'API';
import {MS_DAY, SCHEDULE_MODE} from "utils/const";

const Toast = Feedback.toast;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
export default class SmsService extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      style: {
        width: '500px'
      },
      formActivity: {
        name: '开始',

        // 执行范围
        timeRange: [new Date(), new Date(+new Date() + MS_DAY * 7)],
        executeStartTime: null,
        executeEndTime: null,

        scheduleMode: 1, // 执行方式: 单次1，循环2
        runningOnceType: 0, // 单次：立即0，定时1
        sendTime: new Date((Math.floor(+new Date() / 1800000) + 1) * 1800000), // 单次 定时 时间

        scheduleType: 0 // 循环执行 radio: 每天0/周1/月2
      },
      SCHEDULE_MODE: Object.entries(SCHEDULE_MODE).map((item) => { return { value: +item[0], label: item[1] }; }),
      formValidate: {
        name: null, // 'error' 'success'
        sendTime: null,
        timeRange: null
      },
      formItemLayout: {
        labelCol: { span: 6 },
        wrapperCol: { span: 14 },
      }
    };
  }

  componentDidMount() {}

  render () {
    return (
     <div className="tab-service">
        <Form direction="ver" style={this.state.style}>
         <FormItem label="活动名称：" {...this.state.formItemLayout} className="start-modal-form-item-name"
                   validateStatus={this.state.formValidate.name} help="请输入活动名称">
           <Input placeholder="请输入活动名称" value={this.state.formActivity.name} maxLength={100}
                  onChange={this.resetChangeFormItem.bind(this, 'name')} />
         </FormItem>
         <FormItem label="执行方式：" {...this.state.formItemLayout}>
           <RadioGroup dataSource={this.state.SCHEDULE_MODE} value={this.state.formActivity.scheduleMode}
                       onChange={this.resetChangeFormItem.bind(this, 'scheduleMode')} />
         </FormItem>
       </Form>
       <Button onClick={this.handleClickOk.bind(this)}>确定</Button>
     </div>
    );
  }

  /**
   * =========================
   * onChange的value赋值
   * form: input/radio/select
   * =========================
   */

  resetChangeFormItem(name, val) { // 属性名，属性值
    // 校验值
    this.handleFormValide(name, val);

    const formActivity = this.state.formActivity;
    formActivity[name] = val;
    this.setState({ formActivity });

    if (name === 'timeRange') {
      this.handleOptionDisable(val);
    }
  }

  /**
   * =====================
   * onChange的value检验
   * =====================
   */
  handleFormValide(name, val) {
    let tip; // 错误提示
    const scheduleMode = this.state.formActivity.scheduleMode;
    const runningOnceType = this.state.formActivity.runningOnceType;

    switch (name) {
      case 'name':
        tip = val ? null : 'error';
        break;
      case 'sendTime':
        tip = scheduleMode === 1 && runningOnceType === 1 && !val ? 'error' : null;
        break;
      case 'timeRange':
        tip = scheduleMode === 2 && (!val[0] || !val[1]) ? 'error' : null;
        break;
    }

    const formValidate = this.state.formValidate;
    formValidate[name] = tip; // {验证字段：错误提示}
    this.setState({ formValidate });

    return formValidate;
  }
}
