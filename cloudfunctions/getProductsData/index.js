// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event, 'event')
  const db = cloud.database();
  const _ = db.command;
  const params = [];
  event.uid && params.push({ uid: _.eq(event.uid) });
  event.isSold && params.push({ isSold: event.isSold === '1' });
  event.isOff && params.push({ isOff: event.isOff === '1' });
  event.isDeleted && params.push({ isDeleted: event.isDeleted === '1' });
  if(event.userLatitude && event.userLongitude) {
    const param = {
      location: _.geoNear({ geometry: db.Geo.Point(+event.userLongitude, +event.userLatitude), minDistance: 0, maxDistance: 500 })
    }
    params.push(param);
  }
  if(event._id) {
    if(typeof event._id === 'string') {
      params.push({ _id: event._id });
    } else {
      event._id.forEach(item => {
        params.push({ _id: item });
      })
    }
  }
  const useCommand = event.useCommand ? event.useCommand : 'and';
  console.log(params, 'params')
  const order_key = event.orderKey ? event.orderKey : 'ctime';
  const order_value = event.orderValue ? event.orderValue : 'desc';
  const count = await db.collection('data_products').where(params.length ? _[useCommand](params) : {}).count();
  let data;
  if(event.pageData) {
    data = await db.collection('data_products')
                   .where(params.length ? _[useCommand](params) : {})
                   .orderBy(order_key, order_value)
                   .skip((event.pageData.currentPage - 1) * event.pageData.pageSize)
                   .limit(event.pageData.pageSize)
                   .get();  
  } else {
    data = await db.collection('data_products').where(params.length ? _[useCommand](params) : {}).orderBy(order_key, order_value).get();
  }
  console.log(data, 'data')
  return {
    data,
    count,
  }
}