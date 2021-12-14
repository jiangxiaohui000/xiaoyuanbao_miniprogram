// miniprogram/pages/productDetail.js
const app = getApp();
const dayjs = require('dayjs');
const { priceConversion } = require('../../utils/priceConversion');

Page({
	data: {
		productInfo: '',
		collectedText: '',
		collectedIcon: '',
		collectedStatus: false,
		// productTags: [],
		isOwn: '0',
		groupId: '',
		needAdaptIphoneX: false,
		_id: '',
		uid: '',
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function () {
		wx.showLoading({ title: '加载中...' });
		let eventChannel = this.getOpenerEventChannel();
		eventChannel.on('toProductDetail', (data) => {
			console.log(data, 'data');
			data && data.isOwn && this.setData({ isOwn: data.isOwn });
			data && data.groupId && this.setData({ groupId: data.groupId });
			data && data._id && this.initData(data._id);
			data && data._id && (this.data._id = data._id);
		});
		this.setData({
			needAdaptIphoneX: app.globalData.needAdaptIphoneX
		});
		app.globalData.openid && (this.data.uid = app.globalData.openid);
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
					this.data.collectedStatus = this.data.productInfo.isCollected.includes(this.data.uid);
					if(this.data.productInfo.isCollected.filter(item => item == this.data.uid).length) {
						this.data.collectedText = '已收藏';
						this.data.collectedIcon = 'icon-shoucang1';
					} else {
						this.data.collectedText = '收藏';
						this.data.collectedIcon = 'icon-shoucang';
					}
					this.data.productInfo.ctime = dayjs(this.data.productInfo.ctime).format('YYYY-MM-DD HH:mm');
					this.data.productInfo.currentPrice = priceConversion(this.data.productInfo.currentPrice);
					this.setData({
						collectedText: this.data.collectedText,
						collectedIcon: this.data.collectedIcon,
						productInfo: this.data.productInfo,
						// productTags: this.data.productTags,
					})
				}
			},
			fail: e => {
				console.log(e, 'getProductsInfoData-error');
				wx.showToast({
					title: '服务繁忙，请稍后再试~',
					icon: 'none'
				});
			}
		})
	},
	// 收藏与取消收藏
	collectProducts() {
		if (this.data.collectedStatus) { // 当前已收藏，点击取消收藏
			wx.showLoading();
			const index = this.data.productInfo.isCollected.findIndex(item => item === this.data.uid);
			this.data.productInfo.isCollected.splice(index, 1);
			console.log(this.data.productInfo.isCollected, '4947444')
			wx.cloud.callFunction({ // 先更新商品数据
				name: 'updateProductsData',
				data: {
					_id: this.data._id,
					uid: this.data.uid,
					isCollected: this.data.productInfo.isCollected,
				},
				success: res => {
					console.log(res, '99494944')
					wx.cloud.callFunction({ // 获取用户数据，拿到用户收藏商品的数据
						name: 'getUserData',
						data: {
							uid: this.data.uid
						},
						success: res => {
							console.log(res, '435763735467')
							if(res && res.result && res.result.data && res.result.data.length) {
								const collectedProducts = res.result.data[0].collectedProducts;
								const index = collectedProducts.findIndex(item => item == this.data._id);
								collectedProducts.splice(index, 1);
								wx.cloud.callFunction({ // 更新用户收藏商品的数据
									name: 'updateUserData',
									data: {
										uid: this.data.uid,
										collectedProducts: collectedProducts,
									},
									success: res => {
										console.log(res, '9op9jdsfh')
										wx.hideLoading();
										this.setData({
											collectedText: '收藏',
											collectedIcon: 'icon-shoucang',
											collectedStatus: false,
											productInfo: this.data.productInfo,
										});
										wx.showToast({
											title: '已取消',
											icon: 'success',
										});
									},
									fail: e => {
										console.log(e, 'error')
										wx.showToast({
											title: '服务繁忙，请稍后再试~',
											icon: 'none',
										})
									}
								})
							}
						},
						fail: e => {
							console.log(e, 'error')
							wx.showToast({
								title: '服务繁忙，请稍后再试~',
								icon: 'none',
							})
						}
					});
				},
				fail: e => {
					console.log(e, 'error')
					wx.showToast({
						title: '服务繁忙，请稍后再试~',
						icon: 'none',
					})
				}
			});
		} else { // 当前未收藏，点击收藏
			wx.showLoading();
			this.data.productInfo.isCollected.push(this.data.uid);
			wx.cloud.callFunction({ // 先更新商品数据
				name: 'updateProductsData',
				data: {
					_id: this.data._id,
					uid: this.data.uid,
					isCollected: this.data.productInfo.isCollected,
				},
				success: res => {
					console.log(res, '445566')
					wx.cloud.callFunction({ // 获取用户数据，拿到用户收藏商品的数据
						name: 'getUserData',
						data: {
							uid: this.data.uid,
						},
						success: res => {
							console.log(res.result.data,'8444434')
							if(res && res.result && res.result.data && res.result.data.length) {
								const collectedProducts = res.result.data[0].collectedProducts;
								collectedProducts.push(this.data._id);
								wx.cloud.callFunction({ // 更新用户收藏商品的数据
									name: 'updateUserData',
									data: {
										uid: this.data.uid,
										collectedProducts: collectedProducts,
									},
									success: res => {
										console.log(res, '9op9jdsfh')
										wx.hideLoading();
										this.setData({
											collectedText: '已收藏',
											collectedIcon: 'icon-shoucang1',
											collectedStatus: true,
											productInfo: this.data.productInfo,
										});
										wx.showToast({
											title: '已收藏',
											icon: 'success',
										});
									},
									fail: e => {
										console.log(e, 'error')
										wx.showToast({
											title: '服务繁忙，请稍后再试~',
											icon: 'none',
										})
									}
								})
							}
						},
						fail: e => {
							console.log(e, 'error')
							wx.showToast({
								title: '服务繁忙，请稍后再试~',
								icon: 'none',
							})
						}
					});
				},
				fail: e => {
					console.log(e, 'error')
					wx.showToast({
						title: '服务繁忙，请稍后再试~',
						icon: 'none',
					})
				}
			});
		}
	},
	// 聊一聊
	gotoChatRoom() {
		const data = this.data.productInfo;
		console.log(data, '---------')
		wx.navigateTo({
			url: `/pages/im/room/room?img=${data.img[0]}&price=${data.currentPrice}&seller_nickName=${data.nickName}&seller_avatarUrl=${data.avatarUrl}&groupId=${this.data.groupId}&productId=${data._id}&uid=${data.uid}`,
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
			success: (res) => {
				if (res.confirm) {
					wx.showLoading({
						title: '删除中...'
					});
					wx.cloud.callFunction({
						name: 'updateProductsData',
						data: {
							uid: this.data.uid,
							_id: this.data._id,
							isDeleted: '1',
						},
						success: res => {
							console.log(res, '9038409jr')
							wx.hideLoading();
							if(res && res.result && res.result.status && res.result.status == 200) {
								wx.showToast({
									title: '删除成功',
									icon: 'success',
								});
								wx.nextTick(() => {
									wx.navigateBack({
										delta: 1,
									});	
								});
							}
						},
						fail: e => {
							console.log(e, 'error3')
							wx.showToast({
								title: '服务繁忙，请稍后再试~',
								icon: 'none',
							})
						}
					})
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