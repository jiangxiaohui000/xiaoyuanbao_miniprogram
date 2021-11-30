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
    searchKeyWord: '',
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
      currentPage: 1,
    },
    showLoading: true,
    isLoaded: false,
    openid: '',
    isOwn: '0',
    userLongitude: '', // 用户经度
    userLatitude: '', // 用户纬度
    noRelevantData: false, // 没有相关地理位置数据
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
		wx.disableAlertBeforeUnload();
  },
  // 数据初始化
  initData(userLongitude, userLatitude) {
    wx.cloud.callFunction({
      name: 'getProductsData',
      data: {
        pageData: this.data.pageData,
        isSold: '0',
        isOff: '0',
        isDeleted: '0',
        userLongitude: userLongitude,
        userLatitude: userLatitude,
      },
      success: res => {
        console.log(res, 'success-getProductData')
        wx.hideLoading();
        wx.stopPullDownRefresh();
        if(res && res.result && res.result.data && res.result.data.data && res.result.data.data.length) { // 查找到数据
          const data = res.result.data.data;
          data.forEach(item => {
            const { heatIconList, notHeatIconList } = this.calculatingHeat(item);
            const { newCurrentPrice, newOriginPrice } = this.calculatingPrice(item);
            item.heatIconList = heatIconList;
            item.notHeatIconList = notHeatIconList;
            item.currentPrice = newCurrentPrice;
            item.originPrice = newOriginPrice;
            item.displayImg = item.img[0];
            item.isOwn = item.uid === app.globalData.openid ? '1' : '0';
          });
          this.setData({
            productsList: [...this.data.productsList, ...data],
            showLoading: !!!data.length,
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
        } else { // 没有相关数据
          this.initData('', '');
        }
      },
      fail: e => {
        console.log(e);
        wx.hideLoading();
        wx.stopPullDownRefresh();
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
        type: 'gcj02',
        success: res => { // 先获取到经纬度
          this.data.userLongitude = res.longitude;
          this.data.userLatitude = res.latitude;
          this.initData(this.data.userLongitude, this.data.userLatitude);
          this.useQQMap(res.latitude, res.longitude, _this);
        },
        fail (e) { // 未获取到经纬度
          console.log(e, 'fail')
          this.initData('', '');
          wx.showModal({
            title: '位置获取失败',
            content: '请点击左上角位置图标选择一下位置吧~',
            showCancel: false,
            confirmText: '我知道了'
          })
        }
      })
    } else { // 用户未同意授权位置信息
      wx.authorize({ // 向用户发起授权请求
        scope: 'scope.userLocation',  
        success: () => { // 用户同意授权位置信息
          wx.chooseLocation({
            success: res => {
              this.data.userLongitude = res.longitude;
              this.data.userLatitude = res.latitude;
              this.initData(this.data.userLongitude, this.data.userLatitude);
              this.useQQMap(res.latitude, res.longitude, _this)
            },
            fail: error => {
              console.log('打开地图选择位置取消', error);
              this.initData('', '');
            }
          })
        },
        fail: () => { // 用户未同意授权位置信息
          console.log('用户未同意授权位置信息');
          wx.hideLoading();
          wx.showModal({
            title: '未授权位置信息',
            content: '请点击左上角位置图标授权位置信息，以便更好地为您展示相关宝贝',
            success: (tip) => {
              if (tip.confirm) {
                wx.openSetting({ // 调起客户端小程序设置界面，返回用户设置的操作结果
                  success: (data) => {
                    if (data.authSetting["scope.userLocation"]) {
                      wx.chooseLocation({
                        success: res => {
                          this.data.userLongitude = res.longitude;
                          this.data.userLatitude = res.latitude;
                          this.initData(this.data.userLongitude, this.data.userLatitude);
                          this.useQQMap(res.latitude, res.longitude, _this);
                        }
                      })
                    } else {
                      this.initData('', '');
                      wx.showModal({
                        title: '未授权位置信息',
                        content: '请点击左上角位置图标授权位置信息，以便更好地为您展示相关宝贝',
                        showCancel: false,
                        confirmText: '我知道了'
                      })
                    }
                  },
                  fail: error => {
                    console.log(error, 'ee');
                    this.initData('', '');
                  },
                });
              } else {
                this.initData('', '');
                wx.showModal({
                  title: '未授权位置信息',
                  content: '请点击左上角位置图标授权位置信息，以便更好地为您展示相关宝贝',
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
              console.log(res, '877748374837648768')
              this.data.productsList = [];
              this.data.userLongitude = res.longitude;
              this.data.userLatitude = res.latitude;
              this.initData(this.data.userLongitude, this.data.userLatitude);
              this.useQQMap(res.latitude, res.longitude, _this);
            }
          })
        } else {
          wx.openSetting({
            success: data => {
              if (data.authSetting["scope.userLocation"]) { // 已授权位置信息
                wx.chooseLocation({
                  success: res => {
                    this.data.productsList = [];
                    this.data.userLongitude = res.longitude;
                    this.data.userLatitude = res.latitude;
                    this.initData(this.data.userLongitude, this.data.userLatitude);
                    this.useQQMap(res.latitude, res.longitude, _this);
                  }
                })
              } else {
                wx.hideLoading();
                wx.showModal({
                  title: '未授权位置信息',
                  content: '请点击左上角位置图标授权位置信息，以便更好地为您展示相关宝贝',
                  showCancel: false,
                  confirmText: '好的~'
                })
              }
            },
            fail: error => {
              console.log(error, 'eeeee');
              this.initData('', '');
              wx.showModal({
                title: '提示',
                content: '服务繁忙，请稍后再试~',
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
        console.log('location service', res);
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
        wx.showToast({
          title: '服务繁忙，请稍后再试~',
          icon: 'none',
        });
        _this.setData({
          locationFlash: false
        });
      }
    });
  },
  // 下拉刷新
	onPullDownRefresh() {
    this.data.productsList = [];
    this.data.pageData.currentPage = 1;
    this.initData(this.data.userLongitude, this.data.userLatitude);
  },
  // 触底加载更多
  onReachBottom() {
    if(this.data.showLoading) {
      this.data.pageData.currentPage += 1;
      this.initData(this.data.userLongitude, this.data.userLatitude);
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
        res.eventChannel.emit('toProductDetail', { _id: targetItem._id, groupId: groupId, isOwn: targetItem.isOwn });
      }
    });
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
    let heat = 0;
    const collectedArrLength = item.isCollected.length;
    if(collectedArrLength > 0 && collectedArrLength <= 10) {
      heat = 1;
    } else if(collectedArrLength > 10 && collectedArrLength <= 20) {
      heat = 2;
    } else if(collectedArrLength > 20 && collectedArrLength <= 30) {
      heat = 3;
    } else if(collectedArrLength > 30 && collectedArrLength <= 40) {
      heat = 4;
    } else if(collectedArrLength > 40) {
      heat = 5;
    }
    heatIconList.length = heat;
    notHeatIconList.length = 5 - heat;
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
