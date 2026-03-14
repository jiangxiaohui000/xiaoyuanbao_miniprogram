//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: null,
    logged: false,
    takeSession: false,
    requestResult: '',
    chatRoomEnvId: 'release-f8415a',
    chatRoomCollection: 'kecun',
    chatRoomGroupId: 'tit-bricker',
    chatRoomGroupName: '深夜话题',

    // functions for used in chatroom components
    onGetUserInfo: null,
    getOpenID: null,
  },

  onLoad: function() {
    this.setData({
      onGetUserInfo: this.onGetUserInfo,
      getOpenID: this.getOpenID,
    })

    // 获取窗口信息（替换废弃的 getSystemInfo）
    const sysRes = wx.getWindowInfo();
    if (sysRes.safeArea) {
      const { top, bottom } = sysRes.safeArea;
      this.setData({
        containerStyle: `padding-top: ${(/ios/i.test(sysRes.system || '') ? 10 : 20) + top}px; padding-bottom: ${20 + sysRes.windowHeight - bottom}px`,
      });
    }
  },

  getOpenID: async function() {
    if (this.openid) {
      return this.openid
    }

    const { result } = await wx.cloud.callFunction({
      name: 'login',
      config: {
        env: 'release-f8415a',
      },
    })

    return result.openid
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onShareAppMessage() {
    return {
      title: '深夜话题',
      path: '/pages/index/index',
    }
  },
})
