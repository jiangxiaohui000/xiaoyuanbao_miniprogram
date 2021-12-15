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
		},
		// {
		// 	value: 2,
		// 	label: '购买',
		// 	icon: 'gouwujianying',
		// 	num: 0
		// }, {
		// 	value: 3,
		// 	label: '评价',
		// 	icon: 'pingjia',
		// 	num: 0
		// }
		],
		dialogShow: false,
		dialogImg: '',
		currentPrice: '',
		modifiedPrice: '',
		toptipsShow: false,
		toptipsType: '',
		resultText: '',
    pageData: {
      pageSize: 20,
      currentPage: 1,
    },
		showLoading: false,
		openid: '',
		authorizationApplicationDialogShow: false,
		hasUserInfo: false,
		currentDataId: '',
		isOwn: '0',
		tempFilePaths: [], // 图片临时文件
		fileIdArr: [], // 传给发布页面的文件ID
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
		openid && (this.data.openid = openid);
		!openid && this.login(); // 微信账号登录
		if(this.data.openid) { // 已登录
			this.data.userInfo.nickName = this.data.hasUserInfo ? wx.getStorageSync('nickName') : '微信用户';
			this.data.userInfo.avatarUrl = this.data.hasUserInfo ? wx.getStorageSync('avatarUrl') : '../../images/user-unlogin.png';
			this.setData({
				userInfo: this.data.userInfo,
				authorizationApplicationDialogShow: !this.data.hasUserInfo,
			});
			wx.showLoading({ title: '加载中...' });
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
		this.data.pageData.currentPage = 1;
		this.data.productsList = [];
		if(currPage.data.postSuccess) { // 发布商品
			wx.showLoading();
			this.getReleasedData();
		} else if(currPage.data.isResold) { // 重新卖
			wx.showLoading();
			this.getReleasedData();
			this.getSoldData();
		}
		wx.disableAlertBeforeUnload();
	},
	// 数据初始化
	initData() {
		const promise1 = wx.cloud.callFunction({ // 列表展示的
			name: 'getProductsData',
			data: {
				pageData: this.data.pageData,
				uid: this.data.openid,
				isSold: '0',
				isDeleted: '0',
			}
		});
		const promise2 = wx.cloud.callFunction({ // 卖出的
			name: 'getProductsData',
			data: {
				uid: this.data.openid,
				isSold: '1',
				isDeleted: '0',
			}
		});
		const promise3 = wx.cloud.callFunction({ // 收藏的
			name: 'getUserData',
			data: {
				uid: this.data.openid,
			}
		});
		Promise.all([promise1, promise2, promise3]).then(res => {
			console.log(res, 'me_init_data');
			wx.hideLoading();
			wx.stopPullDownRefresh();
			if(res && res.length) {
				const data1 = res[0];
				const data2 = res[1];
				const data3 = res[2];
				if(data1 && data1.result && data1.result.data && data1.result.data.data && data1.result.count && data1.result.count.total) { // 发布的商品
					const data = data1.result.data.data;
					const total = data1.result.count.total;
					data.map(item => {
						item.currentPrice = priceConversion(item.currentPrice);
						item.displayImg = item.img[0];
						item.isOwn = item.uid == this.data.openid ? '1' : '0';
						return item;
					});
					this.setData({
						productsList: [...this.data.productsList, ...data],
						postNum: total,
            showLoading: !!data.length,
					});
				}
			  if(data2 && data2.result && data2.result.count) { // 卖出的商品
					const total = data2.result.count.total;
					this.data.mineItems[0].num = total;
					this.setData({
						mineItems: this.data.mineItems,
					});
				}
				if(data3 && data3.result && data3.result.data && data3.result.data.length) { // 收藏的
					const collectedProducts = data3.result.data[0].collectedProducts;
					this.data.mineItems[1].num = collectedProducts.length;
					this.setData({
						mineItems: this.data.mineItems,
					});
				}
			}
		}).catch(e => {
			console.log(e);
			wx.hideLoading();
			wx.stopPullDownRefresh();
			wx.showToast({
        title: '服务繁忙，请稍后再试~',
        icon: 'none',
      });
		});
	},
	// 获取发布的数据
	getReleasedData() {
		wx.cloud.callFunction({
			name: 'getProductsData',
			data: {
				pageData: this.data.pageData,
				uid: this.data.openid,
				isSold: '0',
				isDeleted: '0',
			}
		}).then(data1 => {
			console.log(data1, 'data1')
			wx.hideLoading();
			if(data1 && data1.result && data1.result.data && data1.result.data.data && data1.result.count && data1.result.count.total) { // 发布的商品
				const data = data1.result.data.data;
				const total = data1.result.count.total;
				data.map(item => {
					item.currentPrice = priceConversion(item.currentPrice);
					item.displayImg = item.img[0];
					item.isOwn = item.uid == this.data.openid ? '1' : '0';
					return item;
				});
				this.setData({
					productsList: [...this.data.productsList, ...data],
					postNum: total,
					showLoading: !!data.length,
				});
			}
		});
	},
	// 获取卖出的数据
	getSoldData() {
		wx.cloud.callFunction({ // 卖出的
			name: 'getProductsData',
			data: {
				uid: this.data.openid,
				isSold: '1',
				isDeleted: '0',
			}
		}).then(data2 => {
			console.log(data2, 'data2')
			wx.hideLoading();
			if(data2 && data2.result && data2.result.count) { // 卖出的商品
				const total = data2.result.count.total;
				this.data.mineItems[0].num = total;
				this.setData({
					mineItems: this.data.mineItems,
				});
			}
		});
	},
	// 获取收藏的数据
	getCollectedData() {
		wx.cloud.callFunction({ // 收藏的
			name: 'getUserData',
			data: {
				uid: this.data.openid,
			}
		}).then(data3 => {
			console.log(data3, 'data3')
			wx.hideLoading();
			if(data3 && data3.result && data3.result.data && data3.result.data.length) {
				const collectedProducts = data3.result.data[0].collectedProducts;
				this.data.mineItems[1].num = collectedProducts.length;
				this.setData({
					mineItems: this.data.mineItems,
				});
			}
		});
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
				wx.showToast({
					title: '登录成功',
					icon: 'success',
				});
				wx.showLoading();
				this.initData();
				const timer = setTimeout(() => { // 然后判断当前有没有拿到真实的用户信息
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
				clearTimeout(timer);
			}
		}
	},
	// 获取用户信息(nickName avatarUrl)
	onGetUserInfo() {
		if(!this.data.hasUserInfo) {
			wx.getUserProfile({
				desc: '用于展示用户信息',
				success: res => {
					if(res && res.userInfo) {
						let avatarUrl = res.userInfo.avatarUrl;
						const nickName = res.userInfo.nickName;
						avatarUrl = avatarUrl.split("/")
						avatarUrl[avatarUrl.length - 1] = 0;
						avatarUrl = avatarUrl.join('/');
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
						title: '服务繁忙，请稍后再试~',
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
			this.data.userInfo.nickName = this.data.openid ? '微信用户' : '点击登录';
			this.setData({
				userInfo: this.data.userInfo,
			})
		}
	},
	// 上传图片
	doUpload: function () {
		if(!this.data.openid) { // 未登录，提示登录
			wx.showModal({
				title: '未登录',
				content: '点击左侧登录按钮，登录后继续发布',
				showCancel: false,
				confirmText: '我知道了'
			});
			return;
		}
		wx.chooseImage({ // 1 选择图片
			count: 9,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: res => {
				console.log(res, 'chooseImage-res')
				const imgSecCheckArr = []; // 图片安全检查结果
				const tempFiles = res.tempFiles; // 临时文件（包含临时文件路径和大小）
				const tempFilesLength = res.tempFiles.length; // 临时文件数量
				this.data.tempFilePaths = res.tempFilePaths; // 临时文件路径
				if(tempFiles.some(item => item.size / 1024 / 1024 > 3)) {
					this.setData({
						toptipsShow: true,
						resultText: '图片大小不得超过 5MB，请重新选择',
						toptipsType: 'info',
					});
					return;
				}
				wx.showLoading({
					title: '请稍候...',
					mask: true,
				});
				tempFiles.forEach((item, index) => { // 遍历临时文件数组，将每一个数据进行安全检查
					const size = item.size;
					const path = item.path;
					if(size / 1024 / 1024 > 1) { // 图片大小超过1M，压缩后再进行安全检查
						console.log('图片大于1M')
						wx.compressImage({ src: path,	quality: 20 }).then(compressResult => {
							const handledPath = compressResult.tempFilePath;
							this.imgSecCheck(handledPath, imgSecCheckArr, tempFilesLength, index);
						})
					} else { // 图片大小小于1M，直接进行安全检查
						console.log('图片小于1M');
						this.imgSecCheck(path, imgSecCheckArr, tempFilesLength, index);
					}
				});
			},
			fail: e => {
				console.error(e);
				// wx.showToast({
				// 	title: '未获取到有效图片，请再试一次',
				// 	icon: 'none'
				// });
			}
		})
	},
	// 图片安全检查
	imgSecCheck(filePath, imgSecCheckArr, tempFilesLength, index) {
		wx.cloud.callFunction({ // 2 图片安全检查
			name: 'imgSecCheck',
			data: {
				imgData: wx.cloud.CDN({
					type: 'filePath',
					filePath: filePath
				})
			}
		}).then(secCheckResult => {
			console.log(secCheckResult, 'img check')
			imgSecCheckArr.push(secCheckResult); // 将检查结果放进数组
			console.log(tempFilesLength, index, imgSecCheckArr, 'len_index_imgSecCheckArr');
			if(tempFilesLength == index + 1) { // 等遍历到最后一个数据，然后检查每一个返回的结果
				if(imgSecCheckArr.every(item => item.result.errCode === 0)) { // 检查通过
					this.data.tempFilePaths.forEach((item, tempFilePaths_index1) => { // 遍历临时文件，将每一个文件上传到云存储
						this.uploadImg(item, tempFilePaths_index1, tempFilesLength); // 上传图片
					});
				} else if(imgSecCheckArr.some(item => item.result.errCode == 87014)) { // 检查未通过
					wx.hideLoading();
					this.setData({
						resultText: '不得上传违法违规内容，请重新选择！',
						toptipsShow: true,
						toptipsType: 'error',
					});
				} else { // 检查异常
					wx.hideLoading();
					wx.showToast({
						title: '服务繁忙，请稍后再试~',
						icon: 'none'
					});
				}
			}
		}).catch(e => {
			console.log(e, 'imgSecCheck fail');
			wx.hideLoading();
			wx.showToast({
				title: '服务繁忙，请稍后再试~',
				icon: 'none'
			});
		});
	},
	// 将图片上传
	uploadImg(item, tempFilePaths_index1, tempFilesLength) {
		// const uploadTask = wx.cloud.uploadFile({ // 3 上传文件
		wx.cloud.uploadFile({ // 3 上传文件
			cloudPath: 'temp/' + new Date().getTime() + "-me-" + Math.floor(Math.random() * 1000),
			filePath: item,
			success: uploadFileResult => { // 文件上传成功
				console.log(uploadFileResult, 'uploadFileResult')
				const fileID = uploadFileResult.fileID;
				this.data.fileIdArr.push(fileID);
				wx.hideLoading();
				if(tempFilesLength === tempFilePaths_index1 + 1) { // 等数据遍历结束，全部放进数组，再跳转
					const params = {
						filePath: this.data.tempFilePaths,
						fileIdArr: this.data.fileIdArr,
						userInfo: this.data.userInfo,
					}
					console.log(params, 'eventChannel-emit-params')
					wx.navigateTo({
						url: '../postProduct/postProduct',
						success: function(result) {
							result.eventChannel.emit('sendImage', params);
						}
					});
				}
			},
			fail: e => { // 文件上传失败
				console.log(e, 'uploadfile fail');
				wx.hideLoading();
				wx.showToast({
					title: '上传失败，请稍后再试~',
					icon: 'error'
				});
			}
		});
		// uploadTask.onProgressUpdate(res => {
		// 	console.log(res, '112233445555555')
		// 	wx.showLoading({
		// 		title: `已上传 ${res.progress}%`,
		// 		mask: true,
		// 	});
		// })
	},
	// 下拉刷新列表
	onPullDownRefresh: function() {
		this.data.pageData.currentPage = 1;
		this.data.productsList = [];
		wx.showLoading();
		this.initData();
	},
  // 上滑加载更多
	productScroll: function() {
    if(this.data.showLoading) {
      this.data.pageData.currentPage += 1;
      this.getReleasedData();
    }
	},
	// 商品预览
	preview(e) {
		if(!e.currentTarget.dataset.item.isOff) { // 如果商品没有下架
			wx.navigateTo({
				url: '../productDetail/productDetail',
				success: function(res) {
					res.eventChannel.emit('toProductDetail', { _id: e.currentTarget.dataset.item._id, isOwn: e.currentTarget.dataset.item.isOwn });
				}
			});	
		} else { // 商品下架了
			this.data.currentDataId = e.currentTarget.dataset.item._id;
			wx.showActionSheet({
				itemList: ['编辑', '重新上架', '删除'],
				success: res => {
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
									wx.showLoading();
									wx.cloud.callFunction({
										name: 'updateProductsData',
										data: {
											uid: this.data.openid,
											_id: this.data.currentDataId,
											isOff: '0',
										},
										success: res => {
											console.log(res, '9999999')
											wx.hideLoading();
											if(res && res.result && res.result.status && res.result.status == 200) {
												const data = res.result.data;
												this.data.productsList.forEach(item => {
													(item._id === data._id) && (item.isOff = data.isOff === '0' ? false : true);
												});
												this.setData({
													productsList: this.data.productsList,
												});
												wx.showToast({
													title: '已上架',
													icon: 'success',
												})
											}
										},
										fail: e => {
											console.log(e, 'error2')
											wx.hideLoading();
											wx.showToast({
												title: '服务繁忙，请稍后再试~',
												icon: 'none'
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
									wx.showLoading();
									wx.cloud.callFunction({
										name: 'updateProductsData',
										data: {
											uid: this.data.openid,
											_id: this.data.currentDataId,
											isDeleted: '1',
										},
										success: res => {
											console.log(res, '9038409jr')
											wx.hideLoading();
											if(res && res.result && res.result.status && res.result.status == 200) {
												this.data.pageData.currentPage = 1;
												this.data.productsList = [];
												wx.showLoading();
												this.getReleasedData();
												wx.showToast({
													title: '删除成功',
													icon: 'success',
												});
											}
										},
										fail: e => {
											console.log(e, 'error3')
											wx.hideLoading();
											wx.showToast({
												title: '服务繁忙，请稍后再试~',
												icon: 'none',
											})
										}
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
					uid: this.data.openid,
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
						wx.showToast({
							title: '已修改',
							icon: 'success',
						})
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
	// 更多 -- 卖出 下架 删除
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
											uid: this.data.openid,
											_id: this.data.currentDataId,
											isSold: '1',
										},
										success: res => {
											console.log(res, '9038409jr')
											if(res && res.result && res.result.status && res.result.status == 200) {
												this.data.pageData.currentPage = 1;
												this.data.productsList = [];
												wx.showLoading();
												this.getReleasedData();
												this.getSoldData();
												wx.showToast({
													title: '恭喜~',
													icon: 'none',
												})
											}
										},
										fail: e => {
											console.log(e, 'error1')
											wx.showToast({
												title: '服务繁忙，请稍后再试~',
												icon: 'none'
											})
										}
									})
								}
							}
						})
					} else if(res.tapIndex === 1) { // 下架
						wx.showModal({
							title: '确定要下架吗？',
							content: '商品下架后可以再次上架',
							success: res => {
								if(res.confirm) {
									wx.showLoading();
									wx.cloud.callFunction({
										name: 'updateProductsData',
										data: {
											uid: this.data.openid,
											_id: this.data.currentDataId,
											isOff: '1',
										},
										success: res => {
											console.log(res, '9999999')
											wx.hideLoading();
											if(res && res.result && res.result.status && res.result.status == 200) {
												const data = res.result.data;
												console.log(this.data.productsList, '555555')
												this.data.productsList.forEach(item => {
													(item._id === data._id) && (item.isOff = data.isOff === '1');
												});
												console.log(this.data.productsList, '444444444444')
												this.setData({
													productsList: this.data.productsList,
												});
												wx.showToast({
													title: '下架成功',
													icon: 'success',
												})
											}
										},
										fail: e => {
											console.log(e, 'error2')
											wx.hideLoading();
											wx.showToast({
												title: '服务繁忙，请稍后再试~',
												icon: 'none',
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
									wx.showLoading();
									wx.cloud.callFunction({
										name: 'updateProductsData',
										data: {
											uid: this.data.openid,
											_id: this.data.currentDataId,
											isDeleted: '1',
										},
										success: res => {
											console.log(res, '9038409jr')
											wx.hideLoading();
											if(res && res.result && res.result.status && res.result.status == 200) {
												this.data.pageData.currentPage = 1;
												this.data.productsList = [];
												wx.showLoading();
												this.getReleasedData();
												wx.showToast({
													title: '删除成功',
													icon: 'success',
												});
											}
										},
										fail: e => {
											console.log(e, 'error3')
											wx.hideLoading();
											wx.showToast({
												title: '服务繁忙，请稍后再试~',
												icon: 'none',
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
	// 卖出 收藏
	toMineItemDetail: function(e) {
		console.log('e', e);
		const targetItem = e.currentTarget.dataset.item;
		if(targetItem.value === 0) { // 卖出
			wx.navigateTo({
				url: '../soldProducts/soldProducts',
			});
		} else if(targetItem.value === 1) { // 收藏
			wx.navigateTo({
				url: '../collectedProducts/collectedProducts',
			});
		}
	},
	// 问题反馈
	feedback() {
		wx.navigateTo({
			url: '../feedback/feedback',
		});
	},
})