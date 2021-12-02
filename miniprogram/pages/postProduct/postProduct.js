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
    fileIdArr: [], // 上传后返回的文件ID
    tempFilePaths: [], // 图片临时文件
    imgSecCheckArr: [], // 安全检查结果
    longitude: '', // 经度
    latitude: '', // 纬度
    userLocation: '',
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
      });
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
    if(app.globalData.userLocation) {
      this.data.userLocation = app.globalData.userLocation;
      this.setData({
        userAddress: this.data.userLocation.address,
      });
    } else {
      const _this = this;
      wx.getSetting({
        success: res => {
          this.getUserLocation(res, _this); // 获取用户位置信息
        }
      });  
    }
    wx.enableAlertBeforeUnload({
      message: '确定退出吗？\n退出后已编辑的内容将不会被保存'
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
        this.data.imgSecCheckArr = [];
        const tempFiles = res.tempFiles; // 临时文件（包含临时文件路径和大小）
				const tempFilesLength = res.tempFiles.length; // 临时文件数量
				this.data.tempFilePaths = res.tempFilePaths; // 临时文件路径
			  tempFiles.forEach((item, index) => {
          const size = item.size;
          const path = item.path;
          if(size / 1024 / 1024 > 1) { // 图片大小超过1M，压缩后再进行安全检查
						console.log('图片大于1M')
						wx.compressImage({ src: path,	quality: 20 }).then(compressResult => {
							const handledPath = compressResult.tempFilePath;
							this.imgSecCheck(handledPath, tempFilesLength, index);
						})
					} else {
						console.log('图片小于1M'); // 图片大小小于1M，直接进行安全检查
						this.imgSecCheck(path, tempFilesLength, index);
          }
				});
			},
			fail: e => {
				console.error(e, 'choose img fail');
				// wx.showToast({
				// 	title: '未获取到有效图片，请再试一次',
				// 	icon: 'none'
				// });
			}
		})
	},
	// 图片安全检查
	imgSecCheck(filePath, tempFilesLength, index) {
		wx.cloud.callFunction({ // 2 图片安全检查
			name: 'imgSecCheck',
			data: {
				imgData: wx.cloud.CDN({
					type: 'filePath',
					filePath: filePath
				})
			}
		}).then(secCheckResult => {
			console.log(secCheckResult, 'img check')
			this.data.imgSecCheckArr.push(secCheckResult); // 将检查结果放进数组
			console.log(tempFilesLength, index, this.data.imgSecCheckArr, 'tempFilesLength_index_imgSecCheckArr');
			if(tempFilesLength == index + 1) { // 等遍历到最后一个数据，然后检查每一个返回的结果
				if(this.data.imgSecCheckArr.every(item => item.result.errCode === 0)) { // 检查通过
					this.data.tempFilePaths.forEach((item, index1) => { // 遍历临时文件，将每一个文件上传到云存储
						this.uploadImg(item, index1, tempFilesLength); // 上传图片
          });
				} else if(this.data.imgSecCheckArr.some(item => item.result.errCode == 87014)) { // 检查未通过
					wx.hideLoading();
					this.setData({
						resultText: '不得上传违法违规内容，请重新选择！',
						toptipsShow: true,
						toptipsType: 'error',
					});
				} else { // 检查异常
					wx.hideLoading();
					this.setData({
						resultText: '服务异常，请稍后再试~',
						toptipsShow: true,
						toptipsType: 'error',
					});
				}
			}
		}).catch(e => {
			console.log(e, 'imgSecCheck fail');
			wx.hideLoading();
			wx.showToast({
				title: '服务繁忙，请稍后再试~',
				icon: 'none'
			});
		});
	},
	// 将图片上传
	uploadImg(item, index1, tempFilesLength) {
		wx.cloud.uploadFile({ // 3 上传文件
			cloudPath: 'temp/' + new Date().getTime() + "-post-" + Math.floor(Math.random() * 1000),
			filePath: item,
			success: uploadFileResult => { // 文件上传成功
				console.log(uploadFileResult, 'uploadFileResult')
				const fileID = uploadFileResult.fileID;
				this.data.fileIdArr.push(fileID);
        wx.hideLoading();
        console.log(tempFilesLength, 'tempFilesLength')
        console.log(this.data.fileIdArr, 'fileIdArr')
        console.log(index1, 'index1')
        if(tempFilesLength === index1 + 1) { // 等数据遍历结束，全部放进数组
          console.log(3333333)
          this.data.imageList.push(...this.data.tempFilePaths);
          this.setData({
            imageList: this.data.imageList,
            imgUrls: this.data.imageList,
            releaseDisabled: !(this.data.productDesc && this.data.imageList.length && this.data.price),
          });
          console.log(this.data.imageList, this.data.fileIdArr, '------------------')
				}
			},
			fail: e => { // 文件上传失败
				console.log(e, 'uploadfile fail');
				wx.hideLoading();
				wx.showToast({
					title: '上传失败，请稍后再试~',
					icon: 'error'
				});
			}
		});
	},
  // 图片预览
  imgPreview(e) {
    wx.showLoading();
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
        const { errCode } = res.result;
        if(errCode == 0) { // 信息安全检查成功
          console.log(this.data.fileIdArr, '1234567890')
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
                  userAddress: this.data.userLocation ? this.data.userLocation.address : this.data.userAddress,
                  avatar: this.data.userInfo.avatarUrl,
                  nickName: this.data.userInfo.nickName,
                  isCollected: [],
                  isOff: false,
                  isDeleted: false,
                  isSold: false,
                  uid: app.globalData.openid,
                  latitude:  this.data.userLocation ? this.data.userLocation.latitude : this.data.latitude,
                  longitude:  this.data.userLocation ? this.data.userLocation.longitude : this.data.longitude,
                }
                wx.cloud.callFunction({ // 调用发布接口
                  name: 'postProduct',
                  data: params,
                  success: res => {
                    console.log(res, 'postProduct-success')
                    wx.hideLoading();
                    wx.disableAlertBeforeUnload();
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
                    wx.hideLoading();
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
              wx.hideLoading();
              wx.showToast({
                title: '服务繁忙，请稍后再试~',
                icon: 'none'
              });
            }
          });
        } else if(errCode == 87014) { // 发布违规内容
          wx.hideLoading();
          this.setData({
            resultText: '不得发布违法违规内容，请重新输入！',
            toptipsShow: true,
            toptipsType: 'error',
          });
        }
      }).catch(e => {
        console.log(e, 'msgSecCheck fail')
        wx.hideLoading();
        wx.showToast({
          title: '服务繁忙，请稍后再试~',
          icon: 'none'
        });
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
    if(res.authSetting['scope.userLocation']) { // 用户授权位置信息
      wx.getLocation({
        type: 'gcj02',
        success: res => { // 先获取到经纬度
          this.data.latitude = res.latitude;
          this.data.longitude = res.longitude;
          this.useQQMap(res.latitude, res.longitude, _this);
        },
        fail: e => { // 未获取到经纬度
          console.log(e, 'fail')
        }
      })
    }
  },
  // 使用腾讯位置服务
  useQQMap(latitude, longitude, _this) {
    console.log(latitude, longitude, 'qqqqqqqqqqq')
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
  // 引导开启位置授权
  authorizeLocation() {
    const _this = this;
    wx.openSetting({
      success: data => {
        if (data.authSetting["scope.userLocation"]) { // 已授权位置信息
          wx.chooseLocation({
            success: res => {
              this.data.latitude = res.latitude;
              this.data.longitude = res.longitude;
              this.useQQMap(res.latitude, res.longitude, _this);
            }
          })
        }
      },
      fail: () => {
        wx.showModal({
          title: '提示',
          content: '服务繁忙，请稍后再试~',
          showCancel: false,
          confirmText: '好的~'
        })
      },
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
    if(this.data.productDesc || this.data.imageList.length || this.data.price) {
      wx.disableAlertBeforeUnload();
    }
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