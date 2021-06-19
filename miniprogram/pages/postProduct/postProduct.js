// pages/postProduct/postProduct.js
const {money} = require('../../utils/moneyInputLimit')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    productDesc: '',
    imageList: [],
    largeImg: '',
    largeImgShow: false,
    releaseDisabled: true,
    price: '',
    originPrice: '',
    resultText: '',
    toptipsType: '',
    toptipsShow: false,
    galleryShow: false,
    imgUrls: [],
    currentImgIndex: 0,
    classifyList: [{
      value: 0,
      label: '手机电脑'
    }, {
      value: 1,
      label: '数码3C'
    }, {
      value: 2,
      label: '运动户外'
    }, {
      value: 3,
      label: '服饰鞋帽'
    }, {
      value: 4,
      label: '美妆护肤'
    }, {
      value: 5,
      label: '生活百货'
    }, {
      value: 6,
      label: '其他'
    }],
    selectedClassify: '',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let eventChannel = this.getOpenerEventChannel();
    eventChannel.on('sendImage', res => {
      if(res && res.filePath) {
        this.setData({
          imageList: res.filePath,
          imgUrls: res.filePath,
        });
      }
    });
    eventChannel.on('toEdit', res => {
      res && res.productDesc && (this.data.productDesc = res.productDesc);
      res && res.imageList && (this.data.imageList = res.imageList);
      res && res.price && (this.data.price = res.price);
      this.setData({
        productDesc: this.data.productDesc,
        imageList: this.data.imageList,
        imgUrls: this.data.imageList,
        price: this.data.price,
        releaseDisabled: !(this.data.productDesc && this.data.imageList.length && this.data.price),
      })
    });

  },
  // 上传图片
	addImage: function () {
		// 选择图片
		wx.chooseImage({
			count: 9 - this.data.imageList.length,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				wx.showLoading({ title: '上传中' });
				const filePathArr = [];
				const imgSecCheckArr = [];
				const len = res.tempFilePaths.length;
				res.tempFilePaths.forEach((item, index) => {
					filePathArr.push(item);
					wx.cloud.uploadFile({ // 上传文件
						cloudPath: 'temp/' + new Date().getTime() + "-post-" + Math.floor(Math.random() * 1000),
						filePath: item,
						success: res => {
							const fileID = res.fileID;
							wx.cloud.callFunction({ // 图片安全检查
								name: 'imgSecCheck',
								data: { img: fileID },
							}).then(res => {
								console.log(res, 'img check success')
								imgSecCheckArr.push(res);
								if(len == index + 1) {
									if(imgSecCheckArr.every(item => item.result.errCode == 0)) { // 通过
										wx.hideLoading();
                    this.data.imageList.push(...filePathArr);
                    this.setData({
                      imageList: this.data.imageList,
                      imgUrls: this.data.imageList,
                      releaseDisabled: !(this.data.productDesc && this.data.imageList.length && this.data.price),
                    })
									} else if(imgSecCheckArr.some(item => item.result.errCode == 87014)) { // 未通过
										wx.hideLoading();
										this.setData({
											resultText: '不得上传违法违规内容，请重新选择！',
                      toptipsShow: true,
                      toptipsType: 'error',
										});
									} else {
                    wx.hideLoading();
                    this.setData({
                      resultText: '上传失败，请稍后再试！',
                      toptipsShow: true,
                      toptipsType: 'info',
                    });
                  }
								}
							}).catch(e => {
								console.log(e, 'imgSecCheck fail');
								wx.hideLoading();
							})
						},
						fail: e => {
							console.log(e, 'uploadfile fail');
							wx.hideLoading();
							wx.showToast({
								title: '上传失败',
								icon: 'error'
							});
						}
					})
				});
			},
			fail: e => {
				console.error(e, 'choose img fail');
			}
		})
	},
  // 图片预览
  imgPreview(e) {
    this.setData({
      largeImg: e.currentTarget.dataset.item,
      currentImgIndex: e.currentTarget.dataset.index,
      galleryShow: true,
      // largeImgShow: true,
    })
  },
  // 关闭图片预览
  // closePreview() {
  //   this.setData({
  //     galleryShow: false
  //   })
  // },
  // 删除图片
  deleteImg(e) {
    this.data.imageList.splice(e.currentTarget.dataset.index, 1);
    this.setData({
      imageList: this.data.imageList,
      releaseDisabled: !(this.data.productDesc && this.data.imageList.length && this.data.price),
    });
  },
  // 商品描述--确认输入
  textareaConfirm(e) {
    this.setData({
      productDesc: e.detail.value,
      releaseDisabled: !(e.detail.value && this.data.imageList.length && this.data.price),
    })
  },
  // 商品描述--输入中
  textareaInput(e) {
    this.setData({
      productDesc: e.detail.value,
    });
    if(e.detail.value.length == 300) {
      this.setData({
        toptipsShow: true,
        resultText: '已经到达输入字数限制！',
        toptipsType: 'info',
      })
    }
  },
  // 输入价格
  priceInput(e) {
    this.setData({
      price: money(e.detail.value),
      releaseDisabled: !(this.data.productDesc && this.data.imageList.length && money(e.detail.value)),
    })
  },
  // 输入入手价格
  originPriceInput(e) {
    this.setData({
      originPrice: money(e.detail.value),
    })
  },
  // 选择分类
  chooseClassify(e) {
    this.setData({
      selectedClassify: e.currentTarget.dataset.item.value
    })
  },
  // 发布
  releaseProduct() {
    if(this.data.productDesc && this.data.imageList.length && this.data.price) {
      wx.showLoading({ title: '发布中' });
      wx.cloud.callFunction({
        name: 'msgSecCheck',
        data: { content: this.data.productDesc }
      }).then(res => {
        wx.hideLoading();
        const { errCode } = res.result;
        if(errCode == 0) {
          const params = {
            productDesc: this.data.productDesc,
            imageList: this.data.imageList,
            price: this.data.price,
            originPrice: this.data.originPrice,
          }
          wx.showToast({
            title: '发布成功',
          })
        } else if(errCode == 87014) {
          this.setData({
            resultText: '不得发布违法违规内容，请重新输入！',
            toptipsShow: true,
            toptipsType: 'error',
          });
        }
      }).catch(e => {
        console.log(e, 'msgSecCheck fail')
        wx.hideLoading();
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})