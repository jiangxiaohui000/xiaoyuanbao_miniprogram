//app.js
const { phoneType } = require('./utils/phoneType');
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }
    this.globalData = {};
    this.globalData.needAdaptIphoneX = phoneType();
  },
  login: function(cb) {
    const _this = this;
    if(this.globalData.openid) {
      typeof cb === 'function' && cb(_this.globalData.openid);
    } else {
      wx.cloud.callFunction({ // 进入小程序先请求登录接口取用户的openid
        name: 'login',
        data: {},
      }).then(res => {
        if(res && res.result && res.result.event && res.result.openid) {
          _this.globalData.openid = res.result.openid;
          typeof cb === 'function' && cb(res.result.openid);
          wx.cloud.callFunction({ // 拿到openid后给到用户集合
            name: 'userData',
            data: {
              openid: res.result.openid
            },
          })
        }
      }).catch(e => {
        console.log(e);
        wx.showToast({
          title: '登录异常，请稍后再试！',
        })
      })
    }
  },
	onShow: function() {
	},
	onHide: function() {
	}
})
