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

  // 修复：用 !== undefined 判断，避免 '0' 因 falsy 而不执行赋值
  // 下架(isOff='1') / 重新上架(isOff='0')
  if (event.isOff !== undefined && event.isOff !== null && event.isOff !== '') {
    data.isOff = event.isOff === '1'; // '1'→true 下架，'0'→false 上架
  }
  // 卖出(isSold='1') / 重新卖(isSold='0')
  if (event.isSold !== undefined && event.isSold !== null && event.isSold !== '') {
    data.isSold = event.isSold === '1'; // '1'→true 已卖，'0'→false 重新卖
  }

  event.isDeleted && (data.isDeleted = event.isDeleted === '1'); // 1：删除
  event.isCollected && (data.isCollected = event.isCollected); // 收藏

  let result;
  try {
    result = await db.collection('data_products').where({ _id: _.eq(event._id), uid: _.eq(event.uid) }).update({ data: data });  
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