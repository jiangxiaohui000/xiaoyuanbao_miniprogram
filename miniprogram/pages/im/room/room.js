const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    // userInfo: null,
    logged: false,
    takeSession: false,
    requestResult: '',
    chatRoomEnvId: 'xiaoyuanbao',
    chatRoomCollection: 'chatroom',
    chatRoomGroupId: '',
    chatInfo: '',
    // functions for used in chatroom components
    // onGetUserInfo: null,
    // getOpenID: null,
    openid: '',
  },

  onLoad: function(options) {
    console.log(options, 'room options')
    console.log(app.globalData.openid, 'app.globalData.openid')
    // let eventChannel = this.getOpenerEventChannel();
    // eventChannel.emit('chat', '1111')
    this.setData({
      chatInfo: {
        nickName: options.nickName,
        avatarUrl: options.avatarUrl,
        img: options.img,
        price: options.price,
        productId: options.productId,
      },
      chatRoomGroupId: options.groupId,
      openid: app.globalData.openid,
    });
    // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //       wx.getUserInfo({
    //         success: res => {
    //           this.setData({
    //             avatarUrl: res.userInfo.avatarUrl,
    //             userInfo: res.userInfo
    //           })
    //         }
    //       })
    //     }
    //   }
    // })

    // this.setData({
    //   onGetUserInfo: this.onGetUserInfo,
    //   getOpenID: this.getOpenID,
    // })

    wx.getSystemInfo({
      success: res => {
        console.log('system info', res)
        if (res.safeArea) {
          const { top, bottom } = res.safeArea
          this.setData({
            // containerStyle: `padding-top: ${(/ios/i.test(res.system) ? 10 : 20) + top}px; padding-bottom: ${20 + res.windowHeight - bottom}px`,
            containerStyle: `padding-bottom: ${20 + res.windowHeight - bottom}px`,
          })
        }
      },
    })
  },

  // getOpenID: async function() {
  //   if (this.openid) {
  //     return this.openid
  //   }

  //   const { result } = await wx.cloud.callFunction({
  //     name: 'login',
  //   })

  //   return result.openid
  // },

  // onGetUserInfo: function(e) {
  //   if (!this.logged && e.detail.userInfo) {
  //     this.setData({
  //       logged: true,
  //       avatarUrl: e.detail.userInfo.avatarUrl,
  //       userInfo: e.detail.userInfo
  //     })
  //   }
  // },
})
