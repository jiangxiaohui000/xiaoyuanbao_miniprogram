const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    logged: false,
    takeSession: false,
    requestResult: '',
    chatRoomEnvId: 'xiaoyuanbao',
    chatRoomCollection: 'data_chat',
    groupId: '',
    chatInfo: {},
    openid: '',
    authorizationApplicationDialogShow: false,
    buyer_nickName: '',
    buyer_avatarUrl: '',
    hasUserInfo: false,
    productInfo: null,
  },

  onLoad: function(options) {
    console.log(options, 'room.js options')
    console.log(app.globalData.openid, 'room.js app.globalData.openid')
    // console.log(wx.getStorageSync('nickName'),wx.getStorageSync('avatarUrl'), 'room.js getStorageSync')
    this.getSystemInfo();
    this.data.openid = app.globalData.openid;
    this.data.groupId = options.groupId;
    this.data.productInfo = JSON.parse(options.productInfo);
    this.data.buyer_nickName = this.data.productInfo.buyer_nickName;
    this.data.buyer_avatarUrl = this.data.productInfo.buyer_avatarUrl;
    // const nickName = wx.getStorageSync('nickName');
    // const avatarUrl = wx.getStorageSync('avatarUrl');
    // if(options.seller_uid !== this.data.openid) { // 如果传过来的卖家ID不是当前账户的openID，则存储的昵称和头像是买家的
    //  	this.data.buyer_nickName = nickName;
    //   this.data.buyer_avatarUrl = avatarUrl;
    // }
    if(!this.data.openid) { // 未登录
      app.login(res => this.setData({ openid: res })); // 调用全局登录方法获取openid
			if(this.data.openid) { // 拿到openid后判断为已登录状态
				wx.setStorageSync('openid', this.data.openid);
        app.globalData.openid = this.data.openid;
        this.setData({
          openid: this.data.openid,
        });
			}
    }
    this.data.authorizationApplicationDialogShow = !this.data.buyer_nickName || !this.data.buyer_avatarUrl; // 没有昵称或者头像，则弹窗提示授权
    this.data.hasUserInfo = this.data.buyer_nickName && this.data.buyer_avatarUrl; // 同时有昵称和头像则表示有用户信息
    if(!this.data.hasUserInfo) { // 没有用户信息则赋值默认值
      this.data.buyer_nickName = '微信用户';
      this.data.buyer_avatarUrl = 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTLgo5ychFeqjfjsLia7HnyymiawHq6b5guj0RNKID3EmN9ticOwBTutRB3v8ibA8sYxNr5icJ7IZSZibc2A/0';
    }
    this.data.chatInfo = {
      buyer_nickName: this.data.buyer_nickName,
      buyer_avatarUrl: this.data.buyer_avatarUrl,
      buyer_uid: this.data.openid,
      seller_nickName: this.data.productInfo.seller_nickName,
      seller_avatarUrl: this.data.productInfo.seller_avatarUrl,
      seller_uid: this.data.productInfo.seller_uid,
      img: this.data.productInfo.img,
      price: this.data.productInfo.price,
      productId: this.data.productInfo.productId,
    };
    this.setData({
      chatInfo: this.data.chatInfo,
      groupId: this.data.groupId,
      openid: this.data.openid,
      authorizationApplicationDialogShow: this.data.authorizationApplicationDialogShow,
    });
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
      this.data.hasUserInfo = false;
      this.data.chatInfo = {
        buyer_nickName: this.data.buyer_nickName,
        buyer_avatarUrl: this.data.buyer_avatarUrl,
        buyer_uid: this.data.openid,
        seller_nickName: this.data.productInfo.seller_nickName,
        seller_avatarUrl: this.data.productInfo.seller_avatarUrl,
        seller_uid: this.data.productInfo.seller_uid,
        img: this.data.productInfo.img,
        price: this.data.productInfo.price,
        productId: this.data.productInfo.productId,
      };
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
            this.data.chatInfo = {
              buyer_nickName: this.data.buyer_nickName,
              buyer_avatarUrl: this.data.buyer_avatarUrl,
              buyer_uid: this.data.openid,
              seller_nickName: this.data.productInfo.seller_nickName,
              seller_avatarUrl: this.data.productInfo.seller_avatarUrl,
              seller_uid: this.data.productInfo.seller_uid,
              img: this.data.productInfo.img,
              price: this.data.productInfo.price,
              productId: this.data.productInfo.productId,
            };
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
