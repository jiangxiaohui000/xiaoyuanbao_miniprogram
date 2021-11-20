// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const file = await cloud.downloadFile({ // 从云存储空间下载文件
    fileID: event.fileID
  });
  try {
    const result = await cloud.openapi.security.imgSecCheck({
      media: {
        contentType: 'image/jpeg',
        value: file.fileContent // 文件内容 数据类型：Buffer
      }
    });
    return result;
  } catch (error) {
    return error;
  }
}