//index.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    goodsList: [{
      id: 1,
      img: '../../images/touxiang1.jpeg',
      desc: '假数据的覅哦啊阿斯殴打见覅哦啊阿斯殴打见覅哦啊阿斯殴打见覅偶啊囧死的佛家是我OA水浇地偶发iOS',
      currentPrice: '111',
      originPrice: '2343'
    }]
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },

	onPullDownRefresh: function() {
		console.log('index');
	},
})
