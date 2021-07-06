function checkNetworkStatus() {
  wx.onNetworkStatusChange((res) => {
    if(!res.isConnected) {
      wx.showModal({
        title: '您好像没有连接网络哦~\n请连接后重试',
        showCancel: false,
        confirmText: '好的'
      })
    }
  });
}

module.exports = {
  checkNetworkStatus
}