// pages/soldProducts/soldProducts.js
const app = getApp()
const { priceConversion } = require('../../utils/priceConversion');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    productsList: [],
    pageData: {
      pageSize: 10,
      currentPage: 1
    },
		showLoading: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initData();
  },

	// 数据初始化
	initData() {
		wx.cloud.callFunction({
			name: 'getProductsData',
			data: {
				pageData: this.data.pageData,
				uid: this.data.openid,
			},
			success: res => {
				wx.hideLoading();
				wx.stopPullDownRefresh();
				if(res && res.result && res.result.data && res.result.data.data && res.result.count && res.result.count.total) {
					const data = res.result.data.data;
					const total = res.result.count.total;
					data.map(item => {
						item.currentPrice = priceConversion(item.currentPrice);
						item.displayImg = item.img[0];
						return item;
					});
					this.setData({
						productsList: [...this.data.productsList, ...data],
						postNum: total,
            showLoading: !!data.length,
					});
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
  
  // 上滑加载更多
	productScroll() {
    if(this.data.showLoading) {
      this.data.pageData.currentPage += 1;
      this.initData();
    }
	},

  // 前往商品详情页面
  toProductsDetail(e) {
    const targetItem = e.currentTarget.dataset.item;
    const groupId = app.globalData.openid.substr(0, 6) + targetItem._id.substr(0, 6) + targetItem.uid.substr(0, 6);
    wx.navigateTo({
      url: '../productDetail/productDetail',
      success: function(res) {
        res.eventChannel.emit('toProductDetail', {_id: targetItem._id, groupId: groupId, from: ''})
      }
    });
  },

  // 重新卖
  resole(e) {
    console.log(e, '4444433333')
    const target = e.currentTarget.dataset.resoleitem;
    console.log(target, '344344')
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

  }
})