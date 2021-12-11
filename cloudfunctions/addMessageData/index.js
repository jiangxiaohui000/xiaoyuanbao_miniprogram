// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  const result = await db.collection('data_message').where({ _id: event.groupId }).get();
  if(result && result.data && result.data.length) return;
  const addResult = await db.collection('data_message').add({
    data: {
      _id: event.groupId,
      productId: event.productId,
      nickName: event.nickName,
      avatarUrl: event.avatarUrl,
      ctime: event.ctime,
      mtime: event.mtime,
      img: event.img,
      price: event.price,
    }
  })

  return {
    addResult
  }
}