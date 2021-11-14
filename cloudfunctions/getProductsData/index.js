// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  const _ = db.command;
  const params = [];
  event.uid && params.push({ uid: _.eq(event.uid) });
  event.isSold && params.push({ isSold: event.isSold === '1' });
  event.isOff && params.push({ isOff: event.isOff === '1' });
  event.isDeleted && params.push({ isDeleted: event.isDeleted === '1' });
  const count = await db.collection('data_products').where(params.length ? _.and(params) : {}).count();
  let data;
  if(event.pageData) {
    data = await db.collection('data_products')
                   .where(params.length ? _.and(params) : {})
                   .orderBy('ctime', 'desc')
                   .skip((event.pageData.currentPage - 1) * event.pageData.pageSize)
                   .limit(event.pageData.pageSize)
                   .get();  
  } else {
    data = await db.collection('data_products').where(params.length ? _.and(params) : {}).orderBy('ctime', 'desc').get();
  }
  return {
    data,
    count,
  }
}