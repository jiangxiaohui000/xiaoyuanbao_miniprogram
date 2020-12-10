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
    }, {
      id: 2,
      img: '../../images/touxiang2.jpeg',
      desc: '刻录机阿空手道假数据的覅哦啊阿斯殴打见覅见覅偶啊囧死的佛家是我OA水浇地偶发iOS',
      currentPrice: '33333',
      originPrice: '23222243'
    }, {
      id: 3,
      img: '../../images/touxiang1.jpeg',
      desc: '假数据的覅哦啊阿斯殴打见覅哦啊阿斯殴打见覅哦啊阿斯殴打见覅偶啊囧死的佛家是我OA水浇地偶发iOS',
      currentPrice: '111',
      originPrice: '2343'
    }, {
      id: 4,
      img: '../../images/touxiang2.jpeg',
      desc: '刻录机阿空手道假数据的覅哦啊阿斯殴打见覅见覅偶啊囧死的佛家是我OA水浇地偶发iOS',
      currentPrice: '33333',
      originPrice: '23222243'
    }, {
      id: 5,
      img: '../../images/touxiang1.jpeg',
      desc: '假数据的覅哦啊阿斯殴打见覅哦啊阿斯殴打见覅哦啊阿斯殴打见覅偶啊囧死的佛家是我OA水浇地偶发iOS',
      currentPrice: '111',
      originPrice: '2343'
    }, {
      id: 6,
      img: '../../images/touxiang2.jpeg',
      desc: '刻录机阿空手道假数据的覅哦啊阿斯殴打见覅见覅偶啊囧死的佛家是我OA水浇地偶发iOS',
      currentPrice: '33333',
      originPrice: '23222243'
    }, {
      id: 7,
      img: '../../images/touxiang1.jpeg',
      desc: '假数据的覅哦啊阿斯殴打见覅哦啊阿斯殴打见覅哦啊阿斯殴打见覅偶啊囧死的佛家是我OA水浇地偶发iOS',
      currentPrice: '111',
      originPrice: '2343'
    }, {
      id: 8,
      img: '../../images/touxiang2.jpeg',
      desc: '刻录机阿空手道假数据的覅哦啊阿斯殴打见覅见覅偶啊囧死的佛家是我OA水浇地偶发iOS',
      currentPrice: '33333',
      originPrice: '23222243'
    }],
    swiperImgs: [{
			id: 1,
			img: '../../images/banner1.jpg'
		}, {
			id: 2,
			img: '../../images/banner2.jpg'
		}, {
			id: 3,
			img: '../../images/banner3.jpg'
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
  // 下拉刷新
	onPullDownRefresh: function() {
		console.log('index');
  },
  // 前往商品详情页面
  gotoGoodsDetail(e) {
    console.log('detail', e.currentTarget.dataset);
    wx.navigateTo({
      url: '../productDetail/productDetail',
    })
  },
  // 前往聊天页面
  gotoCurrentChat(e) {
    console.log('chat', e.currentTarget.dataset);
  },
})
