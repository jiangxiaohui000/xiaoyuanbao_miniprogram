// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  const result = await db.collection('data_message').where({ _id: event.groupId }).get();

  if (result && result.data && result.data.length) {
    // 会话已存在：更新最后消息时间（mtime），保证消息列表时间戳始终是最新的
    await db.collection('data_message').where({ _id: event.groupId }).update({
      data: {
        mtime: event.mtime,
      }
    });
    return { updated: true };
  }

  // 会话不存在：新建会话记录
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
  });

  return {
    addResult
  }
}