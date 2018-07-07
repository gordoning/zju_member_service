const uuid = require('uuid/v4');
const AV = require('leanengine');
const Order = require('./order');
const wxpay = require('./wxpay');

/**
 * 一个简单的云代码方法
 */
AV.Cloud.define('hello', function(request, response) {
  response.success('Hello world!');
});


//    major:'',
//    graduateYear:'',
//    company:'',
//    homeAddress:''
/** 
 * 小程序创建订单
 */
AV.Cloud.define('order', (request, response) => {
  const user = request.currentUser;
//  console.log(request.params);
//  console.log(randomNumber());
  if (!user) {
    return response.error(new Error('用户未登录'));
  }
  const authData = user.get('authData');
  if (!authData || !authData.lc_weapp) {
    return response.error(new Error('当前用户不是小程序用户'));
  }
  const order = new Order();
//  order.tradeId = uuid().replace(/-/g, '');
  order.tradeId = randomNumber();
  order.status = 'INIT';

//缴费信息
  order.amount = request.params.amount;
  order.member_year = request.params.member_year;

//  基本信息
  order.name = request.params.name;
  order.phone= request.params.phone;
  order.major= request.params.major;
  order.graduateYear= request.params.graduateYear;
  order.company= request.params.company;
  order.homeAddress= request.params.homeAddress;

  order.user = request.currentUser;

//  存到微信支付的后台
  order.productDescription = request.params.name + request.params.member_year + '会员年费';

  order.ip = request.meta.remoteAddress;
  if (!(order.ip && /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(order.ip))) {
    order.ip = '127.0.0.1';
  }
  order.tradeType = 'JSAPI';
  const acl = new AV.ACL();
  // 只有创建订单的用户可以读，没有人可以写
  acl.setPublicReadAccess(false);
  acl.setPublicWriteAccess(false);
  acl.setReadAccess(user, true);
  acl.setWriteAccess(user, false);
  order.setACL(acl);
  order.place().then(() => {
    console.log(`预订单创建成功：订单号 [${order.tradeId}] prepayId [${order.prepayId}]`);
//    console.log(order);
    const payload = {
      appId: process.env.WEIXIN_APPID,
      timeStamp: String(Math.floor(Date.now() / 1000)),
      package: `prepay_id=${order.prepayId}`,
      signType: 'MD5',
      nonceStr: String(Math.random()),
    }
    payload.paySign = wxpay.sign(payload);
    response.success(payload);
  }).catch(error => {
    console.error(error);
    response.error(error);
  });
});

//生成随机时间
//      根据当前时间和随机数生成流水号
    const randomNumber= function() {
        const now = new Date()
        let month = now.getMonth() + 1
        let day = now.getDate()
        let hour = now.getHours()
        let minutes = now.getMinutes()
        let seconds = now.getSeconds()
//        month = this.setTimeDateFmt(month)
//        hour = this.setTimeDateFmt(hour)
//        minutes = this.setTimeDateFmt(minutes)
//        seconds = this.setTimeDateFmt(seconds)
        return now.getFullYear().toString() + month.toString() + day + hour + minutes + seconds + (Math.round(Math.random() * 23 + 100)).toString()
      }