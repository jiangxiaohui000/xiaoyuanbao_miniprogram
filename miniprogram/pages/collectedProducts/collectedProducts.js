// pages/collectedProducts/collectedProducts.js
const app = getApp()
const { priceConversion } = require('../../utils/priceConversion');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    productsList: [],
    uid: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.uid = app.globalData.openid;
    wx.showLoading();
    this.initData();
  },

	// 数据初始化
	initData() {
		wx.cloud.callFunction({ // 获取用户数据，拿到收藏的商品ID
			name: 'getUserData',
			data: {
        uid: this.data.uid,
			},
			success: res => {
        console.log(res, '049894785')
				wx.hideLoading();
				wx.stopPullDownRefresh();
				if(res && res.result && res.result.data && res.result.data.length) {
          const collectedProducts = res.result.data[0].collectedProducts;
          if(collectedProducts && collectedProducts.length) {
            wx.cloud.callFunction({ // 根据用户收藏的商品ID，获取相应的商品
              name: 'getProductsData',
              data: {
                _id: collectedProducts,
                useCommand: 'or',
              },
              success: res => {
                console.log(res, ';434444444')
                if(res && res.result && res.result.data && res.result.data.data) {
                  const data = res.result.data.data;
                  data.map(item => {
                    const { heatIconList, notHeatIconList } = this.calculatingHeat(item);
                    const { newCurrentPrice, newOriginPrice } = this.calculatingPrice(item);
                    item.heatIconList = heatIconList;
                    item.notHeatIconList = notHeatIconList;
                    item.currentPrice = newCurrentPrice;
                    item.originPrice = newOriginPrice;
                    item.displayImg = item.img[0];
                    return item;
                  });
                  this.setData({
                    productsList: data,
                  });  
                }
              },
              fail: e => {
                console.log(e, 'error')
                wx.hideLoading();
                wx.stopPullDownRefresh();
                wx.showToast({
                  title: '服务繁忙，请稍后再试~',
                  icon: 'none'
                })
              }
            })
          }
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

  // 前往商品详情页面
  toProductsDetail(e) {
    const targetItem = e.currentTarget.dataset.item;
    const groupId = this.data.uid.substr(0, 6) + targetItem._id.substr(0, 6) + targetItem.uid.substr(0, 6);
    wx.navigateTo({
      url: '../productDetail/productDetail',
      success: function(res) {
        res.eventChannel.emit('toProductDetail', {_id: targetItem._id, groupId: groupId, from: 'homePage'})
      }
    });
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
    this.initData();
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