// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(JSON.stringify(event), 'event')
  const wxContext = cloud.getWXContext();
  try {
    const result = await cloud.openapi.security.imgSecCheck({
      media: {
        contentType: 'image/png',
        value: Buffer.from(event.img)
      }
    });
    console.log(result, 'cloud result')
    return result;
    // if(result && result.errCode == 87014) {
    //   return {code: 500, msg: '内容含有违法违规内容', data: result};
    // } else {
    //   return {code: 200, msg: '成功', data: result};
    // }
  } catch (error) {
    // if(error.errCode == 87014) {
    //   return {code: 500, msg: '内容含有违法违规内容', data: result};
    // }
    // return {code: 502, msg: '调用imgSecCheck接口异常', data: error};
    return error
  }
}