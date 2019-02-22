// pages/list.js
const dayMap = [
  '周日', '周一', '周二', '周三', '周四', '周五', '周六'
]

const weatherMap = {
  "sunny": "晴",
  "cloudy": "多云",
  "overcast": "阴",
  "lightrain": "小雨",
  "heavyrain": "大雨",
  'snow': "下雪"
}

Page({
  data: {
    weekWeather: [1,2,3,4,5,6,7],
    city: '上海市'
  },
  
  onPullDownRefresh(){
    this.getWeather()
    wx.stopPullDownRefresh()
  },

  onLoad(options){
    this.setData({
      city: options.city
    })
    this.getWeather()
  },

  getWeather(callback){
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/future',

      data: {
        city: this.data.city,
        time: new Date().getTime(),
      },

      success: res => {
        let result = res.data.result
        console.log(result)

        let weekWeather = []
        for (let i = 0; i < 7; i += 1) {
          var date = new Date()
          date.setDate(date.getDate() + i)
          weekWeather.push({
            day: dayMap[date.getDay()],
            date: [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-'),
            weather: weatherMap[result[i].weather],
            iconPath: '/images/' + result[i].weather + '-icon.png'
          })
        }


        weekWeather[0].day = '今天'

        console.log(this.data.city)

        this.setData({
          weekWeather
        })
      },

      complete: ()=>{
        callback && callback()
      }

    })
  }
})