const app = getApp();
const { timeFormatter } = require('../../utils/timeFormatter');
const { checkNetworkStatus } = require('../../utils/checkNetworkStatus');

Page({
  data: {
    openid: '',
    messageList: [],
    dataIsReady: false,
  },
  onLoad() {
    checkNetworkStatus(); // 网络状态检测
    this.login();
  },
  onShow() {
    if(this.data.dataIsReady) {
      console.log(11111)
      this.initData();
    }
  },
  // 数据初始化
  initData() {
    wx.cloud.callFunction({
      name: 'getMessageData',
      data: {},
      success: res => {
        console.log(res, 'message-data')
        this.data.dataIsReady = true;
        const result = res.result.result.data;
        result.forEach(item => {
          item.handledMTime = timeFormatter(item.mtime);
        });
        this.setData({
          messageList: result,
        });
      },
      fail: e => {
        console.log(e, 'getChatsData-error');
        wx.showToast({
          title: '服务繁忙，请稍后再试~',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },
  // 登录
  login() {
    app.login(res => this.data.openid = res);
    if(this.data.openid) {
      wx.showLoading({ title: '加载中...' });
      this.initData();
      this.setData({
        openid: this.data.openid
      });
    } else {
      wx.showToast({
        title: '登录异常，请稍后再试！',
        icon: 'none',
      })
    }
  },
  // 去聊天
  gotoChatItem(e) {
    console.log(e, 'chatItem');
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/im/room/room?img=${item.img}&price=${item.price}&seller_nickName=${item.seller_nickName}&seller_avatarUrl=${item.seller_avatarUrl}&groupId=${item._id}&productId=${item._id}`,
    })
  },
  // 删除聊天
  slideDelete(e) {
    const index = this.data.messageList.findIndex(item => item._id === e.currentTarget.dataset.id);
    wx.cloud.callFunction({
      name: 'removeMessageData',
      data: {
        _id: e.currentTarget.dataset.id,
      },
      success: res => {
        console.log(res, '333333333333')
        if(res && res.result && res.result.result && res.result.result.stats && res.result.result.stats.removed) {
          this.data.messageList.splice(index, 1);
          this.setData({
            messageList: this.data.messageList
          });
          wx.showToast({
            title: '删除成功',
            icon: 'none',
          })
        }
      },
      fail: e => {
        console.log(e, 'delete-fail');
        wx.showToast({
          title: '删除失败，请稍后再试~',
          icon: 'none',
        });
      }
    })
    
  },
  // 设置 movable-view 位移
  setXMove(index, xmove) {
    this.data.messageList[index].xmove = xmove;
    this.setData({
      messageList: this.data.messageList
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
    this.initData();
	},
})