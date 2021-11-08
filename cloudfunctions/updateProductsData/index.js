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
  event.currentPrice && (data.currentPrice = +event.currentPrice);
  event.isOff && (data.isOff = Boolean(event.isOff));
  let result;
  try {
    result = await db.collection('data_products').where({ _id: event._id }).update({ data: data });  
  } catch(e) {
    console.log(e);
    result = e;
  }
  
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