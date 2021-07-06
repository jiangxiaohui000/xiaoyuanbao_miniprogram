function phoneType() {
  const systemInfo = wx.getSystemInfoSync();
  return !!(systemInfo.safeArea.top > 20); // iphone x类型的异形屏
}
module.exports = {
  phoneType
}