// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  try {
    const result = await cloud.openapi.security.imgSecCheck({
      media: {
        contentType: 'image/png',
        value: Buffer.from(event.img)
      }
    });
    if(result && result.errorCode.toString() === '87014') {
      return {code: 500, msg: '内容含有违法违规内容', data: result};
    } else {
      return {code: 200, msg: '成功', data: result};
    }
  } catch (error) {
    if(error.errorCode.toString() === '87014') {
      return {code: 500, msg: '内容含有违法违规内容', data: result};
    }
    return {code: 502, msg: '调用imgSecCheck接口异常', data: error};
  }

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}