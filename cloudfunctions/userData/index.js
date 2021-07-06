// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event, 'user-event')
  const db = cloud.database()
  const _ = db.command
  const result = await db.collection('data_user').where({uid: event.openid}).get()
  console.log(result, 'cloud-user')
  if(!result.data.length) {
    db.collection('data_user').add({
      data: {
        uid: event.openid
      }
    })
  }

  return {
    result
  }
}