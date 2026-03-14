//app.js
const { phoneType } = require('./utils/phoneType');
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
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
        if(res && res.result) {
          // 检查是否有错误
          if (res.result.error) {
            console.error('login error:', res.result.error);
            wx.showToast({
              title: '登录失败，请稍后再试~',
              icon: 'none',
            });
            return;
          }
          
          if(res.result.openid) {
            _this.globalData.openid = res.result.openid;
            typeof cb === 'function' && cb(res.result.openid);
            // 拿到openid后给到用户集合
            wx.cloud.callFunction({ 
              name: 'addUserData',
              data: {
                openid: res.result.openid
              },
            }).catch(err => {
              console.error('addUserData error:', err);
            });
          } else {
            console.error('openid not found in response');
            wx.showToast({
              title: '获取用户信息失败',
              icon: 'none',
            });
          }
        }
      }).catch(e => {
        console.error('login callFunction error:', e);
        wx.showToast({
          title: '登录异常，请稍后再试~',
          icon: 'none',
        });
      })
    }
  },
	onShow: function() {
	},
	onHide: function() {
	}
})
