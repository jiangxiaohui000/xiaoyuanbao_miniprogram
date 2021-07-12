// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  let heat = 0;
  const collectedArrLength = event.isCollected.length;
  if(collectedArrLength < 10) {
    heat = 1;
  } else if(collectedArrLength >= 10 && collectedArrLength < 20) {
    heat = 2;
  } else if(collectedArrLength >= 20 && collectedArrLength < 30) {
    heat = 3;
  } else if(collectedArrLength >= 30 && collectedArrLength < 40) {
    heat = 4;
  } else if(collectedArrLength >= 40) {
    heat = 5;
  }
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
      heat: heat,
      fineness: event.finenessTag,
      classify: event.classify,
      brand: event.brandName,
      uid: event.uid,
      avatar: event.avatar,
      nickName: event.nickName
    },
    success: res => {
      console.log(res)
    }
  })

  return {
    data
  }
}