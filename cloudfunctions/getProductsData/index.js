// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  // const wxContext = cloud.getWXContext()
  const db = cloud.database();
  const _ = db.command;
  const params = [];
  event.uid && params.push({uid: _.eq(event.uid)});
  const count = await db.collection('data_products').where(params.length ? _.and(params) : {}).count();
  const data = await db.collection('data_products')
                       .where(params.length ? _.and(params) : {})
                       .orderBy('ctime', 'desc')
                       .skip((event.pageData.currentPage - 1) * event.pageData.pageSize)
                       .limit(event.pageData.pageSize)
                       .get();
  return {
    // event,
    // openid: wxContext.OPENID,
    // appid: wxContext.APPID,
    // unionid: wxContext.UNIONID,
    data,
    count,
  }
}