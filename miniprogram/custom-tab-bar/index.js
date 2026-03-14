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
			pagePath: "/pages/message/message",
			iconPath: "/images/icon_message.png",
			selectedIconPath: "/images/icon_message_selected.png",
			text: "消息"
		}, {
			pagePath: "/pages/me/me",
			iconPath: "/images/icon_me.png",
			selectedIconPath: "/images/icon_me_selected.png",
			text: "我的"
		}]
	},
	attached() {
	},
	methods: {
		switchTab(e) {
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
			// 获取app实例
			const app = getApp();
			// 选择图片
		wx.chooseMedia({
			count: 9,
			mediaType: ['image'],
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: function (res) {
				wx.showLoading({ title: '上传中...' });
				const filePath = res.tempFiles[0].tempFilePath // chooseMedia 用 tempFilePath
					// 上传图片
					const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
					wx.cloud.uploadFile({
						cloudPath,
						filePath,
						success: res => {
							app.globalData.fileID = res.fileID
							app.globalData.cloudPath = cloudPath
							app.globalData.imagePath = filePath
							wx.navigateTo({
								url: '../storageConsole/storageConsole'
							})
						},
						fail: e => {
							wx.showToast({
								title: '上传失败',
								icon: 'error',
							})
						},
						complete: () => {
							wx.hideLoading()
						}
					})
				},
				fail: e => {
				}
			})
		},
	},
})
