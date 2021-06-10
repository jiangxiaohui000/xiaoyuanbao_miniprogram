// pages/postProduct/postProduct.js
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
    resultText: '',
    toptipsShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let eventChannel = this.getOpenerEventChannel();
    eventChannel.on('sendImage', res => {
      res && res.filePath && this.setData({ imageList: res.filePath });
    });
    eventChannel.on('toEdit', res => {
      // console.log(res, '898989')
      res && res.productDesc && (this.data.productDesc = res.productDesc);
      res && res.imageList && (this.data.imageList = res.imageList);
      res && res.price && (this.data.price = res.price);
      this.setData({
        productDesc: this.data.productDesc,
        imageList: this.data.imageList,
        price: this.data.price,
        releaseDisabled: !this.data.productDesc || !this.data.imageList.length || !this.data.price,
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
        console.log(res, '88888999999')
				if(res && res.tempFilePaths) {
          const tempFiles = res.tempFiles;
          const overSizeData = tempFiles.filter(item => item.size > 1 * 1024 * 1024);
          if(overSizeData.length) {
            wx.showToast({
              title: '上传的单张图片大小不可以超过 1MB',
              duration: 2000
            });
            return;
          }
					wx.showLoading({ title: '上传中' });
					const promiseArr = [];
					const filePathArr = [];
					tempFiles.forEach(item => {
            // 将图片转成buffer后请求云函数
            wx.getFileSystemManager().readFile({
              filePath: item.path,
              success: res => {
                console.log(res, '101010')
                wx.cloud.callFunction({
                  name: 'imgSecCheck', // 图片安全检查
                  data: {img: res.data}
                }).then(res => {
                  console.log(res, '999')
                  // let { errCode } = res.result.data;
                  // if(errCode == 87014) {
                  //   this.setData({
                  //     resultText: '内容含有违法违规内容',
                  //     toptipsShow: true,
                  //   });
                  //   return;
                  // } else if(errCode == 0) {
                  //   const filePath = item;
                  //   // 上传图片
                  //   const cloudPath = 'produce-image' + filePath.match(/\.[^.]+?$/)[0];
                  //   promiseArr.push(this.uploadFile(cloudPath, filePath));
                  //   filePathArr.push(filePath);
                  // }
                }).catch(e => {
                  console.log(e, 'error');
                });
              }
            })
					});
					Promise.all(promiseArr).then(() => {
            this.data.imageList.push(...filePathArr);
            this.setData({
              imageList: this.data.imageList,
              releaseDisabled: !this.data.imageList.length,
            });
						wx.hideLoading();
					}).catch(e => {
						console.error('[上传文件] 失败：', e)
						wx.showToast({
							icon: 'error',
							title: '上传失败',
						});
						wx.hideLoading();
					});
				}
			},
			fail: e => {
				console.error(e)
			}
		})
	},
	// 上传文件
	uploadFile(cloudPath, filePath) {
		wx.cloud.uploadFile({
			cloudPath,
			filePath
		})
	},
  // 图片预览
  imgPreview(e) {
    this.setData({
      largeImg: e.currentTarget.dataset.item,
      largeImgShow: true,
    })
  },
  // 关闭图片预览
  closePreview() {
    this.setData({
      largeImgShow: false
    })
  },
  // 删除图片
  deleteImg(e) {
    console.log(e, 'index')
    this.data.imageList.splice(e.currentTarget.dataset.index, 1);
    this.setData({
      imageList: this.data.imageList,
      releaseDisabled: !this.data.imageList.length,
    });
  },
  // 发布
  releaseProduct() {
    if(this.data.productDesc && this.data.imageList.length) {
      console.log(this.data.productDesc, this.data.imageList)
    }
  },
  // 商品描述--确认输入
  textareaConfirm(e) {
    this.setData({
      productDesc: e.detail.value,
      releaseDisabled: !e.detail.value
    })
  },
  // 商品描述--输入中
  textareaInput(e) {
    if(e.detail.value.length == 300) {
      this.setData({
        toptipsShow: true,
        resultText: '已经到达输入字数限制！'
      })
    }
  },
  // 输入价格
  priceInput(e) {
    this.setData({
      price: e.detail.value,
      releaseDisabled: !e.detail.value,
    })
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