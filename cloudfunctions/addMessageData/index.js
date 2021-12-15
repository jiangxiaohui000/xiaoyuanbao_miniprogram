// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event, 'event')
  const db = cloud.database();
  const result = await db.collection('data_message').where({ _id: event.groupId }).get();
  console.log(result, '1111111')
  if(result && result.data && result.data.length) return;
  const addResult = await db.collection('data_message').add({
    data: {
      _id: event.groupId,
      productId: event.productId,
      buyer_nickName: event.buyer_nickName,
      buyer_avatarUrl: event.buyer_avatarUrl,
      buyer_uid: event.buyer_uid,
      seller_nickName: event.seller_nickName,
      seller_avatarUrl: event.seller_avatarUrl,
      seller_uid: event.seller_uid,
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