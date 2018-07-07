const AV = require('leanengine');
const wxpay = require('./wxpay');
const {
  validateSign,
  handleError,
} = require('./utils');

class Order extends AV.Object {
  get tradeId() { return this.get('tradeId'); }
  set tradeId(value) { this.set('tradeId', value); }

  get member_year() { return this.get('member_year'); }
  set member_year(value) { this.set('member_year', value); }

  get amount() { return this.get('amount'); }
  set amount(value) { this.set('amount', value); }


  
  get user() { return this.get('user'); }
  set user(value) { this.set('user', value); }

//  基本信息
  get name() { return this.get('name'); }
  set name(value) { this.set('name', value); }

  get phone() { return this.get('phone'); }
  set phone(value) { this.set('phone', value); }

  get major() { return this.get('major'); }
  set major(value) { this.set('major', value); }

    get graduateYear() { return this.get('graduateYear'); }
  set graduateYear(value) { this.set('graduateYear', value); }

    get company() { return this.get('company'); }
  set company(value) { this.set('company', value); }

    get homeAddress() { return this.get('homeAddress'); }
  set homeAddress(value) { this.set('homeAddress', value); }
  
  get productDescription() { return this.get('productDescription'); }
  set productDescription(value) { this.set('productDescription', value); }
  
  get status() { return this.get('status'); }
  set status(value) { this.set('status', value); }
  
  get ip() { return this.get('ip'); }
  set ip(value) { this.set('ip', value); }
  
  get tradeType() { return this.get('tradeType'); }
  set tradeType(value) { this.set('tradeType', value); }

  get prepayId() { return this.get('prepayId'); }
  set prepayId(value) { this.set('prepayId', value); }


  
  place() {
    return new Promise((resolve, reject) => {
      // 参数文档： https://pay.weixin.qq.com/wiki/doc/api/wxa/wxa_api.php?chapter=9_1
      wxpay.createUnifiedOrder({
        openid: this.user.get('authData').lc_weapp.openid,
        body: this.productDescription,
        out_trade_no: this.tradeId,
        total_fee: this.amount*100,
        spbill_create_ip: this.ip,
        notify_url: process.env.WEIXIN_NOTIFY_URL,
        trade_type: this.tradeType,
      }, function(err, result) {
        console.log(err, result);
        if (err) return reject(err);
        return resolve(result);
      });
    }).then(handleError).then(validateSign).then(({
      prepay_id,
    }) => {
      this.prepayId = prepay_id;
      return this.save();
    });
  }
} 
AV.Object.register(Order);

module.exports = Order;