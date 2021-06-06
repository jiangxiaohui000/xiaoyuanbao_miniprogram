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
		collectionNum: 0,
		buysNum: 0,
		evaluateNum: 0,
		goodsList: [{
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
	},

	onLoad: function() {
		if (!wx.cloud) {
			wx.redirectTo({
				url: '../chooseLib/chooseLib',
			})
			return;
		}
		// 获取用户信息
		wx.getSetting({
			success: res => {
				if (res.authSetting['scope.userInfo']) {
					// 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
					wx.getUserInfo({
						success: res => {
							console.log(res, 'me')
							this.setData({
								avatarUrl: res.userInfo.avatarUrl,
								userInfo: res.userInfo
							})
						}
					})
				}
			}
		});
		wx.stopPullDownRefresh();
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
			success: function (res) {
				wx.showLoading({
					title: '上传中',
				});
				const filePath = res.tempFilePaths[0]
				// 上传图片
				const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
				wx.cloud.uploadFile({
					cloudPath,
					filePath,
					success: res => {
						console.log('[上传文件] 成功：', res)
						app.globalData.fileID = res.fileID
						app.globalData.cloudPath = cloudPath
						app.globalData.imagePath = filePath
						wx.navigateTo({
							url: '../storageConsole/storageConsole'
						})
					},
					fail: e => {
						console.error('[上传文件] 失败：', e)
						wx.showToast({
							icon: 'none',
							title: '上传失败',
						})
					},
					complete: () => {
						wx.hideLoading()
					}
				})
			},
			fail: e => {
				console.error(e)
			}
		})
	},
	// 下拉刷新
	onPullDownRefresh: function() {
		console.log('me');
		this.onLoad();
	},
	// 我的宝贝
	goToGoodsDetail: function() {
		console.log('goods');
	},
	// 我的收藏
	goToCollectionDetail: function() {
		console.log('collection');
	},
	// 我的购买
	goToBuyDetail: () => {
		console.log('buy');
	},
	// 我的评价
	goToEvaluateDetail: () => {
		console.log('evaluate');
	}
})