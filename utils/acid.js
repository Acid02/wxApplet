/**
 * 接口域名的管理
 */
const base = {
  M1:'https://www.acid02.com/',
}

const urlSwitch = (type)=>{
  return base[type]
}

export const http = ({url,parmas,urltype='M1',method='get'}={})=>{
  return new Promise((resolve,reject)=>{
    console.log(url,parmas)
    // console.log(urlSwitch(urltype)+url,parmas)
    wx.request({
      url: urlSwitch(urltype)+url,
      data:parmas,
      method,
      header: {'content-type': 'application/x-www-form-urlencoded'},
      success (res) {
        resolve(res.data)
      },
      fail (err) {
        wx.showToast({title: '网络异常...',icon: 'none',duration: 2000})
        reject(err)
      }
    })
  })
}
//解析字符串里面的url
export const httpString = (s) =>{
  let reg = /(https?|http|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g;
  try {
      return s.match(reg)[0];
  } catch (error) {
      return null;
  }
}