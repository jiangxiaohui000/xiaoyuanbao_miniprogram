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
    const regexp_phone = /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[189]))\d{8}$/;
    const regexp_email = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const result1 = regexp_phone.test(this.data.contactInfo);
    const result2 = regexp_email.test(this.data.contactInfo);
    const params = {
      content: this.data.content,
      contactInformation: result1 || result2 ? this.data.contactInfo : '',
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