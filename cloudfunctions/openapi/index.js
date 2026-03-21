/**
 * @deprecated
 * 此云函数为 2019 年微信云开发官方模板遗留的演示代码。
 * 其中使用的 templateMessage（模板消息）API 已于 2020 年被微信废弃，
 * 现已由「订阅消息」（subscribeMessage）替代。
 * 该云函数目前无任何页面调用，保留仅供参考，请勿在新功能中使用。
 */

// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  // 已废弃，不做任何处理
  return { deprecated: true };
}
