function phoneType() {
  const windowInfo = wx.getWindowInfo();
  return !!(windowInfo.safeArea && windowInfo.safeArea.top > 20); // iphone x类型的异形屏
}
module.exports = {
  phoneType
}