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
			_id: 'adcb22dsldvklkasdfvkdsaf',
			uid: '1',
			price: 233,
			tags: ['全新', '不讲价'],
			text: '产品名称: Lancome/兰蔻 菁纯丝绒柔雾唇釉品牌: Lancome/兰蔻Lancome/兰蔻单品:产品名称: Lancome/兰蔻 菁纯丝绒柔雾唇釉品牌: Lancome/兰蔻Lancome/兰蔻单品:',
			img: ['../../images/productDetail2.jpg', '../../images/productDetail3.jpg', '../../images/productDetail4.jpg'],
		},
		collectedStatus: '收藏',
		collectedIcon: 'icon-shoucang',
		from: '',
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		let eventChannel = this.getOpenerEventChannel();
		eventChannel.on('toProductDetail', (data) => {
			if(data && data.from) {
				this.setData({
					from: data.from
				});
			}
		});
	},
	// 收藏
	collectProducts() {
		if (this.data.collectedStatus === '收藏') {
			this.setData({
				collectedStatus: '已收藏',
				collectedIcon: 'icon-shoucang1'
			});
			wx.showToast({
				icon: 'success',
				title: '已收藏',
			})
		} else {
			this.setData({
				collectedStatus: '收藏',
				collectedIcon: 'icon-shoucang'
			})
			wx.showToast({
				icon: 'success',
				title: '已取消',
			})
		}
	},
	// 聊一聊
	gotoChatRoom() {
		console.log('chat');
	},
	// 编辑
	edit() {
		wx.navigateTo({
			url: '../postProduct/postProduct',
			success: res => {
				const params = {
					productDesc: this.data.productInfo.text,
					imageList: this.data.productInfo.img,
					price: this.data.productInfo.price,
				}
				res.eventChannel.emit('toEdit', params);
			}
		})
	},
	// 删除
	delete() {
		wx.showModal({
			title: '提示',
			content: '确定要删除吗?',
			success (res) {
				if (res.confirm) {
					console.log('用户点击确定')
				}
			}
		});
	},
	// 图片预览
	imgPreview(e) {
		console.log(e)
		wx.previewImage({
			urls: this.data.productInfo.img,
			current: e.currentTarget.dataset.img,
			success: res => {
				console.log(res, 'success')
			},
			fail: e => {
				console.log(e, 'error')
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

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	},
})