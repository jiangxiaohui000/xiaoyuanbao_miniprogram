const app = getApp()
const { priceConversion } = require('../../utils/priceConversion');
const { money } = require('../../utils/moneyInputLimit');
const { checkNetworkStatus } = require('../../utils/checkNetworkStatus');

Page({
	data: {
		userInfo: {
			avatarUrl: '../../images/user-unlogin.png',
			nickName: '',
		},
		logged: false,
		takeSession: false,
		productsList: [],
		postNum: 0,
		mineItems: [{
			value: 0,
			label: '卖出',
			icon: 'maichu1',
			num: 0
		}, {
			value: 1,
			label: '收藏',
			icon: 'collection-b',
			num: 0
		}, {
			value: 2,
			label: '购买',
			icon: 'gouwujianying',
			num: 0
		}, {
			value: 3,
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
    pageData: {
      pageSize: 5,
      currentPage: 1
    },
		showLoading: false,
		openid: '',
		authorizationApplicationDialogShow: false,
	},

	onLoad: function() {
		if (!wx.cloud) {
			wx.redirectTo({
				url: '../chooseLib/chooseLib',
			})
			return;
		}
		checkNetworkStatus(); // 网络状态检测
		this.login();
		if(this.data.openid) { // 已登录
			this.data.userInfo.nickName = '校园宝用户';
			this.setData({
				userInfo: this.data.userInfo
			})
			if(this.data.userInfo.avatarUrl === '../../images/user-unlogin.png') {
				this.setData({
					authorizationApplicationDialogShow: true,
				})
			}
		} else {
			this.data.userInfo.nickName = '点击登录';
			this.setData({
				userInfo: this.data.userInfo
			})
		}
	},
	// 数据初始化
	initData() {
		wx.cloud.callFunction({
			name: 'getProductsData',
			data: {
				pageData: this.data.pageData,
				uid: this.data.openid,
			},
			success: res => {
				wx.hideLoading();
				wx.stopPullDownRefresh();
				if(res && res.result && res.result.data && res.result.data.data && res.result.count && res.result.count.total) {
					const data = res.result.data.data;
					const total = res.result.count.total;
					data.map(item => {
						item.currentPrice = priceConversion(item.currentPrice);
						return item;
					});
					this.setData({
						productsList: [...this.data.productsList, ...data],
						postNum: total,
            showLoading: !!data.length,
					})
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
	// 登录
	login() {
		if(!this.data.openid) {
			app.login(res => this.setData({openid: res})); // 调用全局登录方法获取openid
			if(this.data.openid) {
				wx.showToast({
					title: '登录成功',
				})
				wx.showLoading();
				this.initData();
				setTimeout(() => {
					if(this.data.userInfo.avatarUrl === '../../images/user-unlogin.png') {
						this.setData({
							authorizationApplicationDialogShow: true
						})
					} else {
						this.setData({
							userInfo: this.data.userInfo
						})	
					}
				}, 1000);
			}	
		}
	},
	// 点击头像获取用户信息
	onGetUserInfo: function() {
		wx.getUserProfile({
			desc: '用于展示用户信息',
			success: res => {
				this.setData({
					userInfo: res.userInfo
				})
			}
		})
	},
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
		this.setData({
			productsList: []
		});
		wx.showLoading();
		this.initData();
	},
  // 上滑触底
	productScroll: function() {
    if(this.data.showLoading) {
      this.data.pageData.currentPage += 1;
      this.initData();
    }
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
	// 弹窗 -- 获取授权
	tapAuthorizationButton(e) {
		this.setData({
			authorizationApplicationDialogShow: false
		});
		if(e.detail.index) { // 授权
			this.onGetUserInfo();
		} else { // 未授权
			this.data.userInfo.nickName = this.data.openid ? '校园宝用户' : '点击登录';
			this.setData({
				userInfo: this.data.userInfo
			})
		}
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