// miniprogram/pages/productDetail.js
const dayjs = require('dayjs');
const { priceConversion } = require('../../utils/priceConversion');

Page({
	data: {
		productInfo: {
			_id: 'adcb22dsldvklkasdfvkdsaf',
			uid: '1',
			avatar: '../../images/touxiang1.jpeg',
			name: '小脑斧大西吉',
			ctime: 1623141369000,
			favorited: 30, // 被收藏次数
      currentPrice: 1111,
      originPrice: 2222,
			desc: '产品名称: Lancome/兰蔻 菁纯丝绒柔雾唇釉品牌: Lancome/兰蔻Lancome/兰蔻单品:产品名称: Lancome/兰蔻 菁纯丝绒柔雾唇釉品牌: Lanco',
			displayImg: '../../images/kouhong.jpg',
			img: ['../../images/productDetail2.jpg', '../../images/productDetail3.jpg', '../../images/productDetail4.jpg'],
      heat: 3, // 热度
			isOff: false, // 是否已下架
			isDeleted: false, // 是否已删除
			isCollected: false,
			classify: '', // 类别
			brand: '', // 品牌
			fineness: '', // 成色
		},
		collectedStatus: '',
		collectedIcon: '',
		productTags: [],
		from: '',
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		let eventChannel = this.getOpenerEventChannel();
		eventChannel.on('toProductDetail', (data) => {
			console.log(data, 'data');
			data && data.from && this.setData({ from: data.from });
		});
		this.initData();
	},
	// 数据初始化
	initData() {
		this.data.collectedStatus = this.data.productInfo.isCollected ? '已收藏' : '收藏';
		this.data.collectedIcon = this.data.productInfo.isCollected ? 'icon-shoucang1' : 'icon-shoucang';
		this.data.productInfo.ctime = dayjs(this.data.productInfo.ctime).format('YYYY-MM-DD HH:mm:ss');
		this.data.productInfo.currentPrice = priceConversion(this.data.productInfo.currentPrice);
		this.setData({
			collectedStatus: this.data.collectedStatus,
			collectedIcon: this.data.collectedIcon,
			productInfo: this.data.productInfo,
			productTags: this.data.productTags,
		})
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
		const data = this.data.productInfo;
		wx.navigateTo({
      url: `/pages/im/room/room?img=${data.img[0]}&price=${data.currentPrice}&name=${data.name}`,
    })
	},
	// 编辑
	edit() {
		wx.navigateTo({
			url: '../postProduct/postProduct',
			success: res => {
				const params = {
					productDesc: this.data.productInfo.desc,
					imageList: this.data.productInfo.img,
					price: this.data.productInfo.currentPrice,
				}
				res.eventChannel.emit('toEdit', params);
			}
		})
	},
	// 删除
	delete() {
		wx.showModal({
			title: '',
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