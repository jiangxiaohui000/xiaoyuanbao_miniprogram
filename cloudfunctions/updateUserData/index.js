// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  const _ = db.command;
  const result = await db.collection('data_user').where({ uid: _.eq(event.uid) }).update({
    data: {
      collectedProducts: event.collectedProducts,
    }
  });

  return {
    result,
  }
}