const app = getApp();

Page({
    data: {
        chatList: [{
            id: 1,
            name: '快乐的小甜甜',
            info: '便宜点吧，太贵了，便宜点吧，太贵了，便宜点吧，太贵了，便宜点吧，太贵了，便宜点吧，太贵了，便宜点吧，太贵了',
            img: '../../images/touxiang1.jpeg',

        }, {
            id: 2,
            name: '雨中追逐',
            info: '项目中常常有这种需要我们对溢出文本进行显示的操作，单行多行的情况都有的情况都有的情况都有的情况都有',
            img: '../../images/touxiang2.jpeg',
        }]
    },
    gotoChatItem(e) {
        console.log(e);
    }
})