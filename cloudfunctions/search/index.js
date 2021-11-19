// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event, 'event')
  const db = cloud.database();
  let result = '';
  const params = {
    desc: db.RegExp({
      regexp: event.searchKey,
      options: 'i',
    }),
    isSold: false,
    isOff: false,
    isDeleted: false,
  };
  const count = await db.collection('data_products').where(params).count();
  await db.collection('data_products').where(params).skip((event.pageData.currentPage - 1) * event.pageData.pageSize).limit(event.pageData.pageSize).get().then(res => {
    if(res && res.data) {
      result = res.data;
    }
  }).catch(e => {
    result = e;
  });
  console.log(result, count, '4444222211')
  return {
    result,
    count,
  }
}