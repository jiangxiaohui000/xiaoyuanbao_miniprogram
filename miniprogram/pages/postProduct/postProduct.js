// pages/postProduct/postProduct.js
const app = getApp();
const { money } = require('../../utils/moneyInputLimit');
const QQMapWX = require('../../utils/qqmap-wx-jssdk.js'); // 引入腾讯位置服务

Page({
  data: {
    productDesc: '',
    imageList: [],
    releaseDisabled: true, // 商品描述，图片，价格是必填的，其他选填
    price: '',
    originPrice: '',
    resultText: '',
    toptipsType: '',
    toptipsShow: false,
    galleryShow: false,
    imgUrls: [], // 图片预览
    currentImgIndex: 0,
    classifyList: [{
      value: 0,
      label: '手机'
    }, {
      value: 1,
      label: '电脑'
    }, {
      value: 2,
      label: '数码3C'
    }, {
      value: 3,
      label: '运动户外'
    }, {
      value: 4,
      label: '服饰鞋帽'
    }, {
      value: 5,
      label: '美妆护肤'
    }, {
      value: 6,
      label: '生活百货'
    }, {
      value: 7,
      label: '其他'
    }],
    selectedClassify: '',
    finenessTagList: [{
      value: 0,
      label: '全新'
    }, {
      value: 1,
      label: '几乎全新'
    }, {
      value: 2,
      label: '轻微使用痕迹'
    }, {
      value: 3,
      label: '明显使用痕迹'
    }],
    selectedTag: '',
    brandName: '',
    brandTagShow: false,
    userAddress: '',
    userInfo: '',
    fileIdArr: [],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options && options.params) {
      const params = JSON.parse(options.params);
      this.data.productDesc = params.desc || '';
      this.data.imageList = params.img || [];
      this.data.price = params.currentPrice || '';
      this.data.originPrice = params.originPrice || '';
      this.setData({
        productDesc: this.data.productDesc,
        imageList: this.data.imageList,
        imgUrls: this.data.imageList,
        price: this.data.price,
        originPrice: this.data.originPrice,
        releaseDisabled: !(this.data.productDesc && this.data.imageList.length && this.data.price),
      })
    }
    let eventChannel = this.getOpenerEventChannel();
    // 发布
    eventChannel.on('sendImage', res => {
      if(res && res.filePath) {
        this.setData({
          imageList: res.filePath,
          imgUrls: res.filePath,
        });
      }
      res && res.userInfo && (this.data.userInfo = res.userInfo);
      res && res.fileIdArr && (this.data.fileIdArr = res.fileIdArr);
    });
    // 编辑
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
    const _this = this;
    wx.getSetting({
      success: res => {
        this.getUserLocation(res, _this); // 获取用户位置信息
      }
    });
  },
  // 上传图片
	addImage: function () {
		wx.chooseImage({ // 1,选择图片
			count: 9 - this.data.imageList.length,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: res => {
				wx.showLoading({ title: '请稍候...' });
        const filePathArr = [];
        const fileIdArr = [];
				const imgSecCheckArr = [];
        const len = res.tempFilePaths.length;
				res.tempFilePaths.forEach((item, index) => {
					filePathArr.push(item);
					wx.cloud.uploadFile({ // 2,上传文件
						cloudPath: 'temp/' + new Date().getTime() + "-post-" + Math.floor(Math.random() * 1000),
						filePath: item,
						success: res => {
              const fileID = res.fileID;
              fileIdArr.push(fileID);
							wx.showLoading({ title: '正在传输...' });
							wx.cloud.callFunction({ // 3,图片安全检查
								name: 'imgSecCheck',
								data: { fileID: fileID },
							}).then(res => {
								console.log(res, 'img check success')
								imgSecCheckArr.push(res);
								if(len == index + 1) {
									if(imgSecCheckArr.every(item => item.result.errCode == 0)) { // 检查通过
										wx.hideLoading();
                    this.data.imageList.push(...filePathArr);
                    this.data.fileIdArr.push(...fileIdArr);
                    this.setData({
                      imageList: this.data.imageList,
                      imgUrls: this.data.imageList,
                      releaseDisabled: !(this.data.productDesc && this.data.imageList.length && this.data.price),
                    })
									} else if(imgSecCheckArr.some(item => item.result.errCode == 87014)) { // 检查未通过
										wx.hideLoading();
										this.setData({
											resultText: '不得上传违法违规内容，请重新选择！',
                      toptipsShow: true,
                      toptipsType: 'error',
										});
									} else {
                    wx.hideLoading();
                    this.setData({
                      resultText: '上传失败，请重试！',
                      toptipsShow: true,
                      toptipsType: 'error',
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
								title: '上传失败，请再试一次',
								icon: 'none'
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
    wx.showLoading({ title: '正在打开' });
    this.setData({
      currentImgIndex: e.currentTarget.dataset.index,
    });
    const timer = setTimeout(() => {
      wx.hideLoading();
      this.setData({
        galleryShow: true,
      });
      clearTimeout(timer);
    }, 500);
  },
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
  // 输入当前价格
  priceInput(e) {
    if(+e.detail.value >= 100000000) {
      this.setData({
        toptipsShow: true,
        resultText: '商品价格必须在0元与1亿元之间哦~',
        toptipsType: 'info',
      });
    }
    this.setData({
      price: money(e.detail.value),
      releaseDisabled: !(this.data.productDesc && this.data.imageList.length && money(e.detail.value)) || e.detail.value >= 100000000,
    })
  },
  // 输入入手价格
  originPriceInput(e) {
    if(+e.detail.value >= 100000000) {
      this.setData({
        toptipsShow: true,
        resultText: '商品价格必须在0元与1亿元之间哦~',
        toptipsType: 'info',
      });
    }
    this.setData({
      originPrice: money(e.detail.value),
      releaseDisabled: !(this.data.productDesc && this.data.imageList.length && money(e.detail.value)) || e.detail.value >= 100000000,
    })
  },
  // 选择分类
  chooseClassify(e) {
    const value = e.currentTarget.dataset.item.value;
    this.data.selectedClassify = this.data.selectedClassify === value ? '' : value; 
    this.setData({
      selectedClassify: this.data.selectedClassify
    })
  },
  // 选择标签 -- 成色
  chooseTag(e) {
    const value = e.currentTarget.dataset.item.value;
    this.data.selectedTag = this.data.selectedTag === value ? '' : value;
    this.setData({
      selectedTag: this.data.selectedTag
    })
  },
  // 发布
  releaseProduct() {
    if(this.data.productDesc && this.data.imageList.length && this.data.price) {
      wx.showLoading({ title: '发布中...' });
      wx.cloud.callFunction({
        name: 'msgSecCheck',
        data: { content: this.data.productDesc }
      }).then(res => {
        wx.hideLoading();
        const { errCode } = res.result;
        if(errCode == 0) {
          const tempFileList = [];
          wx.cloud.getTempFileURL({ // 根据fileID获取临时URL
            fileList: this.data.fileIdArr,
            success: res => {
              if(res && res.fileList && res.fileList.length) {
                res.fileList.forEach(item => {
                  tempFileList.push(item.tempFileURL);
                });
                const params = {
                  productDesc: this.data.productDesc,
                  imageList: tempFileList,
                  price: this.data.price,
                  originPrice: this.data.originPrice,
                  classify: this.data.selectedClassify,
                  brandName: this.data.brandName,
                  finenessTag: this.data.selectedTag,
                  userAddress: this.data.userAddress,
                  avatar: this.data.userInfo.avatarUrl,
                  nickName: this.data.userInfo.nickName,
                  isCollected: [],
                  isOff: false,
                  isDeleted: false,
                  isSold: false,
                  uid: app.globalData.openid,
                }
                wx.cloud.callFunction({ // 调用发布接口
                  name: 'postProduct',
                  data: params,
                  success: res => {
                    console.log(res, 'postProduct-success')
                    wx.showToast({
                      title: '发布成功',
                      icon: 'success',
                    });
                    const pages = getCurrentPages(); // 获取页面栈
                    const prevPage = pages[pages.length - 2]; // 跳转之前的页面
                    prevPage.setData({
                      postSuccess: true,
                    });
                    const timer = setTimeout(() => {
                      wx.navigateBack({
                        delta: 1,
                      });
                      clearTimeout(timer);
                    }, 600);
                  },
                  fail: e => {
                    console.log(e);
                    wx.showToast({
                      title: '服务繁忙，请稍后再试~',
                      icon: 'none'
                    })
                  }
                })
              }
            },
            fail: e => {
              console.log(e);
            }
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
  // 品牌名称输入，失去焦点生成tag
  brandInputBlur(e) {
    if(e.detail.value !== '') {
      this.setData({
          brandName: e.detail.value,
          brandTagShow: true,
        })   
    }
  },
  // 删除品牌tag
  deleteBrandTag() {
    this.setData({
      brandTagShow: false,
      brandName: '',
    })
  },
  // 自动获取用户位置
  getUserLocation(res, _this) {
    if(res.authSetting['scope.userLocation']) { // 用户默认同意授权位置信息
      wx.getLocation({
        type: 'wgs84',
        success: res => { // 先获取到经纬度
          this.useQQMap(res.latitude, res.longitude, _this);
        },
        fail (e) { // 未获取到经纬度
          console.log(e, 'fail')
        }
      })
    }
  },
  // 使用腾讯位置服务
  useQQMap(latitude, longitude, _this) {
    const qqmapsdk = new QQMapWX({
      key: 'A4BBZ-RMHYU-LDQVQ-BZDUV-EOPZO-5BFWK'
    });
    qqmapsdk.reverseGeocoder({ // 再通过腾讯位置服务获取到地理位置
      location: { latitude, longitude },
      success: res => {
        // console.log('location service', res);
        _this.setData({
          userAddress: res.result.formatted_addresses.recommend,
        });
      },
      fail: e => { // 腾讯位置服务出错
        console.log(e, 'fail')
      }
    });
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