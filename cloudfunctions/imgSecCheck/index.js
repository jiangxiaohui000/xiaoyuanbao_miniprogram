// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const file = await cloud.downloadFile({
    fileID: event.img
  });
  try {
    const result = await cloud.openapi.security.imgSecCheck({
      media: {
        contentType: 'image/jpeg',
        value: file.fileContent
      }
    });
    // cloud.deleteFile({
    //   fileList: [event.img]
    // });
    return result;
  } catch (error) {
    return error;
  }
}