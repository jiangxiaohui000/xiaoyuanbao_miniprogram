// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {

  const db = cloud.database();
  const result = await db.collection('data_feedback').add({
    data: {
      content: event.content,
      contactInformation: event.contactInformation,
      openid: event.uid,
    }
  })

  return {
    result,
  }
}