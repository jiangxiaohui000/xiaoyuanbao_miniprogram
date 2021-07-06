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
    this.globalData = {}
    this.globalData.needAdapt = phoneType();
  },
  login: function(cb) {
    if(this.globalData.openid) {
      const _this = this;
      typeof cb === 'function' && cb(_this.globalData.openid);
    } else {
      const _this = this;
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          if(res && res.result && res.result.event && res.result.openid) {
            _this.globalData.openid = res.result.openid;
            typeof cb === 'function' && cb(res.result.openid);
            wx.cloud.callFunction({
              name: 'userData',
              data: {
                openid: res.result.openid
              },
            })
          }
        }
      })  
    }
  },
	onShow: function() {
	},
	onHide: function() {
	}
})
