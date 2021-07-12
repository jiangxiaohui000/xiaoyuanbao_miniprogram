//homePage.js
const app = getApp();
const QQMapWX = require('../../utils/qqmap-wx-jssdk.js'); // 引入腾讯位置服务
const { priceConversion } = require('../../utils/priceConversion');
const { checkNetworkStatus } = require('../../utils/checkNetworkStatus');

Page({
  data: {
    logged: false,
    takeSession: false,
    requestResult: '',
    // productsCategory: ['精选', '手机', '男装', '女装', '数码', '日用', '图书', '饰品', '美妆', '百货', '箱包', '运动'],
    productsList: [],
    swiperImgs: [],
    scrollTop: 0,
    searchKeyWord: 'Apple超级品牌日',
    currentIndex: 0,
    selectedItemLeft: undefined,
    userAddress: '',
    locationFlash: true,
    locationShow: false,
    timer: null,
    heatIconList: [],
    notHeatIconList: [],
    pageData: {
      pageSize: 20,
      currentPage: 1
    },
    showLoading: true,
    isLoaded: false,
    openid: '',
  },

  onLoad() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      });
      return;
    }
    app.login(res => this.data.openid = res); // 调用全局登录方法获取openid
    checkNetworkStatus(); // 网络状态检测
    const _this = this;
    wx.getSetting({
      success: res => {
        this.getUserLocation(res, _this); // 获取用户位置信息
      }
    });
    wx.showLoading({ title: '加载中...' });
    this.initData();
  },
  // 数据初始化
  initData() {
    wx.cloud.callFunction({
      name: 'getProductsData',
      data: {
        pageData: this.data.pageData
      },
      success: res => {
        wx.hideLoading()
        if(res && res.result && res.result.data && res.result.data.data) {
          const data = res.result.data.data;
          data.forEach(item => {
            const { heatIconList, notHeatIconList } = this.calculatingHeat(item);
            const { newCurrentPrice, newOriginPrice } = this.calculatingPrice(item);
            item.heatIconList = heatIconList;
            item.notHeatIconList = notHeatIconList;
            item.currentPrice = newCurrentPrice;
            item.originPrice = newOriginPrice;
            item.displayImg = item.img[0];
          });
          this.setData({
            productsList: [...this.data.productsList, ...data],
            showLoading: !!data.length,
            isLoaded: true,
            swiperImgs: [{
              _id: 1,
              img: '../../images/banner1.jpg'
            }, {
              _id: 2,
              img: '../../images/banner2.jpg'
            }, {
              _id: 3,
              img: '../../images/banner3.jpg'
            }]
          });
        }
      },
      fail: e => {
        console.log(e);
        wx.hideLoading()
        wx.showToast({
          title: '服务繁忙，请稍后再试~',
          icon: 'none'
        })
      }
    })
  },
  // 自动获取用户位置
  getUserLocation(res, _this) {
    if(res.authSetting['scope.userLocation']) { // 用户默认同意授权位置信息
      wx.getLocation({
        type: 'wgs84',
        success: res => { // 先获取到经纬度
          this.useQQMap(res.latitude, res.longitude, _this);
        },
        fail (e) { // 未获取到经纬度
          console.log(e, 'fail')
          wx.showModal({
            title: '小宝没有找到你~',
            content: '请点击左上角位置图标，让小宝知道您在哪儿吧~',
            showCancel: false,
            confirmText: '我知道啦'
          })
        }
      })
    } else { // 用户未同意授权位置信息
      wx.authorize({ // 向用户发起授权请求
        scope: 'scope.userLocation',  
        success: () => { // 用户同意授权位置信息
          wx.chooseLocation({
            success: res => {
              this.useQQMap(res.latitude, res.longitude, _this)
            },
            fail: res => {
              console.log('打开地图选择位置取消', res);
            }
          })
        },
        fail: () => { // 用户未同意授权位置信息
          console.log('用户未同意授权位置信息');
          wx.showModal({
            title: '',
            content: '糟糕...我不知道您在哪儿，请授权给我位置信息，小宝会为您提供更好的服务',
            success: (tip) => {
              if (tip.confirm) {
                wx.openSetting({ // 调起客户端小程序设置界面，返回用户设置的操作结果
                  success: (data) => {
                    if (data.authSetting["scope.userLocation"]) {
                      wx.chooseLocation({
                        success: res => {
                          this.useQQMap(res.latitude, res.longitude, _this);
                        }
                      })
                    } else {
                      wx.showModal({
                        title: '提示',
                        content: '请点击左上角位置图标，让小宝知道您在哪儿吧~',
                        showCancel: false,
                        confirmText: '我知道啦'
                      })
                    }
                  },
                  fail: () => {},
                });
              } else {
                wx.showModal({
                  title: '您拒绝了我...',
                  content: '请点击左上角位置图标，让小宝知道您在哪儿吧~',
                  showCancel: false,
                  confirmText: '我知道啦'
                })
              }
            }
          });
        }
      })
    }
  },
  // 用户自己选择位置
  goLocationPage() {
    const _this = this;
    wx.getSetting({
      success: res => {
        if(res.authSetting['scope.userLocation']) {
          wx.chooseLocation({
            success: res => {
              this.useQQMap(res.latitude, res.longitude, _this);
            }
          })
        } else {
          wx.openSetting({
            success: data => {
              if (data.authSetting["scope.userLocation"]) { // 已授权位置信息
                wx.chooseLocation({
                  success: res => {
                    this.useQQMap(res.latitude, res.longitude, _this);
                  }
                })
              } else {
                wx.showModal({
                  title: '提示',
                  content: '请点击左上角位置图标，让小宝知道您在哪儿吧~',
                  showCancel: false,
                  confirmText: '好的~'
                })
              }
            },
            fail: () => {
              wx.showModal({
                title: '提示',
                content: '位置服务繁忙，请再试一次~',
                showCancel: false,
                confirmText: '好的~'
              })
            },
          });
        }
      }
    })
  },
  // 使用腾讯位置服务
  useQQMap(latitude, longitude, _this) {
    const qqmapsdk = new QQMapWX({
      key: 'A4BBZ-RMHYU-LDQVQ-BZDUV-EOPZO-5BFWK'
    });
    qqmapsdk.reverseGeocoder({ // 再通过腾讯位置服务获取到地理位置
      location: { latitude, longitude },
      success: res => {
        // console.log('location service', res);
        _this.setData({
          userAddress: res.result.formatted_addresses.recommend,
          locationFlash: false,
          locationShow: true,
        });
        _this.data.timer = setTimeout(() => {
          _this.setData({ locationShow: false });
          clearTimeout(_this.data.timer);
        }, 3000);
      },
      fail: e => { // 腾讯位置服务出错
        console.log(e, 'fail')
        _this.setData({
          locationFlash: false
        });
      }
    });
  },
  // 下拉刷新
	onPullDownRefresh() {
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000);
  },
  // 触底操作
  onReachBottom() {
    if(this.data.showLoading) {
      this.data.pageData.currentPage += 1;
      this.initData();  
    }
  },
  // 页面滚动
  onPageScroll(e) {
    this.setData({
      scrollTop: e.scrollTop
    })
  },
  // 前往商品详情页面
  toProductsDetail(e) {
    const targetItem = e.currentTarget.dataset.item;
    const groupId = app.globalData.openid.substr(0, 6) + targetItem._id.substr(0, 6) + targetItem.uid.substr(0, 6);
    wx.navigateTo({
      url: '../productDetail/productDetail',
      success: function(res) {
        res.eventChannel.emit('toProductDetail', {_id: targetItem._id, groupId: groupId, from: 'homePage'})
      }
    });
  },
  // 前往聊天页面
  gotoCurrentChat(e) {
    console.log('message', e.currentTarget.dataset);
  },
  // 前往搜索页
  gotoSearch() {
    wx.navigateTo({
      url: '../search/search',
    })
  },
  // 点击轮播图
  bannerClick(e) {
    console.log(e.currentTarget.dataset.item)
  },
  // 选择商品分类
  // chooseCategory(e) {
  //   const query = wx.createSelectorQuery();
  //   query.selectAll('.products-category-item').boundingClientRect();
  //   query.select('.products-category-item').boundingClientRect();
  //   query.exec(res => {
  //     console.log(res);
  //     const selectedItemLeft = res[0][e.target.dataset.index].left;
  //     console.log(selectedItemLeft);
  //     if(selectedItemLeft > 190) {
  //       this.setData({
  //         selectedItemLeft: selectedItemLeft
  //       })
  //     }
  //   });
  //   this.setData({
  //     currentIndex: e.target.dataset.index
  //   });
  // },
  // 计算热度
  calculatingHeat(item) {
    const heatIconList = [];
    const notHeatIconList = [];
    heatIconList.length = item.heat;
    notHeatIconList.length = 5 - item.heat;
    return {
      heatIconList,
      notHeatIconList,
    }
  },
  // 计算价格
  calculatingPrice(item) {
    let newCurrentPrice = priceConversion(item.currentPrice);
    let newOriginPrice = priceConversion(item.originPrice);
    return {
      newCurrentPrice,
      newOriginPrice
    }
  },
})
