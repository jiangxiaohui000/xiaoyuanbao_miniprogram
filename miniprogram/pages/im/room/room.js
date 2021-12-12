const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    logged: false,
    takeSession: false,
    requestResult: '',
    chatRoomEnvId: 'xiaoyuanbao',
    chatRoomCollection: 'chatroom',
    groupId: '',
    chatInfo: '',
    openid: '',
    authorizationApplicationDialogShow: false,
    buyer_nickName: '',
    buyer_avatarUrl: '',
    hasUserInfo: false,
  },

  onLoad: function(options) {
    console.log(options, 'room.js options')
    console.log(app.globalData.openid, 'room.js app.globalData.openid')
    this.getSystemInfo();
		this.data.buyer_nickName = wx.getStorageSync('nickName');
    this.data.buyer_avatarUrl = wx.getStorageSync('avatarUrl');
    this.data.openid = app.globalData.openid;
    this.data.groupId = options.groupId;
    this.data.chatInfo = {
      seller_nickName: options.seller_nickName,
      seller_avatarUrl: options.seller_avatarUrl,
      img: options.img,
      price: options.price,
      productId: options.productId,
      isOwn: options.isOwn,
    };
    if(this.data.openid) { // 登录了
      this.data.authorizationApplicationDialogShow = !this.data.buyer_nickName || !this.data.buyer_avatarUrl; // 没有昵称或者头像，则弹窗提示授权
      this.data.hasUserInfo = this.data.buyer_nickName && this.data.buyer_avatarUrl; // 同时有昵称和头像则表示有用户信息
      if(!this.data.hasUserInfo) { // 没有用户信息则赋值默认值
        this.data.buyer_nickName = '微信用户';
        this.data.buyer_avatarUrl = 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTLgo5ychFeqjfjsLia7HnyymiawHq6b5guj0RNKID3EmN9ticOwBTutRB3v8ibA8sYxNr5icJ7IZSZibc2A/0';
        this.data.chatInfo.buyer_nickName = this.data.buyer_nickName;
        this.data.chatInfo.buyer_avatarUrl = this.data.buyer_avatarUrl;
      }
      this.setData({
        chatInfo: this.data.chatInfo,
        groupId: this.data.groupId,
        openid: this.data.openid,
        authorizationApplicationDialogShow: this.data.authorizationApplicationDialogShow,
      });
    }
  },
	// 弹窗 -- 获取授权
	tapAuthorizationButton(e) {
		this.setData({
			authorizationApplicationDialogShow: false,
		});
		if(e.detail.index) { // 同意授权
			this.onGetUserInfo();
		} else { // 拒绝授权
      this.data.buyer_nickName = '微信用户';
      this.data.buyer_avatarUrl = 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTLgo5ychFeqjfjsLia7HnyymiawHq6b5guj0RNKID3EmN9ticOwBTutRB3v8ibA8sYxNr5icJ7IZSZibc2A/0';
      this.data.chatInfo.buyer_nickName = this.data.buyer_nickName;
      this.data.chatInfo.buyer_avatarUrl = this.data.buyer_avatarUrl;
      this.data.hasUserInfo = false;
      this.setData({
        chatInfo: this.data.chatInfo,
        groupId: this.data.groupId,
        openid: this.data.openid,
      });
		}
	},
	// 获取用户信息(nickName avatarUrl)
	onGetUserInfo() {
		if(!this.data.hasUserInfo) {
			wx.getUserProfile({
				desc: '用于展示用户信息',
				success: res => {
					if(res && res.userInfo) {
						let avatarUrl = res.userInfo.avatarUrl;
						avatarUrl = avatarUrl.split("/");
						avatarUrl[avatarUrl.length - 1] = 0;
						this.data.buyer_avatarUrl = avatarUrl.join('/');
            this.data.buyer_nickName = res.userInfo.nickName;
            this.data.chatInfo.buyer_nickName = this.data.buyer_nickName;
            this.data.chatInfo.buyer_avatarUrl = this.data.buyer_avatarUrl;
						wx.setStorageSync('avatarUrl', this.data.buyer_avatarUrl);
            wx.setStorageSync('nickName', this.data.buyer_nickName);
            this.data.hasUserInfo = true;
            this.setData({
              chatInfo: this.data.chatInfo,
              groupId: this.data.groupId,
              openid: this.data.openid,
            });
					}
				},
				fail: e => {
					console.log(e, 'getUserInfo-fail');
					wx.showToast({
						title: '服务繁忙，请稍后再试~',
						icon: 'none',
					})
				},
			})
		}
  },
  // 获取系统信息
  getSystemInfo() {
    wx.getSystemInfo({
      success: res => {
        // console.log('system info', res)
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
})
