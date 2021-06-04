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
			console.log(e, '3333')
			const data = e.currentTarget.dataset;
			if(data.index === 1) {
				console.log(11111)
			} else {
				const url = data.path
				wx.switchTab({ url })
			}
			this.setData({
				selected: data.index
			})
		}
	},
})
