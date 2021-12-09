// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  const data = db.collection('data_products').add({
    data: {
      desc: event.productDesc,
      img: event.imageList,
      address: event.userAddress,
      ctime: (new Date().getTime()),
      currentPrice: event.price,
      originPrice: event.originPrice,
      isCollected: event.isCollected,
      isDeleted: event.isDeleted,
      isOff: event.isOff,
      isSold: event.isSold,
      fineness: event.finenessTag,
      classify: event.classify,
      brand: event.brandName,
      uid: event.uid,
      avatarUrl: event.avatarUrl,
      nickName: event.nickName,
      latitude: event.latitude,
      longitude: event.longitude,
      location: db.Geo.Point(+event.longitude, +event.latitude),
    }
  })

  return {
    data
  }
}