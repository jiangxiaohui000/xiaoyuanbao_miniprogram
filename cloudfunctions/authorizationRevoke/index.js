// 云函数：authorizationRevoke
// 用途：接收微信推送的用户撤回授权事件，删除该用户在数据库中的所有个人信息
// 配置：在微信公众平台 -> 开发 -> 开发设置 -> 消息推送中配置此云函数

const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  // 微信推送事件结构：event.Event === 'revoke_user_authorization'
  // event.OpenID 为撤回授权的用户 openid
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command

  // 从事件中获取 openid
  // 微信推送时 openid 在 event.OpenID 字段
  const openid = event.OpenID || event.openid || wxContext.OPENID

  if (!openid) {
    return { success: false, message: 'openid not found' }
  }

  const results = {}

  try {
    // 1. 删除 data_user 集合中该用户的记录
    const userResult = await db.collection('data_user')
      .where({ uid: openid })
      .remove()
    results.data_user = userResult.stats

    // 2. 删除 data_products 集合中该用户发布的所有商品
    const productsResult = await db.collection('data_products')
      .where({ uid: openid })
      .remove()
    results.data_products = productsResult.stats

    // 3. 处理 data_message 集合：
    //    该用户作为买家或卖家的会话，将其昵称和头像置为匿名，不直接删除（保留交易记录）
    const buyerResult = await db.collection('data_message')
      .where({ buyer_uid: openid })
      .update({
        data: {
          buyer_nickName: '已注销用户',
          buyer_avatarUrl: '',
        }
      })
    results.data_message_buyer = buyerResult.stats

    const sellerResult = await db.collection('data_message')
      .where({ seller_uid: openid })
      .update({
        data: {
          seller_nickName: '已注销用户',
          seller_avatarUrl: '',
        }
      })
    results.data_message_seller = sellerResult.stats

    // 4. 删除 data_chat 集合中该用户发送的聊天记录（_openid 为微信云数据库自动记录的创建者）
    const chatResult = await db.collection('data_chat')
      .where({ _openid: openid })
      .remove()
    results.data_chat = chatResult.stats

    return {
      success: true,
      openid,
      results,
    }
  } catch (err) {
    return {
      success: false,
      openid,
      error: err.message,
      results,
    }
  }
}
