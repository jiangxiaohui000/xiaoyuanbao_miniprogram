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
			const url = data.path;
			wx.switchTab({ url });
		},
	},
})
