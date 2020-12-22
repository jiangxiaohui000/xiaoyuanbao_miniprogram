// miniprogram/pages/productDetail.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		userInfo: {
			avatar: '../../images/touxiang1.jpeg',
			name: '小脑斧大西吉',
			releaseTime: '2020-10-10 13:49',
			collected: 30
		},
		productInfo: {
			price: 233,
			tags: ['全新', '不讲价'],
			text: '产品名称: Lancome/兰蔻 菁纯丝绒柔雾唇釉品牌: Lancome/兰蔻Lancome/兰蔻单品: 菁纯丝绒柔雾唇釉产地: 法国颜色分类: 888（粉金管 196（金管滋润） 06（2020春季balm小姐） 07（2020春季balm小姐） 274金管滋润 417 168金管 金管274 02（黑管 82 03（黑管 274（宝石黑管） 金管196滋润 皮革包装196 01（黑管 507现货黑管 473（黑管 481（黑管 505 196哑光黑管 274皮革 525皮革 粉金管278 粉金管颜色备注保质期: 3年适合肤质: 任何肤质上市时间: 2015年功效: 遮瑕 滋润 保湿规格类型: 正常规格是否为特殊用',
			img: ['../../images/productDetail2.jpg', '../../images/productDetail3.jpg', '../../images/productDetail4.jpg'],
		},
		collectedStatus: '收藏',
		collectedIcon: 'icon-shoucang',
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		let eventChannel = this.getOpenerEventChannel();
		eventChannel.on('sendProductDetailID', function(data) {
			console.log(data);
		});
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
		if (this.data.collectedStatus === '收藏') {
			this.setData({
				collectedStatus: '已收藏',
				collectedIcon: 'icon-shoucang1'
			})
		} else {
			this.setData({
				collectedStatus: '收藏',
				collectedIcon: 'icon-shoucang'
			})
		}
	},

	gotoChatRoom() {
		console.log('chat');
	}
})