// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  const _ = db.command;

  // 动态构建更新数据
  const updateData = {};

  // 支持更新收藏列表
  if (event.collectedProducts !== undefined) {
    updateData.collectedProducts = event.collectedProducts;
  }

  // 支持更新头像
  if (event.avatarUrl !== undefined) {
    updateData.avatarUrl = event.avatarUrl;
  }

  // 支持更新昵称
  if (event.nickName !== undefined) {
    updateData.nickName = event.nickName;
  }

  // 使用 openid 或 uid 查询
  const whereCondition = event.openid ? { openid: _.eq(event.openid) } : { uid: _.eq(event.uid) };

  const result = await db.collection('data_user').where(whereCondition).update({
    data: updateData
  });

  return {
    result,
  }
}