// pages/feedback/feedback.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: '',
    contactInfo: '',
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

  confirmContent(e) {
    console.log(e)
    this.data.content = e.detail.value;
  },
  confirmContact(e) {
    this.data.contactInfo = e.detail.value;
  },
  submit() {
    if(!this.data.content) {
      wx.showToast({
        title: '请填写要反馈的问题或意见建议',
        icon: 'none'
      });
      return;
    }
    const params = {
      content: this.data.content,
      contactInformation: this.data.contactInfo,
      uid: app.globalData.openid,
    };
    wx.showLoading();
    wx.cloud.callFunction({
      name: 'feedback',
      data: params,
    }).then(res => {
      console.log(res)
      wx.hideLoading();
      wx.showToast({
        title: '反馈成功，感谢您的支持',
        icon: 'none'
      });
      const timer = setTimeout(() => {
        wx.navigateBack({
          delta: 1,
        });
        clearTimeout(timer);
      }, 700);
    }).catch(e => {
      console.log(e);
      wx.hideLoading();
      wx.showToast({
        title: '服务繁忙，请稍后再试~',
        icon: 'none'
      });
    })
  }
})