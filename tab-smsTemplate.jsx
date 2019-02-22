import React from 'react';
import { Button, Table, Icon, Input, Dialog, Pagination, Dropdown, Menu, Form, Field, Feedback, Balloon } from 'Blue';
import './index.scss';
import API from 'API';
import DATA from '../../../../../data/ToolBox.js'; // TODO 模拟数据

const FormItem = Form.Item;
const Toast = Feedback.toast;
const Tooltip = Balloon.Tooltip;

// 审核状态
const checkStatus = {
  0: '审核通过',
  1: '审核未通过',
  2: '待审核',
  3: '已删除',
  4: '审核中'
};

class SmsTemplate extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      currentSignature: '',
      currentPage: 1,
      total: 0,
      listData: [],
      convertedContent: '',
      // 编辑 & 添加部分
      operateType: '',
      modalTitle: '',
      editShow: false,
      modalStyle: {width: '40%'},
      editObject: {
        editName: '',
        editContent: ''
      },
      smsLength: 0,
      editPlaceHolder: '今晚0点年货节开抢啦！提前加入购物车，秒杀9.9元毛衣哦，已为您准备20元现金券登录淘宝“我的优惠信息”查看',
      varGroup: {
        0: '淘宝昵称',
        1: '会员积分',
        2: '会员等级'
      },
      labelRangeMap: { // 短信长度
        '[淘宝昵称]':[3, 10],
        '[会员积分]':[1, 5],
        '[会员等级]':[3, 5]
      }
    };
    this.field = new Field(this);
  };

  componentDidMount () {
    this._getCurrentSignature();
    this.getTemplateData();
  }


  // 获取当前签名
  _getCurrentSignature() {
    API.getCurrentSignature({status: ''})
      .then(result => {
        console.log('result');
        this.setState({currentSignature: result.signature});
      })
      .catch(err => {
        console.log('error', err);
      });
  }

  getTemplateData () {
    const params = {
      templateId: '',
      curPage: 1,
      pageSize: 10
    };
    API.getTemplateList(params)
      .then(result => {
        const list = result.templateList;
        if (list.length) {
          list.forEach((v) => {
            v.status = checkStatus[v.status];
          });
        }

        this.setState({listData: list, total: result.total});
      })
      .catch(err => {
        console.log(err);
      });
  }

  /**
   * ==================
   * 清空
   * ==================
   */

  clearObject(obj) {
    const keys = Object.keys(obj);
    keys.forEach(key => {
      obj[key] = '';
    });
  }

  /**
   * ==================
   * 编辑
   * ==================
   */
  changeTypeAndModalShow(e) {
    this.clearObject(this.state.editObject);

    const target = e.target;
    const id = target.getAttribute('data-id');
    const classList = target.classList.value;

    if (classList && classList.length) {
      if (classList.indexOf('addBtn') > -1) {
        this.setState({operateType: 'add', modalTitle: '新增模板', editShow: true});
      } else if (classList.indexOf('editBtn') > -1) {
        this.setState({operateType: 'edit', modalTitle: '编辑模板', editShow: true});
        if (id) {
          this._getOneTemplateDetail(id);
        }
      }
    }
  }
  _getOneTemplateDetail (id) {
    const list = this.state.listData;
    const _this = this;
    for (var i = 0; i < list.length; i++) {
      const item = list[i];
      if (item.id == id) {
        const obj = {editName: item.name, editContent: item.content};
        _this.setState({editObject: obj});

        setTimeout(() => {// 获取改变变量
          this.getEditContent(item.content);
        }, 300);
        return;
      }
    }
  }
  closeEditModal () {
    this.setState({editShow: false});
    const editObj = this.state.editObject;
    editObj.editContent = '';
    this.setState({editObject: editObj, convertedContent: ''});
  }

  getEditTplName (val) {
    const obj = this.state.editObject;
    obj.editName = val;
    this.setState({editObject: obj});
  }
  getEditContent (val) {
    const editObj = this.state.editObject;
    if (!val) {
      editObj.editContent = '';
      return this.setState({editObject: editObj, convertedContent: ''});
    }

    const varBtns = document.querySelectorAll('.variable-btn'); // 变量label
    for (var i = 0; i < varBtns.length; i++) {
      if (val.indexOf('[' + varBtns[i].innerText + ']') === -1) {
        varBtns[i].setAttribute('class', 'hover-blue pointer variable-btn');
      } else {
        varBtns[i].setAttribute('class', 'hover-blue pointer variable-btn active');
      }
    }

    editObj.editContent = val;
    return this.setState({editObject: editObj});

    setTimeout(() => {this.highlight();}, 300);
  }

  /**
   * ====================
   * 插入变量
   * ====================
   */
  // 渲染变量
  renderGroup() {
    return Object.entries(this.state.varGroup).map((item, i) => {
      return <span
        className="hover-blue pointer variable-btn aabbbb"
        onClick={e => {this._changeVarSelected(e, item, i)}}
      >
        {item[1]}
      </span>;
    });
  };

  // 点击选择 & 取消选择变量
  _changeVarSelected(e, item, index) {
    const varBtns = document.querySelectorAll('.variable-btn'); // 变量label
    const textarea = document.querySelector('#smsContentBlock textarea');
    const content = this.state.editObject.editContent;
    const target = e.srcElement ? e.srcElement : e.target;
    const str = '[' + target.innerText + ']';
    const classList = e.target.classList.value;

    let currentBtn = varBtns[index];

    let newCon = content;

    if (!currentBtn) {
      return;
    }

    if (classList.indexOf('active') > -1) { // 如果当前已有class 移除
      currentBtn.setAttribute('class', 'hover-blue pointer variable-btn'); // label高亮显示

      // 将当前点击的内容从文本中清除
      const index = content.indexOf(str); // 查询当前点击的内容在文本中的下标
      newCon = content.substring(0, index) + "" + content.substring(index + str.length, content.length);

    } else {
      currentBtn.setAttribute('class', 'hover-blue pointer variable-btn active'); // label高亮显示

      if (document.selection) {
        textarea.focus();
        let sel = document.selection.createRange();
        sel.text = str;
      } else if (typeof textarea.selectionStart === 'number' && typeof textarea.selectionEnd === 'number') {
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        newCon = content.substring(0, startPos) + str + content.substring(endPos, content.length);
      } else {
        newCon = content + '' + str;
      }
    }

    // 清空转化字符串，手动onchange重新渲染
    textarea.value = newCon;
    textarea.focus();

    const editObj = this.state.editObject;
    editObj.editContent = newCon;
    this.setState({editObject: editObj, convertedContent: ''});
    // 点击label, 手动触发onChange
    this.handleOnChange();
  }
  // 手动触发的onchange
  handleOnChange() {
    this.highlight();
  }

  // 高亮变量
  highlight() {
    const parent = document.querySelector('#smsContentBlock');
    const textarea = parent.querySelector('textarea');
    var text = textarea.value;
    var labelREG = /(\[(淘宝昵称|会员积分|会员等级)\])/g;

    const convertStr = text.replace(/\n/g,'<br/>').replace(labelREG, '<b>$1</b>')+'<br/>&nbsp;';

    // 重新赋值
    this.setState({convertedContent: convertStr});
    setTimeout(() => {this._countSmsLength(text);}, 300);
  }

  /**
   * ======================
   * 短信长度计算
   * ======================
   */
  _countSmsLength() {
    // 短信长度 = 签名 + 短信内容（不包含变量） + 每个变量的长度
    const _this = this;

    const bg = document.querySelector('.sms-content-bg');
    const labels = bg.querySelectorAll('b');
    let len = 0;
    const value = _this.state.editObject.editContent;

    // 所有变量长度
    for (let i = 0; i < labels.length; i++) {
      const text = labels[i].innerText;
      if (value.indexOf(text) > -1) {
        const result = _this.getLabelLenRange(text); // 目前取最小值
        len += +result;
      }
    }

    // 除去变量其他内容的长度  将[淘宝昵称]、 [会员等级] 、 [会员等级] 替换成空字符串
    const reg = /\[(淘宝昵称|会员等级|会员积分)\]/g;
    const textarea = document.querySelector('textarea');
    let textareaCon = textarea.value.replace(reg, '');
    len += textareaCon.length;

    // 签名长度
    const signatureLen = this.state.currentSignature.length;
    len += +signatureLen;

    this.setState({smsLength: len});
  }

  // TODO 获取变量长度
  getLabelLenRange(label) {
    if (label in this.state.labelRangeMap) {
      const range = this.state.labelRangeMap[label];

      var min = +range[0];
      var max = +range[1];

      // todo 范围取值未写
      return min;
    }
  }

  _saveTemplate (obj = {}) {
    if (!this.state.editObject.editName) {
      return Toast.error('请输入模板名称！');
    }

    if (!this.state.editObject.editContent) {
      return Toast.error('请输入模板内容！');
    }

    const modalTitle = this.state.modalTitle;
    let params = {};
    if (modalTitle === '新增模板') {
      params = {
        crmTemplateDo: {id: '', name: this.state.editObject.editName, content: this.state.editObject.editContent},
        status: 0
      };
    } else if (modalTitle === '编辑模板') {
      params = {
        crmTemplateDo: {id: obj.id, name: obj.name, content: obj.content},
        status: 0
      };
    }
    API.saveOneTemplate(params)
      .then(() => {
        this.setState({editShow: false});
        this.getTemplateData();
      })
      .catch(err => {
        console.log(err);
      });
  }

  /**
   * ====================
   * 删除模板
   * ====================
   */
  _showDelTip = (e) => {
    const index = e.target.getAttribute('data-index');
    let data = this.state.listData;
    if (data && data.length) {
      data.forEach((v, i) => {
        if (i == index) {
          return v.delBalloonShow = true;
        }
      });
    }

    this.setState({listData: data});
  };
  _delOneTemplateDetail (id) {
    API.delOneTemplateDetail({id})
      .then(() => {
        this.setState({delBalloonShow: false});
        console.log('删除成功');
      })
      .catch(err => {
        console.log(err);
      });
  }

  render () {
    const init = this.field.init;
    const formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 16},
    };
    let ruleTip = <span className="btrigger blue pointer">计费规则</span>;

    // 操作渲染
    const operateCol = (value, index, record) => {
      const delTriggerBtn = <span className="blue pointer btrigger delBtn"
                                  data-id={record.id} data-index={index}
                                  onClick={this._showDelTip.bind(this)}>删除{record.delBalloonShow}</span>;
      return <div>
        <span className="blue pointer editBtn" data-id={record.id}
              onClick={this.changeTypeAndModalShow.bind(this)}>
          编辑&nbsp;&nbsp;
        </span>

        <Balloon
          triggerType="click"
          className="relative col-balloon"
          trigger={delTriggerBtn}
          closable={false}
          visible={record.delBalloonShow}
        >
          <Icon type="help" size="medium" className="inline-block tip-icon"/>
          <p className="inline-block del-tip-word">删除后模板无法恢复，你确定要删除改模板吗？</p>
          <div className="custom-modal-footer">
            <span className="blue pointer" data-index={index} onClick={_cancelDelTemplate}>取消</span>
            <Button type="primary" className="marginRight10"
                    data-id={record.id}
                    onClick={_toDelOneTemplate}
            >确定</Button>
          </div>
        </Balloon>
      </div>;
    };

    /**
     * ============
     * 确认删除
     * ============
     */
    const _cancelDelTemplate = (e) => {
      const index = e.target.getAttribute('data-index');
      let data = this.state.listData;
      if (data && data.length) {
        data.forEach((v, i) => {
          if (i == index) {
            return v.delBalloonShow = false;
          }
        });
      }

      this.setState({listData: data});
    };
    const _toDelOneTemplate = (e) => {
      const target = e.target;
      const id = target.getAttribute('data-id');
      this._delOneTemplateDetail(id);
    };

    return (
      <div>
        <div className="filter-block">
          <div className="inline">
            <Button type="primary"
                    className='addBtn'
                    onClick={this.changeTypeAndModalShow.bind(this)}>
              <span className='addBtn'>新增模板</span>
            </Button>
          </div>
        </div>
        <Table dataSource={this.state.listData}>
          <Table.Column title="模板名称" dataIndex="name"/>
          <Table.Column title="模板内容" dataIndex="content"/>
          <Table.Column title="审核状态" dataIndex="status"/>
          <Table.Column title="操作" cell={operateCol}/>
        </Table>
        <Pagination className="pagination"
                    defaultCurrent={this.state.currentPage}
                    onChange={this.getTemplateData.bind(this)}
                    total={this.state.total}
        />

        {/* 编辑 & 添加modal */}
        <Dialog visible = {this.state.editShow}
                onOk = {this._saveTemplate.bind(this)}
                onCancel = {this.closeEditModal.bind(this)}
                onClose = {this.closeEditModal.bind(this)}
                title = {this.state.modalTitle}
                style = {this.state.modalStyle}
                className={'edit-template-modal custom-modal'}
        >
          <Form field={this.field}>
            <FormItem {...formItemLayout} label="模板名称：">
              <Input maxLen={20}
                     {...init('name', {
                       rules: [
                         {required: true, min: 1, max: 20, message: '请输入模板名称！'}
                       ],
                     })}
                     value={this.state.editObject.editName}
                     onChange={this.getEditTplName.bind(this)}
              />
            </FormItem>
            <FormItem label="短信内容：" {...formItemLayout} id="smsContentBlock">
              <div>
                <p className="var-group">
                  {this.renderGroup()}
                </p>
                <div className="sms-statistic">
                  <Input id="smsContent"
                         multiple
                         placeholder={this.state.editPlaceHolder}
                         {...init('textarea', {
                           rules: [
                             {required: true, message: '请输入短信内容！'},
                           ]
                         })}
                         value={this.state.editObject.editContent}
                         onChange={this.getEditContent.bind(this)}
                  />
                  <div className="sms-content-bg"
                       dangerouslySetInnerHTML={{__html: this.state.convertedContent}}/>
                  <p className="statistic-word">
                    <span>已输入</span>
                    <span className="blue word-len">{this.state.smsLength}</span>
                    <span>/300个字（含变量/签名字数），约</span>
                    <span className="blue sms-count">1</span>
                    <span>条短信。</span>
                    <Tooltip trigger={ruleTip} align="tl" text="每条短信70个字（包括签名），超过70个字的短信每67个字扣费一条" />
                  </p>
                </div>

              </div>

            </FormItem>
          </Form>
        </Dialog>
      </div>
    );
  }
}
export default SmsTemplate;
