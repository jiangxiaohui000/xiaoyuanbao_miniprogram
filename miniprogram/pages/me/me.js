const app = getApp()
const { priceConversion } = require('../../utils/priceConversion');
const { money } = require('../../utils/moneyInputLimit')

Page({
	data: {
		avatarUrl: '../../images/user-unlogin.png',
		userInfo: {
			nickName: '未登录'
		},
		logged: false,
		takeSession: false,
		requestResult: '',
		productsList: [{
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
    }],
		mineItems: [{
			value: 'collection',
			label: '收藏',
			icon: 'collection-b',
			num: 0
		}, {
			value: 'buy',
			label: '购买',
			icon: 'gouwujianying',
			num: 0
		}, {
			value: 'evaluate',
			label: '评价',
			icon: 'pingjia',
			num: 0
		}],
		dialogShow: false,
		dialogImg: '',
		currentPrice: '',
		modifiedPrice: '',
		toptipsShow: false,
		toptipsType: '',
		resultText: '',
	},

	onLoad: function() {
		if (!wx.cloud) {
			wx.redirectTo({
				url: '../chooseLib/chooseLib',
			})
			return;
		}
		wx.getSetting({
			success: res => {
				this.getUserInfo(res); // 获取用户信息
			}
		});
		this.initData();
		wx.stopPullDownRefresh();
	},
	// 数据初始化
	initData() {
		this.data.productsList.map(item => {
			item.currentPrice = priceConversion(item.currentPrice);
			return item;
		});
		this.setData({
			productsList: this.data.productsList
		})
	},
	// 获取用户信息
	getUserInfo: function(res) {
		if (res.authSetting['scope.userInfo']) { // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
			wx.getUserInfo({
				success: res => {
					// console.log(res, 'me')
					this.setData({
						logged: true,
						avatarUrl: res.userInfo.avatarUrl,
						userInfo: res.userInfo
					})
				}
			})
		}
	},
	// 点击头像获取用户信息
	onGetUserInfo: function(e) {
		if (!this.data.logged && e.detail.userInfo) {
			this.setData({
				logged: true,
				avatarUrl: e.detail.userInfo.avatarUrl,
				userInfo: e.detail.userInfo
			})
			wx.showModal({
				title: '',
				content: `欢迎您，${e.detail.userInfo.nickName}`,
				showCancel: false,
				confirmText: '退下~'
			});
		} else {
			wx.showModal({
				title: '',
				content: `你好呀，${e.detail.userInfo.nickName}`,
				showCancel: false,
				confirmText: '你好~'
			});
		}
	},
	// 获取用户openid
	// onGetOpenid: function () {
	// 	wx.showLoading({
	// 		title: '请稍后...',
	// 	})
	// 	// 调用云函数
	// 	wx.cloud.callFunction({
	// 		name: 'login',
	// 		data: {},
	// 		success: res => {
	// 			wx.hideLoading();
	// 			console.log('[云函数] [login] user openid: ', res.result.openid)
	// 			app.globalData.openid = res.result.openid
	// 			wx.navigateTo({
	// 				url: '../userConsole/userConsole',
	// 			})
	// 		},
	// 		fail: err => {
	// 			console.error('[云函数] [login] 调用失败', err)
	// 			wx.navigateTo({
	// 				url: '../deployFunctions/deployFunctions',
	// 			})
	// 		}
	// 	})
	// },
	// 上传图片
	doUpload: function () {
		if(!this.data.logged) { // 未登录
			wx.showModal({
				title: '提示',
				content: '您未登录，请点击头像进行登录',
				showCancel: false,
				confirmText: '我知道啦'
			});
			return;
		}
		wx.chooseImage({ // 选择图片
			count: 9,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				wx.showLoading({ title: '努力传输中' });
				const filePathArr = []; // 传给下一个页面的文件路径
				const imgSecCheckArr = [];
				const len = res.tempFilePaths.length;
				res.tempFilePaths.forEach((item, index) => {
					filePathArr.push(item);
					wx.cloud.uploadFile({ // 上传文件
						cloudPath: 'temp/' + new Date().getTime() + "-me-" + Math.floor(Math.random() * 1000),
						filePath: item,
						success: res => {
							const fileID = res.fileID;
							wx.cloud.callFunction({ // 图片安全检查
								name: 'imgSecCheck',
								data: { img: fileID },
							}).then(res => {
								console.log(res, 'img check')
								imgSecCheckArr.push(res);
								if(len == index + 1) {
									if(imgSecCheckArr.every(item => item.result.errCode == 0)) { // 通过
										wx.hideLoading();
										wx.navigateTo({
											url: '../postProduct/postProduct',
											success: function(result) {
												result.eventChannel.emit('sendImage', {filePath: filePathArr})
											}
										});
									} else if(imgSecCheckArr.some(item => item.result.errCode == 87014)) { // 未通过
										wx.hideLoading();
										this.setData({
											resultText: '不得上传违法违规内容，请重新选择！',
											toptipsShow: true,
											toptipsType: 'error',
										});
									} else {
										wx.hideLoading();
										this.setData({
											resultText: '上传失败，请稍后再试！',
                      toptipsShow: true,
                      toptipsType: 'info',
										});
									}
								}
							}).catch(e => {
								console.log(e, 'imgSecCheck fail');
								wx.hideLoading();
							})
						},
						fail: e => {
							console.log(e, 'uploadfile fail');
							wx.hideLoading();
							wx.showToast({
								title: '上传失败',
								icon: 'error'
							});
						}
					})
				});
			},
			fail: e => {
				console.error(e)
			}
		})
	},
	// 下拉刷新
	onPullDownRefresh: function() {
		this.onLoad();
		console.log(2222)
	},
	// 收藏 购买 评价
	toMineItemDetail: function(e) {
		console.log('e', e);
	},
	// 商品预览
	preview(e) {
		console.log(e, 'preview')
		if(!e.currentTarget.dataset.item.isOff) {
			wx.navigateTo({
				url: '../productDetail/productDetail',
				success: function(res) {
					res.eventChannel.emit('toProductDetail', {id: e.currentTarget.dataset.item._id, from: 'me'})
				}
			});	
		} else {
			wx.showActionSheet({
				itemList: ['编辑', '重新上架', '删除'],
				success: res => {
					console.log(res, '---')
					if(res.tapIndex === 0) {
						const params = JSON.stringify(e.currentTarget.dataset.item);
						wx.navigateTo({
							url: '../postProduct/postProduct?params=' + params,
						});
					} else if(res.tapIndex === 1) {
						wx.showModal({
							title: '',
							content: '确定重新上架吗？',
							success: res => {
								console.log(res, '上架')
								if(res.confirm) {
									this.data.productsList.map(item => {
										item.isOff = !e.currentTarget.dataset.item.isOff;
										return item;
									});
									this.setData({
										productsList: this.data.productsList
									})
									wx.showToast({
										title: '上架成功',
									})
								}
							}
						})
					} else if(res.tapIndex === 2) {
						wx.showModal({
							title: '',
							content: '确定要删除该商品吗？',
							confirmText: '删除',
							confirmColor: '#f00',
							success: res => {
								console.log(res)
								if(res.confirm) {
									wx.showToast({
										title: '删除成功',
									})
								}
							}
						})
					}
				}
			})
		}
	},
	// 降价
	priceReduction(e) {
		console.log(e, 'priceReduction')
		if(!e.currentTarget.dataset.item.isOff) {
			this.setData({
				dialogImg: e.currentTarget.dataset.item.displayImg,
				currentPrice: e.currentTarget.dataset.item.currentPrice,
				dialogShow: true,
			});	
		}
	},
	// 更多 -- 删除 下架
	more(e) {
		console.log(e, 'more')
		if(!e.currentTarget.dataset.item.isOff) {
			wx.showActionSheet({
				itemList: ['下架', '删除'],
				success: (res) => {
					console.log(res, 'success')
					if(res.tapIndex === 0) {
						wx.showModal({
							title: '确定要下架吗？',
							content: '商品下架后可以再次上架！',
							success: (res) => {
								console.log(res)
								if(res.confirm) {
									this.data.productsList.map(item => {
										item.isOff = item.id === e.currentTarget.dataset.item.id;
										return item;
									});
									this.setData({
										productsList: this.data.productsList
									})
									wx.showToast({
										title: '下架成功',
									})
								}
							}
						})
					} else if(res.tapIndex === 1) {
						wx.showModal({
							title: '确定要删除吗？',
							content: '商品删除后不可恢复！',
							confirmColor: '#f00',
							success: (res) => {
								console.log(res)
								if(res.confirm) {
									wx.showToast({
										title: '删除成功',
									})
								}
							}
						})
					}
				}
			})	
		}
	},
	// 弹窗 -- 降价
	tapDialogButton(e) {
		if(e.detail.index) { // 确认
			if(+this.data.modifiedPrice >= 100000000) {
				this.setData({
					toptipsShow: true,
					resultText: '商品价格必须在0元与1亿元之间哦~',
					toptipsType: 'info',
				});
				return;
			}
			if(+this.data.modifiedPrice > +this.data.currentPrice) {
				this.setData({
					toptipsShow: true,
					resultText: '新的价格要小于原价格哦~',
					toptipsType: 'info',
				});
				return;
			}
		}
		this.setData({
			dialogShow: false,
			modifiedPrice: '',
		});
	},
	// input -- 输入降价后的金额
	dialogInput(e) {
		if(+e.detail.value >= 100000000) {
			this.setData({
				toptipsShow: true,
				resultText: '商品价格必须在0元与1亿元之间哦~',
				toptipsType: 'info',
			});
		}
		this.setData({
			modifiedPrice: money(e.detail.value)
		});
	},
})