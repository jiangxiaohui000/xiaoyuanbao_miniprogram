//homePage.js
const app = getApp();
const QQMapWX = require('../../utils/qqmap-wx-jssdk.js'); // 引入腾讯位置服务
const { checkNetworkStatus } = require('../../utils/checkNetworkStatus');
const { QQ_MAP_KEY } = require('../../utils/config');
const { calculatingHeat, calculatingPrice } = require('../../utils/productUtils');

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
    nearbyEstate: '', // 最近的小区名，授权后替换定位图标
    loadingEstate: '', // 小区名称加载占位符，避免页面闪烁
    locationFlash: true,
    locationAuthorized: false, // 是否已获得定位授权
    showLocationAuthModal: false, // 是否显示位置授权引导弹窗
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
    hasRelevantData: true, // 有相关地理位置数据
    initCount: 0, // 统计initData执行的次数，在第一次执行时，判断有没有用户地理位置相关数据
  },

  onLoad() {
    if (!wx.cloud) {
      wx.showModal({
        title: '提示',
        content: '请使用 2.2.3 或以上的基础库以使用云能力',
        showCancel: false,
      });
      return;
    }
    app.login(res => this.data.openid = res); // 调用全局登录方法获取openid
    checkNetworkStatus(); // 网络状态检测
    wx.showLoading({ title: '加载中...' });
    this.getUserLocation(null, this); // 获取用户位置（微信会自动处理授权弹窗）
		wx.disableAlertBeforeUnload();
  },
  onUnload() {
  },
  // 数据初始化
  initData(userLongitude, userLatitude) {
    this.data.initCount++;
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
            hasRelevantData: this.data.initCount === 1 && data.length,
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
          // 如果带位置查询没结果，降级为不带位置查全部；若已经是不带位置查询仍无结果则不再递归
          if(userLongitude || userLatitude) {
            this.initData('', '');
          } else {
            this.setData({ showLoading: false, isLoaded: true });
          }
        }
      },
      fail: e => {
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
    // 不管是否已授权，直接调 wx.getLocation
    // 已授权：直接返回坐标
    // 未授权：微信会自动弹出官方授权框（真机），用户同意后返回坐标
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        this.setData({ showLocationAuthModal: false });
        this.data.userLongitude = res.longitude;
        this.data.userLatitude = res.latitude;
        this.initData(this.data.userLongitude, this.data.userLatitude);
        this.useQQMap(res.latitude, res.longitude, _this || this);
      },
      fail: e => {
        wx.hideLoading();
        // 授权被拒或获取失败：降级显示全部商品，同时提示用户可手动选择位置
        this.initData('', '');
        if (e.errMsg && e.errMsg.indexOf('auth deny') > -1) {
          this.setData({ showLocationAuthModal: true });
        }
      }
    });
  },
  // 位置授权弹窗：用户点击"去授权"按钮，跳转系统设置页
  onGetLocationSuccess() {
    this.setData({ showLocationAuthModal: false });
    wx.openSetting({
      success: data => {
        if (data.authSetting['scope.userLocation']) {
          wx.showLoading({ title: '加载中...' });
          this.data.productsList = [];
          this.data.initCount = 0;
          wx.getLocation({
            type: 'gcj02',
            success: res => {
              this.data.userLongitude = res.longitude;
              this.data.userLatitude = res.latitude;
              this.initData(this.data.userLongitude, this.data.userLatitude);
              this.useQQMap(res.latitude, res.longitude, this);
            },
            fail: () => this.initData('', '')
          });
        }
      }
    });
  },
  // 位置授权弹窗：用户点击"暂不授权"
  onSkipLocation() {
    this.setData({ showLocationAuthModal: false });
  },
  // 用户自己选择位置
  goLocationPage() {
    const _this = this;
    wx.getSetting({
      success: res => {
        if(res.authSetting['scope.userLocation']) { // 用户授权位置
          wx.chooseLocation({
            success: res => {
              this.data.productsList = [];
              this.data.initCount = 0;
              this.data.userLongitude = res.longitude;
              this.data.userLatitude = res.latitude;
              this.initData(this.data.userLongitude, this.data.userLatitude);
              this.useQQMap(res.latitude, res.longitude, _this);
            }
          })
        } else { // 用户未授权位置，打开设置，让用户授权
          wx.openSetting({
            success: data => {
              if (data.authSetting["scope.userLocation"]) { // 已授权位置信息
                wx.chooseLocation({
                  success: res => {
                    this.data.productsList = [];
                    this.data.initCount = 0;
                    this.data.userLongitude = res.longitude;
                    this.data.userLatitude = res.latitude;
                    this.initData(this.data.userLongitude, this.data.userLatitude);
                    this.useQQMap(res.latitude, res.longitude, _this);
                  }
                })
              } else { // 没有授权位置，弹出提示
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
              this.data.productsList = [];
              this.data.initCount = 0;
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
      key: QQ_MAP_KEY
    });
    qqmapsdk.reverseGeocoder({
      location: { latitude, longitude },
      get_poi: 1, // 开启周边 POI 返回，用于提取小区信息
      success: res => {
        const result = res.result;
        const address = result.formatted_addresses && result.formatted_addresses.recommend || '';
        app.globalData.userLocation = {
          longitude: longitude,
          latitude: latitude,
          address: address,
        };

        // 从 pois 里找最近的住宅小区
        // 腾讯地图 category 中住宅区通常是 "房产;住宅区;住宅小区" 或 "房产;住宅区"
        const pois = result.pois || [];
        let nearbyEstate = '';
        const residentialPoi = pois.find(poi =>
          poi.category && (
            poi.category.indexOf('住宅') > -1 ||
            poi.category.indexOf('小区') > -1 ||
            poi.category.indexOf('公寓') > -1
          )
        );
        if (residentialPoi) {
          nearbyEstate = residentialPoi.title;
        } else {
          // 降级：尝试从 address_reference.landmark_l1 获取地标名
          const landmark = result.address_reference && result.address_reference.landmark_l1;
          if (landmark && landmark.title) {
            nearbyEstate = landmark.title;
          }
        }

        _this.setData({
          userAddress: address,
          nearbyEstate: nearbyEstate,
          loadingEstate: nearbyEstate, // 加载完成后赋值
          locationFlash: false,
          locationAuthorized: true,
        });
      },
      fail: e => { // 腾讯位置服务出错
        wx.showToast({
          title: '服务繁忙，请稍后再试~',
          icon: 'none',
        });
        _this.setData({
          locationFlash: false,
        });
      }
    });
  },
  // 下拉刷新
	onPullDownRefresh() {
    this.data.productsList = [];
    this.data.pageData.currentPage = 1;
    this.data.initCount = 0;
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
    // 用买方、卖方、商品的ID组成一个groupId
    const groupId = `${app.globalData.openid}${targetItem._id}${targetItem.uid}`;
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
  },
  // 选择商品分类
  // chooseCategory(e) {
  //   const query = wx.createSelectorQuery();
  //   query.selectAll('.products-category-item').boundingClientRect();
  //   query.select('.products-category-item').boundingClientRect();
  //   query.exec(res => {
  //     const selectedItemLeft = res[0][e.target.dataset.index].left;
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
  // 计算热度（使用公共工具函数）
  calculatingHeat(item) {
    return calculatingHeat(item);
  },
  // 计算价格（使用公共工具函数）
  calculatingPrice(item) {
    return calculatingPrice(item);
  },
})
