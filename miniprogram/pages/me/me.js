const app = getApp()
const { priceConversion } = require('../../utils/priceConversion');
const { money } = require('../../utils/moneyInputLimit');
const { checkNetworkStatus } = require('../../utils/checkNetworkStatus');

Page({
	data: {
		userInfo: {
			avatarUrl: '',
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
		hasUserInfo: false,
		currentDataId: '',
	},
	onLoad: function() {
		if (!wx.cloud) {
			wx.redirectTo({
				url: '../chooseLib/chooseLib',
			})
			return;
		}
		checkNetworkStatus(); // 检测网络状态
		const openid = app.globalData.openid;
		this.setData({
			openid: openid,
		});
		console.log(this.data.openid, 'openid');
		console.log(app.globalData, 'globalData');
		const avatarUrl = wx.getStorageSync('avatarUrl');
		const nickName = wx.getStorageSync('nickName');
		this.data.hasUserInfo = (!!avatarUrl && !!nickName);
		console.log(avatarUrl, nickName, this.data.hasUserInfo, 'user-info');
		openid && (this.data.openid = openid);
		!openid && this.login(); // 微信账号登录
		if(this.data.openid) { // 已登录
			this.data.userInfo.nickName = this.data.hasUserInfo ? wx.getStorageSync('nickName') : '校园宝用户';
			this.data.userInfo.avatarUrl = this.data.hasUserInfo ? wx.getStorageSync('avatarUrl') : '../../images/user-unlogin.png';
			this.setData({
				userInfo: this.data.userInfo,
				authorizationApplicationDialogShow: !this.data.hasUserInfo,
			});
			wx.showLoading();
			this.initData();
		} else { // 未登录
			this.data.userInfo.nickName = '点击登录';
			this.setData({
				userInfo: this.data.userInfo,
			});
		}
	},
	onShow() {
		const pages = getCurrentPages(); // 获取页面栈
		const currPage = pages[pages.length - 1]; // 跳转之后的页面
		if(currPage.data.postSuccess) {
			this.setData({
				productsList: [],
			});
			wx.showLoading();
			this.initData();
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
						item.displayImg = item.img[0];
						return item;
					});
					this.setData({
						productsList: [...this.data.productsList, ...data],
						postNum: total,
            showLoading: !!data.length,
					});
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
		if(!this.data.openid) { // 如果当前没有openid，才需要调用登录接口
			app.login(res => this.setData({ openid: res })); // 调用全局登录方法获取openid
			if(this.data.openid) { // 拿到openid后判断为已登录状态
				wx.setStorageSync('openid', this.data.openid);
				app.globalData.openid = this.data.openid;
				this.setData({
					openid: this.data.openid,
				});
				wx.showToast({ title: '登录成功' });
				wx.showLoading();
				this.initData();
				setTimeout(() => { // 然后判断当前有没有拿到真实的用户信息
					if(this.data.hasUserInfo) {
						this.setData({
							userInfo: this.data.userInfo,
						});
					} else {
						this.setData({
							authorizationApplicationDialogShow: true,
						});
					}
				}, 1000);
			}	
		}
	},
	// 获取用户信息(nickName / avatarUrl)
	onGetUserInfo() {
		if(!this.data.hasUserInfo) {
			wx.getUserProfile({
				desc: '用于展示用户信息',
				success: res => {
					// console.log(res, 'onGetUserInfo');
					if(res && res.userInfo) {
						let avatarUrl = res.userInfo.avatarUrl;
						const nickName = res.userInfo.nickName;
						avatarUrl = avatarUrl.split("/")
						avatarUrl[avatarUrl.length - 1] = 0;
						avatarUrl = avatarUrl.join('/');
						// console.log(avatarUrl, nickName, 'avatarUrl-nickName');
						wx.setStorageSync('avatarUrl', avatarUrl);
						wx.setStorageSync('nickName', nickName);
						this.setData({
							userInfo: res.userInfo,
							hasUserInfo: true,
						});	
					}
				},
				fail: e => {
					console.log(e, 'getUserInfo-fail');
					wx.showToast({
						title: '服务繁忙，请稍后再试...',
						icon: 'none',
					})
				},
			})
		}
	},
	// 弹窗 -- 获取授权
	tapAuthorizationButton(e) {
		this.setData({
			authorizationApplicationDialogShow: false,
		});
		if(e.detail.index) { // 授权
			this.onGetUserInfo();
		} else { // 未授权
			this.data.userInfo.nickName = this.data.openid ? '校园宝用户' : '点击登录';
			this.setData({
				userInfo: this.data.userInfo,
			})
		}
	},
	// 上传图片
	doUpload: function () {
		const _this = this;
		if(!this.data.openid) { // 未登录
			wx.showModal({
				title: '提示',
				content: '点击左侧登录按钮，登录后继续发布',
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
				wx.showLoading({ title: '努力传输中...' });
				const filePathArr = []; // 传给发布页面的文件路径
				const fileIdArr = []; // 传给发布页面的文件ID
				const imgSecCheckArr = [];
				const len = res.tempFilePaths.length;
				res.tempFilePaths.forEach((item, index) => {
					filePathArr.push(item);
					wx.cloud.uploadFile({ // 上传文件
						cloudPath: 'temp/' + new Date().getTime() + "-me-" + Math.floor(Math.random() * 1000),
						filePath: item,
						success: res => { // 文件上传成功
							const fileID = res.fileID;
							fileIdArr.push(fileID);
							wx.cloud.callFunction({ // 图片安全检查
								name: 'imgSecCheck',
								data: { img: fileID },
							}).then(res => {
								// console.log(res, 'img check')
								imgSecCheckArr.push(res);
								if(len == index + 1) {
									if(imgSecCheckArr.every(item => item.result.errCode == 0)) { // 通过
										wx.hideLoading();
										const params = {
											filePath: filePathArr,
											fileIdArr: fileIdArr,
											userInfo: _this.data.userInfo,
										}
										wx.navigateTo({
											url: '../postProduct/postProduct',
											success: function(result) {
												result.eventChannel.emit('sendImage', params);
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
						fail: e => { // 文件上传失败
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
	// 下拉刷新列表
	onPullDownRefresh: function() {
		this.setData({
			productsList: []
		});
		wx.showLoading();
		this.initData();
	},
  // 上滑加载更多
	productScroll: function() {
    if(this.data.showLoading) {
      this.data.pageData.currentPage += 1;
      this.initData();
    }
	},
	// 商品预览
	preview(e) {
		if(!e.currentTarget.dataset.item.isOff) { // 如果商品没有下架
			wx.navigateTo({
				url: '../productDetail/productDetail',
				success: function(res) {
					res.eventChannel.emit('toProductDetail', {_id: e.currentTarget.dataset.item._id, from: 'me'})
				}
			});	
		} else { // 商品下架了
			this.data.currentDataId = e.currentTarget.dataset.item._id;
			wx.showActionSheet({
				itemList: ['编辑', '重新上架', '删除'],
				success: res => {
					console.log(res, '---')
					if(res.tapIndex === 0) { // 编辑
						const params = JSON.stringify(e.currentTarget.dataset.item);
						wx.navigateTo({
							url: '../postProduct/postProduct?params=' + params,
						});
					} else if(res.tapIndex === 1) { // 重新上架
						wx.showModal({
							title: '',
							content: '确定重新上架吗？',
							success: res => {
								if(res.confirm) {
									wx.cloud.callFunction({
										name: 'updateProductsData',
										data: {
											_id: this.data.currentDataId,
											isOff: '0',
										},
										success: res => {
											console.log(res, '9999999')
											if(res && res.result && res.result.status && res.result.status == 200) {
												const data = res.result.data;
												this.data.productsList.map(item => {
													(item._id === data._id) && (item.isOff = data.isOff === '0' ? false : true);
													return item;
												});
												this.setData({
													productsList: this.data.productsList,
												});
												wx.showToast({
													title: '已上架',
												})
											}
										},
										fail: e => {
											console.log(e, 'error2')
											wx.showToast({
												title: '服务繁忙，请稍后再试',
												icon: 'error'
											})
										}
									})
								}
							}
						})
					} else if(res.tapIndex === 2) { // 删除
						wx.showModal({
							title: '确定要删除吗？',
							content: '商品删除后不可恢复',
							confirmText: '删除',
							confirmColor: '#f00',
							success: res => {
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
	// 降价--按钮
	priceReduction(e) {
		console.log(e, 'priceReduction')
		if(!e.currentTarget.dataset.item.isOff) {
			this.data.currentDataId = e.currentTarget.dataset.item._id;
			this.setData({
				dialogImg: e.currentTarget.dataset.item.displayImg,
				currentPrice: e.currentTarget.dataset.item.currentPrice,
				dialogShow: true,
			});	
		} else {
			this.preview(e);
		}
	},
	// 降价--弹窗
	tapDialogButton(e) {
		if(e.detail.index) { // 确认
			if(+this.data.modifiedPrice >= 100000000 || +this.data.modifiedPrice <= 0) {
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
			wx.cloud.callFunction({
				name: 'updateProductsData',
				data: {
					_id: this.data.currentDataId,
					currentPrice: +this.data.modifiedPrice,
				},
				success: res => {
					console.log(res, '1221');
					if(res && res.result && res.result.status && res.result.status == 200) {
						const data = res.result.data;
						this.data.productsList.map(item => {
							(item._id === data._id) && (item.currentPrice = data.currentPrice);
							return item;
						});
						this.setData({
							productsList: this.data.productsList,
						});	
					} else {
						wx.showToast({
							title: '修改失败，请稍后再试...',
							icon: 'none',
						});
					}
				},
				fail: e => {
					console.log(e, '22222')
					wx.showToast({
						title: '修改失败，请稍后再试...',
						icon: 'none',
					});
				}
			})
		}
		this.setData({
			dialogShow: false,
			modifiedPrice: '',
		});
	},
	// 更多 -- 删除 下架 卖出
	more(e) {
		console.log(e, 'more')
		if(!e.currentTarget.dataset.item.isOff) {
			this.data.currentDataId = e.currentTarget.dataset.item._id;
			wx.showActionSheet({
				itemList: ['卖出', '下架', '删除'],
				success: (res) => {
					console.log(res, 'success')
					if(res.tapIndex === 0) { // 卖出
						wx.showModal({
							title: '宝贝已经卖出？',
							content: '卖出去的宝贝要及时确认哦~',
							cancelText: '还没有',
							confirmText: '卖出去啦',
							success: res => {
								if(res.confirm) {
									wx.cloud.callFunction({
										name: 'updateProductsData',
										data: {
											_id: this.data.currentDataId,
											isSold: '1',
										},
										success: res => {
											console.log(res, '9038409jr')
											if(res && res.result && res.result.status && res.result.status == 200) {
												const data = res.result.data;
												this.data.productsList.map(item => {
													(item._id === data._id) && (item.isSold = data.isSold === '1');
													return item;
												});
												this.setData({
													productsList: this.data.productsList,
												});
												wx.showToast({
													title: '恭喜',
												})
											}
										},
										fail: e => {
											console.log(e, 'error1')
										}
									})
								}
							}
						})
					} else if(res.tapIndex === 1) { // 下架
						wx.showModal({
							title: '确定要下架吗？',
							content: '商品下架后可以再次上架',
							success: (res) => {
								if(res.confirm) {
									wx.cloud.callFunction({
										name: 'updateProductsData',
										data: {
											_id: this.data.currentDataId,
											isOff: '1',
										},
										success: res => {
											console.log(res, '9999999')
											if(res && res.result && res.result.status && res.result.status == 200) {
												const data = res.result.data;
												this.data.productsList.map(item => {
													(item._id === data._id) && (item.isOff = data.isOff === '1');
													return item;
												});
												this.setData({
													productsList: this.data.productsList,
												});
												wx.showToast({
													title: '下架成功',
												})
											}
										},
										fail: e => {
											console.log(e, 'error2')
											wx.showToast({
												title: '服务繁忙，请稍后再试',
												icon: 'error'
											})
										}
									})
								}
							}
						})
					} else if(res.tapIndex === 2) { // 删除
						wx.showModal({
							title: '确定要删除吗？',
							content: '商品删除后不可恢复',
							confirmColor: '#f00',
							success: (res) => {
								if(res.confirm) {
									wx.cloud.callFunction({
										name: 'updateProductsData',
										data: {
											_id: this.data.currentDataId,
											isDeleted: '1',
										},
										success: res => {
											console.log(res, '9038409jr')
											if(res && res.result && res.result.status && res.result.status == 200) {
												const data = res.result.data;
												this.data.productsList.map(item => {
													(item._id === data._id) && (item.isDeleted = data.isDeleted === '1');
													return item;
												});
												this.setData({
													productsList: this.data.productsList,
												});
												wx.showToast({
													title: '删除成功',
												})
											}
										},
										fail: e => {
											console.log(e, 'error3')
											wx.showToast({
												title: '服务繁忙，请稍后再试',
												icon: 'error'
											})
										}
									})
								}
							}
						})
					}
				}
			})	
		} else {
			this.preview(e);
		}
	},
	// input -- 输入降价后的金额
	dialogInput(e) {
		if(+e.detail.value >= 100000000 || +e.detail.value <= 0) {
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
	// 收藏 购买 评价
	toMineItemDetail: function(e) {
		console.log('e', e);
	},
})