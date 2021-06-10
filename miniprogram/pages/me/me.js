const app = getApp()
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
      id: 1,
      img: '../../images/kouhong.jpg',
      desc: 'Lancome/兰蔻产地: 法国颜色分类: 888粉金管颜色备注保质期: 3年适合肤质: 任何肤质正常规格是否为特殊用途化妆品: 否',
      currentPrice: '111',
    }, {
      id: 2,
      img: '../../images/kouhong.jpg',
      desc: 'Lancome/兰蔻产地: 法国颜色分类: 888粉金管颜色备注保质期: 3年适合肤质: 任何肤质正常规格是否为特殊用途化妆品: 否',
      currentPrice: '33333',
    }, {
      id: 3,
      img: '../../images/kouhong.jpg',
      desc: 'Lancome/兰蔻产地: 法国颜色分类: 888粉金管颜色备注保质期: 3年适合肤质: 任何肤质正常规格是否为特殊用途化妆品: 否',
      currentPrice: '111',
    }, {
      id: 4,
      img: '../../images/kouhong.jpg',
      desc: 'Lancome/兰蔻产地: 法国颜色分类: 888粉金管颜色备注保质期: 3年适合肤质: 任何肤质正常规格是否为特殊用途化妆品: 否',
      currentPrice: '33333',
    }, {
      id: 5,
      img: '../../images/kouhong.jpg',
      desc: 'Lancome/兰蔻产地: 法国颜色分类: 888粉金管颜色备注保质期: 3年适合肤质: 任何肤质正常规格是否为特殊用途化妆品: 否',
      currentPrice: '111',
    }, {
      id: 6,
      img: '../../images/kouhong.jpg',
      desc: 'Lancome/兰蔻产地: 法国颜色分类: 888粉金管颜色备注保质期: 3年适合肤质: 任何肤质正常规格是否为特殊用途化妆品: 否',
      currentPrice: '33333',
    }, {
      id: 7,
      img: '../../images/kouhong.jpg',
      desc: 'Lancome/兰蔻产地: 法国颜色分类: 888粉金管颜色备注保质期: 3年适合肤质: 任何肤质正常规格是否为特殊用途化妆品: 否',
      currentPrice: '111',
    }, {
      id: 8,
      img: '../../images/kouhong.jpg',
      desc: 'Lancome/兰蔻产地: 法国颜色分类: 888粉金管颜色备注保质期: 3年适合肤质: 任何肤质正常规格是否为特殊用途化妆品: 否',
      currentPrice: '33333',
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
		wx.stopPullDownRefresh();
	},
	// 获取用户信息
	getUserInfo: function(res) {
		if (res.authSetting['scope.userInfo']) { // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
			wx.getUserInfo({
				success: res => {
					// console.log(res, 'me')
					this.setData({
						avatarUrl: res.userInfo.avatarUrl,
						userInfo: res.userInfo
					})
				}
			})
		}
	},
	onGetUserInfo: function(e) {
		if (!this.logged && e.detail.userInfo) {
			this.setData({
				logged: true,
				avatarUrl: e.detail.userInfo.avatarUrl,
				userInfo: e.detail.userInfo
			})
		}
	},
	onGetOpenid: function () {
		wx.showLoading({
			title: '请稍后...',
		})
		// 调用云函数
		wx.cloud.callFunction({
			name: 'login',
			data: {},
			success: res => {
				wx.hideLoading();
				console.log('[云函数] [login] user openid: ', res.result.openid)
				app.globalData.openid = res.result.openid
				wx.navigateTo({
					url: '../userConsole/userConsole',
				})
			},
			fail: err => {
				console.error('[云函数] [login] 调用失败', err)
				wx.navigateTo({
					url: '../deployFunctions/deployFunctions',
				})
			}
		})
	},
	// 上传图片
	doUpload: function () {
		// 选择图片
		wx.chooseImage({
			count: 9,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				if(res && res.tempFilePaths) {
					wx.showLoading({
						title: '上传中',
					});
					const promiseArr = [];
					const filePathArr = [];
					res.tempFilePaths.forEach(item => {
						const filePath = item;
						// 上传图片
						const cloudPath = 'produce-image' + filePath.match(/\.[^.]+?$/)[0];
						promiseArr.push(this.uploadFile(cloudPath, filePath));
						filePathArr.push(filePath);
					});
					Promise.all(promiseArr).then(() => {
						wx.navigateTo({
							url: '../postProduct/postProduct',
							success: function(result) {
								result.eventChannel.emit('sendImage', {filePath: filePathArr})
							}
						});
						wx.hideLoading();
					}).catch(e => {
						console.error('[上传文件] 失败：', e)
						wx.showToast({
							icon: 'error',
							title: '上传失败',
						});
						wx.hideLoading();
					});
				}
			},
			fail: e => {
				console.error(e)
			}
		})
	},
	// 上传文件
	uploadFile(cloudPath, filePath) {
		wx.cloud.uploadFile({
			cloudPath,
			filePath
		})
	},
	// 下拉刷新
	onPullDownRefresh: function() {
		this.onLoad();
	},
	// 详情
	toMineItemDetail: function(e) {
		console.log('e', e);
	},
	// 商品预览
	preview(e) {
		console.log(e, 'preview')
		wx.navigateTo({
      url: '../productDetail/productDetail',
      success: function(res) {
        res.eventChannel.emit('toProductDetail', {id: e.currentTarget.dataset.item.id, from: 'me'})
      }
    });
	},
	// 编辑
	// editGood(e) {
	// 	console.log(e, 'edit')
	// },
	// 降价
	priceReduction(e) {
		console.log(e, 'priceReduction')
		this.setData({
			dialogImg: e.currentTarget.dataset.item.img,
			currentPrice: e.currentTarget.dataset.item.currentPrice,
			dialogShow: true,
		});
	},
	// 更多
	// more(e) {
	// 	console.log(e, 'more')
	// },
	// 弹窗
	tapDialogButton(e) {
		if(e.detail.index) { // 确认
			if(+this.data.modifiedPrice > +this.data.currentPrice) {
				this.setData({
					toptipsShow: true,
					resultText: '新的价格要小于原价格哦~'
				});
				return;
			}
		}
		this.setData({
			dialogShow: false,
			modifiedPrice: '',
		});
	},
	dialogInput(e) {
		this.setData({
			modifiedPrice: e.detail.value
		})
	},
})