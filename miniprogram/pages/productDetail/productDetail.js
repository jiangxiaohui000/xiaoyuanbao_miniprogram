// miniprogram/pages/productDetail.js
const app = getApp();
const dayjs = require('dayjs');
const { priceConversion } = require('../../utils/priceConversion');

Page({
	data: {
		productInfo: '',
		collectedStatus: '',
		collectedIcon: '',
		// productTags: [],
		from: '',
		groupId: '',
		needAdaptIphoneX: false,
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function () {
		wx.showLoading({ title: '加载中...' });
		let eventChannel = this.getOpenerEventChannel();
		eventChannel.on('toProductDetail', (data) => {
			console.log(data, 'data');
			data && data.from && this.setData({ from: data.from });
			data && data.groupId && this.setData({ groupId: data.groupId });
			data && data._id && this.initData(data._id);
		});
		this.setData({
			needAdaptIphoneX: app.globalData.needAdaptIphoneX
		})
	},
	// 数据初始化
	initData(id) {
		wx.cloud.callFunction({
			name: 'getProductsInfoData',
			data: {
				_id: id
			},
			success: res => {
				console.log(res, 'data-info')
				wx.hideLoading()
				if(res && res.result && res.result.data && res.result.data.data && res.result.data.data.length) {
					this.data.productInfo = res.result.data.data[0];
					this.data.collectedStatus = this.data.productInfo.isCollected.filter(item => item == app.globalData.openid).length ? '已收藏' : '收藏';
					this.data.collectedIcon = this.data.productInfo.isCollected.filter(item => item == app.globalData.openid).length ? 'icon-shoucang1' : 'icon-shoucang';
					this.data.productInfo.ctime = dayjs(this.data.productInfo.ctime).format('YYYY-MM-DD HH:mm:ss');
					this.data.productInfo.currentPrice = priceConversion(this.data.productInfo.currentPrice);
					this.setData({
						collectedStatus: this.data.collectedStatus,
						collectedIcon: this.data.collectedIcon,
						productInfo: this.data.productInfo,
						// productTags: this.data.productTags,
					})
				}
			},
			fail: e => {
				console.log(e, 'getProductsInfoData-error');
				wx.showToast({
					title: '服务繁忙，请稍后再试...',
					icon: 'none'
				});
			}
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
	// 分享
	// shareProduct() {
	// 	this.onShareAppMessage(this.data.productInfo);
	// },
	// 聊一聊
	gotoChatRoom() {
		const data = this.data.productInfo;
		wx.navigateTo({
      url: `/pages/im/room/room?img=${data.img[0]}&price=${data.currentPrice}&nickName=${data.nickName}&groupId=${this.data.groupId}`,
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
	onShareAppMessage: (data) => {
		const promise = new Promise(resolve => {
      setTimeout(() => {
        resolve({
          title: data ? data.desc.substring(0, 10) + '...' : this.data.productInfo.desc.substring(0, 10) + '...'
        })
      }, 2000)
    })
    return {
      title: data ? data.desc.substring(0, 10) + '...' : this.data.productInfo.desc.substring(0, 10) + '...',
      path: '/pages/productDetail/productDetail',
      promise 
    }
	},
})