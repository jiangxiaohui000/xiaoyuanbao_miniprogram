// miniprogram/pages/search/index.js
const app = getApp();
const { priceConversion } = require('../../utils/priceConversion');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    searchValue: '',
    historyTags: [],
    hotSearchData: [],
    searchKeyWord: '',
    dialogShow: false,
    buttons: [{text: '取消'}, {text: '确定'}],
    showWhichPage: 'init', // init: 初始化页面 list: 搜索结果页面 loading: 数据加载页面
    productsList: [],
    pageData: {
      pageSize: 20,
      currentPage: 1,
    },
    showLoading: true,
    isLoaded: false,
    hasSearchedData: true,
    searchedValue: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取历史搜索
    const searchKey = wx.getStorageSync('searchKey');
    console.log(searchKey, 'searchKey');
    this.setData({
      historyTags: searchKey ? searchKey : [],
    });
    // 获取热搜榜
    wx.cloud.callFunction({
      name: 'searchHotKey',
      success: res => {
        if(res && res.result && res.result.result && res.result.result.data) {
          this.setData({
            hotSearchData: res.result.result.data
          });
        }
      },
      fail: e => {
        console.log(e);
        wx.showToast({
          title: '服务繁忙，请稍后再试~',
          icon: 'none',
        });
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.showLoading) {
      this.data.pageData.currentPage += 1;
      if(this.data.hasSearchedData) {
        this.getData(this.data.searchedValue);
      } else {
        this.getAllData();
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 搜索
  confirmSearch(e) {
    this.data.searchedValue = typeof e === 'string' ? e : e.detail.value;
    if (this.data.searchedValue) {
      this.setData({
        showWhichPage: 'loading',
        productsList: [],
      });
      this.data.pageData.currentPage = 1;
      // 检查是否有搜索数据
      this.checkData(this.data.searchedValue);
      // 处理搜索标签
      const index = this.data.historyTags.findIndex(item => item === this.data.searchedValue);
      if (index > -1) { // 包含在搜索历史中，则把这个标签放在最前面
        this.data.historyTags.splice(index, 1);
        this.data.historyTags.unshift(this.data.searchedValue);
      } else { // 不包含在搜索历史中，则放进搜索历史中
        this.data.historyTags.unshift(this.data.searchedValue);
      };
      this.data.historyTags.length > 15 && this.data.historyTags.pop(); // 搜索生成的标签超过15个，则把最后一个删掉
      this.setData({
        historyTags: this.data.historyTags
      });
      wx.setStorage({ key: 'searchKey', data: this.data.historyTags });
    }
  },
  // 输入框输入内容
  searchInput(e) {
    this.setData({
      searchValue: e.detail.value
    })
  },
  // 清空搜索框
  clearSearchValue() {
    this.setData({
      searchValue: ''
    });
  },
  // 点击历史搜索
  chooseTag(e) {
    const value = e.currentTarget.dataset.value;
    const index = e.currentTarget.dataset.index;
    this.confirmSearch(value);
    this.setData({
      searchValue: value,
    });
    if(index !== 0) {
      this.data.historyTags.splice(index, 1);
      this.data.historyTags.unshift(value);
    };
    this.setData({
      historyTags: this.data.historyTags
    });
  },
  // 清除历史搜索 -- 按钮
  clearHistory() {
    if(this.data.historyTags.length) {
      this.setData({
        dialogShow: true
      });
    }
  },
  // 清除历史搜索 -- 弹窗
  tapDialogButton(e) {
    if(e.detail.index === 1) { // 确认
      this.setData({
        historyTags: []
      });
      wx.setStorage({ key: 'searchKey', data: [] });
    }
    this.setData({
      dialogShow: false
    });
  },
  // 检查是否有搜索结果
  checkData(value) {
    wx.cloud.callFunction({
      name: 'search',
      data: {
        pageData: this.data.pageData,
        searchKey: value,
      },
      success: res => {
        console.log(res, 'product-count')
        if(res && res.result && res.result.count) {
          const total = res.result.count.total;
          this.data.hasSearchedData = Boolean(total);
          this.data.hasSearchedData ? this.getData(value) : this.getAllData();
          this.setData({
            hasSearchedData: this.data.hasSearchedData,
          });
        }
      },
      fail: e => {
        console.log(e);
        wx.showToast({
          title: '服务繁忙，请稍后再试~',
          icon: 'none'
        });
      }
    })
  },
  // 获取商品数据
  getData(value) {
    wx.cloud.callFunction({ // 根据搜索内容查找对应的商品数据
      name: 'search',
      data: {
        pageData: this.data.pageData,
        searchKey: value,
      },
      success: res => {
        console.log(res, 'product-data')
        this.setData({
          showWhichPage: 'list'
        });
        if(res && res.result && res.result.result && res.result.count) {
          const data = res.result.result;
          const count = res.result.count.total;
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
            showLoading: Boolean(data.length) && count - data.length > 0,
            isLoaded: true,
            showWhichPage: 'list',
          });
        }
      },
      fail: e => {
        console.log(e, 'error');
        wx.showToast({
          title: '服务繁忙，请稍后再试~',
          icon: 'none',
        });
      }
    });
  },
  // 没有搜索到数据，则展示所有数据
  getAllData() {
    wx.cloud.callFunction({
      name: 'getProductsData',
      data: {
        pageData: this.data.pageData,
        isSold: '0',
        isOff: '0',
        isDeleted: '0',
      },
      success: res => {
        console.log(res, 'product-all-data')
        this.setData({
          showWhichPage: 'list'
        });
        if(res && res.result && res.result.data && res.result.data.data) {
          const data = res.result.data.data;
          const count = res.result.count.total;
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
            showLoading: Boolean(data.length) && count - data.length > 0,
            isLoaded: true,
          });
        }
      },
      fail: e => {
        console.log(e);
        wx.showToast({
          title: '服务繁忙，请稍后再试~',
          icon: 'none'
        })
      }
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
  // 取消搜索并返回上一级
  searchCancel() {
    wx.navigateBack({
      delta: 1,
    })
  },
})