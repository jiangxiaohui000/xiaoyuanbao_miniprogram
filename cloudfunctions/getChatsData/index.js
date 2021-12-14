// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  const params = {};
  event.id && (params.id = event.id);
  params._openid = "{openid}";
  const result = await db.collection('data_chat').where(params).get();

  return {
    result
  }
}