// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database();
  const _ = db.command;
  const params = {};
  event.id && (params.id = event.id)
  const result = await db.collection('chatroom').where(params).get();
  console.log(result, '439isjdddddd')

  return {
    result
  }
}