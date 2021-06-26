const app = getApp();

Page({
  data: {
    sysMessageTime: '',
    sysMessage: '',
    sysMessageUnRead: Boolean,
    chatList: [{
      id: 1,
      name: '快乐的小甜甜',
      time: '1-23 11:44',
      info: '便宜点吧，太贵了，便宜点吧，太贵了，便宜点吧，太贵了，便宜点吧，太贵了，便宜点吧，太贵了，便宜点吧，太贵了',
      logo: '../../images/touxiang1.jpeg',
      img: '../../images/touxiang1.jpeg',
      price: '11',
      hasUnreadMessage: false,
    }, {
      id: 2,
      name: '雨中追逐',
      time: '12-23 11:44',
      info: '项目中常常有这种需要我们对溢出文本进行显示的操作，单行多行的情况都有的情况都有的情况都有的情况都有',
      logo: '../../images/touxiang2.jpeg',
      img: '../../images/touxiang2.jpeg',
      price: '11',
      hasUnreadMessage: true,
    }],
  },
  onLoad() {
    this.setData({
      sysMessageTime: '10-23 13:23',
      sysMessage: '尊敬的用户，您好，感谢您注册校园宝，我们将竭诚为您服务。',
      sysMessageUnRead: true,
    })
  },
  // 去聊天
  gotoChatItem(e) {
    console.log(e, 'chatItem');
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/im/room/room?img=${item.img}&price=${item.price}&name=${item.name}`,
    })
  },
  // 删除聊天
  slideDelete(e) {
    const index = this.data.chatList.findIndex(item => item.id === e.currentTarget.dataset.id);
    this.data.chatList.splice(index, 1);
    this.setData({
      chatList: this.data.chatList
    });
  },
  // 设置 movable-view 位移
  setXMove(index, xmove) {
    this.data.chatList[index].xmove = xmove;
    this.setData({
      chatList: this.data.chatList
    });
  },
  // 处理 movable-view 位移
  handleMovableChange(e) {
    // console.log(e, 'handleMovableChange')
    if(e.detail.source === 'friction') {
      e.detail.x < -30 ? this.showDeleteButton(e) : this.hideDeleteButton(e);
    } else if(e.detail.source === 'out-of-bounds' && e.detail.x === 0) {
      this.hideDeleteButton(e);
    }
  },
  // 处理toucestart事件
  handleTouchStart(e) {
    // console.log(e,'start')
    this.startX = e.touches[0].pageX;
  },
  // 处理touchend事件
  handleTouchEnd(e) {
    // console.log(e, 'end')
    if(e.changedTouches[0].pageX < this.startX && e.changedTouches[0].pageX - this.startX <= -30) {
      this.showDeleteButton(e);
    } else if(e.changedTouches[0].pageX > this.startX && e.changedTouches[0].pagex - this.pageX < 30) {
      this.showDeleteButton(e);
    } else {
      this.hideDeleteButton(e);
    }
  },
  // 显示删除按钮
  showDeleteButton(e) {
    const index = e.currentTarget.dataset.chatindex;
    this.setXMove(index, -70);
  },
  // 隐藏删除按钮
  hideDeleteButton(e) {
    const index = e.currentTarget.dataset.chatindex;
    this.setXMove(index, 0);
  },
	// 下拉刷新
	onPullDownRefresh() {
    console.log(3333)
    wx.stopPullDownRefresh({
      success: (res) => {},
    })
	},
})