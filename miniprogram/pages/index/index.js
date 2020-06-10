//index.js
//获取应用实例
const app = getApp()
const DEVICE = "";
const CLIENT_ID = "";
const CLIENT_SECRET = "";
Page({
  data: {
    address:''
  },
  onLoad: function() {

  },
  async main() {
    wx.showLoading({
      title: '正在加载中',
      mask:true
    })
    const token = await this.getToken();
    const device = await this.checkDevice(token);
    if (device.is_online !== "Y") {
      // alert("当前设备不在线");
      wx.showModal({
        title: '提示',
        content: '当前设备不在线',
      })
      return;
    }
    await this.requestStartLive(token);
    const address = await this.getStreamingAddress(token);
    console.log(address.rtmp);
    this.setData({
      address: address.rtmp
    });
    // 注意
    // 因为浏览器安全限制 不管是http还是https 都能使用sflv

  },
  statechange(e) {
    console.log('live-player code:', e.detail.code);
    if (e.detail.code === 2004) wx.hideLoading();
  },
  error(e) {
    console.error('live-player error:', e.detail.errMsg)
  },
  async getToken() {
    let data={
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }
    return new Promise(res =>{
      wx.request({
        url: "https://api.morecanai.com/client/v1/obtain-access-token",
        method: "post",
        header: {
          "Accept": "application/json, text/plain, */*",
          "Content-Type": "application/x-www-form-urlencoded"
        },
        data: {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        },
        success: (response) => {
          const token = response.data.access_token;
          res(token);
        }
      })
    }) 
  },
  fullscreen(){
    this.ctx = wx.createLivePlayerContext("player")
    this.ctx.requestFullScreen({
      success: res => {
        console.log('play success')
      },
      fail: res => {
        console.log('play fail')
      },
      direction: 90
    })
  },
  requestStartLive(token) {
    return new Promise(res =>{
      wx.request({
        url: `https://api.morecanai.com/client/v1/camera/${DEVICE}/camera-message`,
        method: "post",
        data: {
          action: "start_streaming",
        },
        header: {
          "Accept": "application/json, text/plain, */*",
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Bearer " + token,
        },
        success:() =>{
          res(true);
        }
      });
    })
    
  },

  getStreamingAddress(token) {
    return new Promise((res) => {
      wx.request({
        url: `https://api.morecanai.com/client/v1/camera/streaming-address`,
        method: "post",
        data: {
          camer_serial_numbers: DEVICE,
        },
        header: {
          "Accept": "application/json, text/plain, */*",
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Bearer " + token,
        },
        success: (response) => {
          res(response.data[DEVICE]) ;
        }
      });
    })  
  },

  async checkDevice(token) {
    return new Promise((res) =>{
       wx.request({
        url: `https://api.morecanai.com/client/v1/camera/${DEVICE}/show`,
        method: "get",
        header: {
          "Accept": "application/json, text/plain, */*",
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Bearer " + token,
        },
        success: (response) => {
          res(response.data) ;
        }
      });
    })
    
  }
})