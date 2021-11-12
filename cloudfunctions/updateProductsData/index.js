// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  const _ = db.command;
  const data = {};
  event.currentPrice && (data.currentPrice = +event.currentPrice); // 降价
  event.isOff && (data.isOff = event.isOff === '1'); // 下架
  event.isSold && (data.isSold = event.isSold === '1'); // 卖出
  event.isDeleted && (data.isDeleted = event.isDeleted === '1'); // 删除
  console.log(event, '111222')
  console.log(data, '111333')
  let result;
  try {
    result = await db.collection('data_products').where({ _id: event._id }).update({ data: data });  
  } catch(e) {
    console.log(e);
    result = e;
  }
  console.log(result, '444444333')
  if(result && result.stats && result.stats.updated) {
    return {
      status: 200,
      errMsg: 'ok',
      data: event,
    }
  } else {
    return {
      errMsg: result,
    }
  }
}