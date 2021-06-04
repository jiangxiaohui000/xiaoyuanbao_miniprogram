Component({
	data: {
		selected: 0,
		color: "#7A7E83",
		selectedColor: "#07c160",
    borderStyle: "black",
    backgroundColor: "#ffffff",
		list: [{
			pagePath: "/pages/homePage/homePage",
			iconPath: "/images/icon_home.png",
			selectedIconPath: "/images/icon_home_selected.png",
			text: "首页"
		}, {
			iconPath: "/images/icon_add.png",
			selectedIconPath: "/images/icon_add.png",
			text: ""
		}, {
			pagePath: "/pages/chat/chat",
			iconPath: "/images/icon_chat.png",
			selectedIconPath: "/images/icon_chat_selected.png",
			text: "消息"
		}]
	},
	attached() {
	},
	methods: {
		switchTab(e) {
			console.log(e, 'switchTab')
			const data = e.currentTarget.dataset;
			this.setData({
				selected: data.index
			});
			if(data.index === 1) { // 发布
				this.doUpload();
			} else { // 首页、消息tab
				const url = data.path
				wx.switchTab({ url })
			}
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
	},
})
