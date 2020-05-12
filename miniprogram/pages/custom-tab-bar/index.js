Component({
	data: {
		selected: 0,
		color: "#7A7E83",
		selectedColor: "#3cc51f",
		list: [{
			pagePath: "/index/index",
			iconPath: "/images/home.png",
			selectedIconPath: "/images/icon_home_selected.png",
			text: "首页"
		}, {
			pagePath: "/chat/chat",
			iconPath: "/images/icon_chat.png",
			selectedIconPath: "/images/icon_chat_selected.png",
			text: "聊天"
		}, {
			pagePath: "/me/me",
			iconPath: "/images/icon_me.png",
			selectedIconPath: "/images/icon_me_selected.png",
			text: "我的"
		}]
	},
	attached() {
	},
	methods: {
		switchTab(e) {
			const data = e.currentTarget.dataset
			const url = data.path
			wx.switchTab({ url })
			this.setData({
				selected: data.index
			})
		}
	}
})
