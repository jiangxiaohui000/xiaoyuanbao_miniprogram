// miniprogram/pages/productDetail.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		userInfo: {
			avatar: '../../images/touxiang1.jpeg',
			name: 'sadfji',
			releaseTime: '2020-10-10 13:49',
			collected: 30
		},
		productInfo: {
			price: 23333,
			tags: ['全新', '不讲价'],
			text: '加快速度阿斯殴打见覅偶按时缴费阿斯殴打见覅偶按时缴费掉阿斯偶觉得覅偶按实际掉我按实际地of啊囧死殴大四偶觉得覅欧文IE欧吉阿卡丽SV就卡死的',
			img: ['../../images/productDetail1.jpg', '../../images/productDetail2.jpg', '../../images/productDetail3.jpg', '../../images/productDetail4.jpg'],
		}
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

	collectGoods() {
		console.log('collect');
	},

	gotoChatRoom() {
		console.log('chat');
	}
})