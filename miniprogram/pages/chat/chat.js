const app = getApp();

Page({
    data: {
        sysMessageTime: '10-23 13:23',
        sysMessage: '尊敬的用户，您好，感谢您注册校园宝，我们将竭诚为您服务。',
        sysMessageUnRead: true,
        chatList: [{
            id: 1,
            name: '快乐的小甜甜',
            time: '1-23 11:44',
            info: '便宜点吧，太贵了，便宜点吧，太贵了，便宜点吧，太贵了，便宜点吧，太贵了，便宜点吧，太贵了，便宜点吧，太贵了',
            img: '../../images/touxiang1.jpeg',
            hasUnreadMessage: false,

        }, {
            id: 2,
            name: '雨中追逐',
            time: '12-23 11:44',
            info: '项目中常常有这种需要我们对溢出文本进行显示的操作，单行多行的情况都有的情况都有的情况都有的情况都有',
            img: '../../images/touxiang2.jpeg',
            hasUnreadMessage: true,
        }]
    },
    gotoChatItem(e) {
        console.log(e);
    }
})