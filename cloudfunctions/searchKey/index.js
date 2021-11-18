// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  let result;
  if(event.operate === 'get') { // 查询搜索关键词
    result = await db.collection('data_search').where({uid: event.uid}).get();
  } else { // 更新搜索关键词
    const res = await db.collection('data_search').where({uid: event.uid}).get();
    console.log(res, '99990000')
    if(!res.data.length) {
      result = await db.collection('data_search').where({}).update({
        data: {
          searchKey: event.searchKey,
        }
      });  
    } else {
      result = await db.collection('data_search').where({ uid: event.uid }).update({
        data: {
          searchKey: event.searchKey,
        }
      });
    }
  }

  return {
    result
  }
}