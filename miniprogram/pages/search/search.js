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
    dialogShow: false,
    buttons: [{text: '取消'}, {text: '确定'}],
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
    if (this.data.historyTags.length >= 15) {
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
  // 历史搜索
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
  // 清除历史搜索
  clearHistory() {
    if(this.data.historyTags.length) {
      this.setData({
        dialogShow: true
      });
    }
  },
  tapDialogButton(e) {
    if(e.detail.index === 1) {
      this.setData({
        historyTags: []
      });
    }
    this.setData({
      dialogShow: false
    });
  }
})