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
    showWhichPage: 'init', // init: 初始化页面 list: 搜索结果页面 noData: 暂无数据页面 loading: 数据加载页面
    productsList: [],
    pageData: {
      pageSize: 20,
      currentPage: 1
    },
    showLoading: true,
    isLoaded: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 搜索
  confirmSearch(e) {
    const value = e.detail.value;
    if (value) {
      this.setData({
        showWhichPage: 'loading',
      });
      // 获取数据
      this.getData(value);
      // 处理搜索标签
      const index = this.data.historyTags.findIndex(item => item === value);
      if (index > -1) { // 包含在搜索历史中，则把这个标签放在最前面
        this.data.historyTags.splice(index, 1);
        this.data.historyTags.unshift(value);
      } else { // 不包含在搜索历史中，则放进搜索历史中
        this.data.historyTags.unshift(value);
      };
      this.data.historyTags.length > 15 && this.data.historyTags.pop(); // 搜索生成的标签超过15个，则把最后一个删掉
      this.setData({
        historyTags: this.data.historyTags
      });
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
    this.setData({
      searchValue: value
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
    }
    this.setData({
      dialogShow: false
    });
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
        console.log(res.result, '44444433333322222')
        if(res && res.result && res.result.result && res.result.result.length) { // 有数据
          const data = res.result.result;
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
            showWhichPage: 'list',
            productsList: data,
          });
        } else { // 无数据
          this.setData({
            showWhichPage: 'noData',
          });
        }
      },
      fail: e => {
        console.log(e, 'error');
        wx.showToast({
          title: '服务繁忙，请稍后再试~',
          icon: 'none',
        });
        this.setData({
          showWhichPage: 'noData',
        });
      }
    });
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
})