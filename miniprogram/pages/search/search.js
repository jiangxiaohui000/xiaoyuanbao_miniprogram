// miniprogram/pages/search/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchValue: '',
    historyTags: ['纽麦', '教师节', '蓝牙耳机', '双十一狂欢', '苹果手机', 'MacBook Air', '优惠券'],
    hotSearchData: ['纽麦', '教师节', '蓝牙耳机', '双十一狂欢', '苹果手机', 'MacBook Air', '优惠券', '飞利浦显示器 292e2e', '玉兰油七重功效', 'switch游戏机'],
    searchKeyWord: 'Apple超级品牌日',
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
    if (this.data.historyTags.length >= 10) {
      this.data.historyTags.pop();
    }
    if (e.detail.value) {
      if (!this.data.historyTags.includes(e.detail.value)) {
        this.data.historyTags.unshift(e.detail.value);
        this.setData({
          historyTags: this.data.historyTags
        });
      };
    } else {
      if (!this.data.historyTags.includes(this.data.searchKeyWord)) {
        this.data.historyTags.unshift(this.data.searchKeyWord);
        this.setData({
          historyTags: this.data.historyTags
        });
      };
    }
    console.log(e.detail.value || this.data.searchKeyWord);
  },
  // 输入框输入内容
  searchInput(e) {
    this.setData({
      searchValue: e.detail.value
    })
  },
  // 清空搜索框
  clearSearchValue() {
    console.log(this.data.searchValue);
    this.setData({
      searchValue: ''
    })
    console.log(this.data.searchValue);
  },
  // 选择
  chooseTag(e) {
    this.setData({
      searchValue: e.currentTarget.dataset.value
    })
  },
  // 清除历史搜索
  clearHistory() {
    this.setData({
      historyTags: []
    })
  },
})