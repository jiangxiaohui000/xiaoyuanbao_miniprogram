//index.js
const app = getApp();
const QQMapWX = require('../../utils/qqmap-wx-jssdk.js'); // 引入腾讯位置服务

Page({
  data: {
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    searchValue: '',
    goodsCategory: ['精选', '手机', '男装', '女装', '数码', '日用', '图书', '饰品', '美妆', '百货', '箱包', '运动'],
    goodsList: [{
      id: 1,
      img: '../../images/kouhong.jpg',
      desc: 'Lancome/兰蔻产地: 法国颜色分类: 888粉金管颜色备注保质期: 3年适合肤质: 任何肤质正常规格是否为特殊用途化妆品: 否',
      currentPrice: '111',
      originPrice: '2343'
    }, {
      id: 2,
      img: '../../images/kouhong.jpg',
      desc: 'Lancome/兰蔻产地: 法国颜色分类: 888粉金管颜色备注保质期: 3年适合肤质: 任何肤质正常规格是否为特殊用途化妆品: 否',
      currentPrice: '33333',
      originPrice: '23222243'
    }, {
      id: 3,
      img: '../../images/kouhong.jpg',
      desc: 'Lancome/兰蔻产地: 法国颜色分类: 888粉金管颜色备注保质期: 3年适合肤质: 任何肤质正常规格是否为特殊用途化妆品: 否',
      currentPrice: '111',
      originPrice: '2343'
    }, {
      id: 4,
      img: '../../images/kouhong.jpg',
      desc: 'Lancome/兰蔻产地: 法国颜色分类: 888粉金管颜色备注保质期: 3年适合肤质: 任何肤质正常规格是否为特殊用途化妆品: 否',
      currentPrice: '33333',
      originPrice: '23222243'
    }, {
      id: 5,
      img: '../../images/kouhong.jpg',
      desc: 'Lancome/兰蔻产地: 法国颜色分类: 888粉金管颜色备注保质期: 3年适合肤质: 任何肤质正常规格是否为特殊用途化妆品: 否',
      currentPrice: '111',
      originPrice: '2343'
    }, {
      id: 6,
      img: '../../images/kouhong.jpg',
      desc: 'Lancome/兰蔻产地: 法国颜色分类: 888粉金管颜色备注保质期: 3年适合肤质: 任何肤质正常规格是否为特殊用途化妆品: 否',
      currentPrice: '33333',
      originPrice: '23222243'
    }, {
      id: 7,
      img: '../../images/kouhong.jpg',
      desc: 'Lancome/兰蔻产地: 法国颜色分类: 888粉金管颜色备注保质期: 3年适合肤质: 任何肤质正常规格是否为特殊用途化妆品: 否',
      currentPrice: '111',
      originPrice: '2343'
    }, {
      id: 8,
      img: '../../images/kouhong.jpg',
      desc: 'Lancome/兰蔻产地: 法国颜色分类: 888粉金管颜色备注保质期: 3年适合肤质: 任何肤质正常规格是否为特殊用途化妆品: 否',
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
    }],
    scrollTop: 0,
    searchKeyWord: 'Apple超级品牌日',
    currentIndex: 0,
    selectedItemLeft: undefined,
    userAddress: '',
    userAddressLatitude: '',
    userAddressLongitude: '',
    locationFlash: true,
    locationShow: false,
    timer: null,
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      });
      return;
    }
    // 获取用户信息
    wx.getSetting({
      success: res => {
        console.log(res, 'getSetting');
        // 账户信息
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
        // 位置信息
        if(res.authSetting['scope.userLocation']) {
          // 用户同意授权位置信息
          wx.getLocation({
            type: 'wgs84',
            success: (res) => {
              console.log(res, 'userLocation');
              const latitude = res.latitude;
              const longitude = res.longitude;
              const qqmapsdk = new QQMapWX({
                key: 'A4BBZ-RMHYU-LDQVQ-BZDUV-EOPZO-5BFWK'
              });
              qqmapsdk.reverseGeocoder({
                location: {latitude, longitude},
                success: res => { // 获取到位置
                  console.log('success', res);
                  this.setData({
                    userAddress: res.result.formatted_addresses.recommend,
                    userAddressLatitude: res.result.location.lat,
                    userAddressLongitude: res.result.location.lng,
                    locationFlash: false,
                    locationShow: true,
                  });
                  this.data.timer = setTimeout(() => {
                    this.setData({
                      locationShow: false
                    });
                    clearTimeout(this.data.timer);
                  }, 2000);
                },
                fail: e => {
                  console.log(e, 'fail')
                }
              });
            },
            fail () {
              // wx.showModal({
              //   title: '提示',
              //   content: '请自行输入您的位置',
              //   success (res) {
              //     if (res.confirm) {
              //       console.log('用户点击确定')
              //     } else if (res.cancel) {
              //       console.log('用户点击取消')
              //     }
              //   }
              // })    
            }
          })
        } else {
          // 用户未同意授权位置信息
          wx.authorize({
            scope: 'scope.userLocation',  
            success() {
              wx.chooseLocation({
                success: res => {
                  this.setData({
                    userAddress: `${res.address}${res.name}`,
                    userAddressLatitude: res.latitude,
                    userAddressLongitude: res.longitude,
                  });
                },
                fail: res => {
                  console.log('打开地图选择位置取消', res);
                }
              })
            },
            fail() {
              console.log('用户未同意授权位置信息');
              wx.showModal({
                title: '是否授权当前位置',
                content: '需要获取您的地理位置，请确认授权，否则地图功能将无法使用',
                success: (tip) => {
                  if (tip.confirm) {
                    wx.openSetting({
                      success: (data) => {
                        if (data.authSetting["scope.userLocation"] === true) {
                          wx.showToast({
                            title: '授权成功',
                            icon: 'success',
                            duration: 1000
                          })
                          wx.chooseLocation({
                            success: res => {
                              this.setData({
                                userAddress: `${res.address}${res.name}`,
                                userAddressLatitude: res.latitude,
                                userAddressLongitude: res.longitude,
                              });
                            }
                          })
                        } else {
                          wx.showToast({
                            title: '授权失败',
                            icon: 'fail',
                            duration: 1000
                          })
                        }
                      },
                      fail: () => {},
                      complete: () => {}
                    });
                  }
                }
              });
            }
          })
        }
      }
    });
  },
  // 下拉刷新
	onPullDownRefresh: function() {
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000);
  },
  // 触底操作
  onReachBottom: function() {
    console.log('bbbbb');
  },
  // 页面滚动
  onPageScroll(e) {
    this.setData({
      scrollTop: e.scrollTop
    })
  },
  // 前往商品详情页面
  gotoGoodsDetail(e) {
    wx.navigateTo({
      url: '../productDetail/productDetail',
      success: function(res) {
        res.eventChannel.emit('sendProductDetailID', {id: e.currentTarget.dataset.id})
      }
    });
  },
  // 前往聊天页面
  gotoCurrentChat(e) {
    console.log('chat', e.currentTarget.dataset);
  },
  // 前往搜索页
  gotoSearch() {
    wx.navigateTo({
      url: '../search/search',
    })
  },
  // 选择商品分类
  chooseCategory: function(e) {
    // const query = wx.createSelectorQuery();
    // query.selectAll('.goods-category-item').boundingClientRect();
    // query.select('.goods-category-item').boundingClientRect();
    // query.exec(res => {
    //   console.log(res);
    //   const selectedItemLeft = res[0][e.target.dataset.index].left;
    //   console.log(selectedItemLeft);
    //   if(selectedItemLeft > 190) {
    //     this.setData({
    //       selectedItemLeft: selectedItemLeft
    //     })
    //   }
    // });
    this.setData({
      currentIndex: e.target.dataset.index
    });
  },
  // 去往定位页面
  goLocationPage() {
    //
  }
})
