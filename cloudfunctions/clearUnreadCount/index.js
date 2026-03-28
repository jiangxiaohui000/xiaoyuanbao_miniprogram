// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  
  // 清除指定会话的未读消息计数
  const result = await db.collection('data_message').where({ _id: event.groupId }).update({
    data: {
      unreadCount: 0,
    }
  });

  return {
    result
  }
}
