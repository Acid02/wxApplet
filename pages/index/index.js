//index.js
import { httpString } from '../../utils/acid'
import { getVideowm } from '../../api/api'
Page({
  data: {
    inputValue:'',
    media:{},
    isPlayingMusic:false,
    progres:'0',
  }, 
  /* 转发*/
  onShareAppMessage: function (ops) {
  
    if (ops.from === 'button') {
      // 来自页面内转发按钮
      console.log(ops.target)
    }
    return {
      title: '抖音去水印',
      imageUrl:'https://s-sh-1851-miku.oss.dogecdn.com/02/1045019.jpg/webp', // 分享的封面图参数
      success: function (res) {  // 分享成功之后的操作
        console.log("分享成功:" + JSON.stringify(res));
      },
      fail: function (res) {  // 分享失败之后的操作
        console.log("分享失败:" + JSON.stringify(res));
      }
    }
  },
  onLoad: function () {
   
    let that = this;
    wx.getClipboardData({
      success (res){
        if(httpString(res.data)){
          wx.showModal({
            title: '是否获取剪切板中的链接资源',
            content: httpString(res.data),
            success (rest) {
              if (rest.confirm) {
                that.setData({
                  inputValue:httpString(res.data)
                })
              }
            }
          })
        }
      }
    })
  },
  async tap(){
    wx.showLoading({title: '提取中...',})

    let { inputValue } = this.data;

    if(httpString(inputValue)){
     let params = {url:httpString(inputValue)}
     let result = await getVideowm({params});
     if(result.code == 200){
      this.setData({ media:result});
      wx.hideLoading()
     }else{
      wx.showToast({title: '提取失败',icon: 'none',duration: 2000})
     }
    }else{
      wx.showToast({title: '请输入正确地址',icon: 'none',duration: 2000})
    }
  },
  bindKeyInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  handleAudio(){
    let that = this;
    let { media,isPlayingMusic } = this.data;
    if(!isPlayingMusic){
      wx.playBackgroundAudio({
        dataUrl: media.audio,
        title: media.title,
        coverImgUrl: media.cover,
        success(){
          that.setData({
            isPlayingMusic: true,
          })
        }
      })
    }else{
      wx.pauseBackgroundAudio()
      that.setData({
        isPlayingMusic: false,
      })
    }
  },

  async downloadFile(e){

   let {src:url,type} = e.target.dataset;

   let handsPost = await this.savePoster()
   
   wx.showLoading({title: '保存中...',mask: true})

   if(handsPost){
     let tempFilePath = ''
     if(type!=='audio'){
      tempFilePath = await new Promise(resolve=>{
        wx.downloadFile({url,success(res){
          if (res.statusCode === 200)
          resolve(res.tempFilePath)
        }}).onProgressUpdate((res)=>{

          if (res.progress === 100) {
            setTimeout(()=>{
              this.setData({
                progres: '0'
              });
            },1000)
          }else{
            this.setData({
              progres: res.progress
            });
          }
        })
      }) 
      console.log(url,tempFilePath)
     }
      



    switch(type){
      case 'video':
          wx.saveVideoToPhotosAlbum({
              filePath: tempFilePath,
                success (res) {
                  wx.showToast({title: '已保存',icon: 'none',duration: 2000})
                },
                fail(err){
                  let {errMsg} = err;
                  if(errMsg =='saveVideoToPhotosAlbum:fail cancel'){
                    wx.showToast({title: '已取消',icon: 'none',duration: 2000})
                  }
                }
          })
        break;
      case 'audio':

        wx.setClipboardData({
          data: url,
          success: function (res) {
           wx.showModal({ title: '提示', content: '复制成功(粘贴到浏览器下载)',showCancel: false});
          }
        });

        break;
      case 'image':

        wx.saveImageToPhotosAlbum({
          filePath:tempFilePath,
          success(res) { 
            wx.showToast({title: '已保存',icon: 'none',duration: 2000})
          },
          fail(err){
            let {errMsg} = err;
            if(errMsg =='saveVideoToPhotosAlbum:fail cancel'){
              wx.showToast({title: '已取消',icon: 'none',duration: 2000})
            }
          }
        })

        break;
      default:
        wx.showToast({title: '保存失败',icon: 'none',duration: 2000})
    }
   }else{
    wx.showToast({title: '失败',icon: 'none',duration: 2000})
   }
   
  },
  // 保存到相册
  savePoster(){
    let that = this
    return new Promise(resolve=>{
      wx.getSetting({
        success(res) {
          if (res.authSetting['scope.writePhotosAlbum']) {
            resolve(true)
          } 
          else if (res.authSetting['scope.writePhotosAlbum'] === undefined) {
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success() {
                resolve(true)
              },
              fail() {
                that.authConfirm().then(res=>{
                  resolve(true)
                })
              }
            })
          } 
          else {
            that.authConfirm().then(res=>{
              resolve(true)
            })
          }
        }
      })
    })
    
  },
  // 授权拒绝后，再次授权提示弹窗
  authConfirm(){
    let that = this
    return new Promise(resolve=>{
      wx.showModal({
        content: '检测到您没打开保存图片权限，是否去设置打开？',
        confirmText: "确认",
        cancelText: "取消",
        success: function (res) {
          if (res.confirm) {
            wx.openSetting({
              success(res) {
                if (res.authSetting['scope.writePhotosAlbum']) {
                  resolve(true)
                }
                else {
                  wx.showToast({
                    title: '您没有授权，无法保存到相册',
                    icon: 'none'
                  })
                }
              }
            })
          } else {
            wx.showToast({
              title: '您没有授权，无法保存到相册',
              icon: 'none'
            })
          }
        }
      });
    })
    
  },
  // 图片保存到本地
  saveImg(){
    wx.downloadFile({
      url: 'https://www.oneh5.com/thq/FLH/backend_api/api/../images/upload/20190111/qj.jpg',//this.data.posterImg,
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (data) {
            wx.showToast({
              title: '保存成功',
              icon: 'none'
            })
          }
        })
      }
    })
  }
})
