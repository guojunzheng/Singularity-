const weatherMap = {
  "sunny" : "晴",
  "cloudy": "多云",
  "overcast": "阴",
  "lightrain": "小雨",
  "heavyrain": "大雨",
  'snow':"下雪"
}

const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

const UNPROMPTED = 0
const AUTHORIZED = 1
const UNAUTHORIZED = 2
const UNPROMPTED_TIP = '点击获取位置信息'
const AUTHORIZED_TIP = ''
const UNAUTHORIZED_TIP = '点击开启位置权限'

const QQMapWX = require('../../libs/qqmap-wx-jssdk.js');

var tmp = 
{
  onTapTodayWeather(){
    wx.navigateTo({
      url: '/pages/list/list?city='+this.data.nowCity,
    })
    console.log("Good Job!")
  },


  data: {
    nowTemp: '',
    nowWeather: '',
    // cityName: '上海市'
    nowWeatherBackground: '',
    forecast: [],
    todayDate: '',
    todayRange:'',
    nowCity: '上海市',
    locationtypes: UNPROMPTED,
    locationtips: UNPROMPTED_TIP
  },

  onPullDownRefresh() {
    this.getNow(() => {
      wx.stopPullDownRefresh()
    })
  },

  onLoad() {
    this.qqmapsdk = new QQMapWX({
      key: 'GMEBZ-22TWQ-AZY5M-GCIQT-CQKKH-35FRO'
    })
    
    wx.getSetting({
      success: res=>{
        let auth = res.authSetting['scope.userLocation']
        console.log(auth)
        this.setData({
          locationtypes: auth? AUTHORIZED : 
            (auth === false)?UNAUTHORIZED: UNPROMPTED,
          locationtips: auth? AUTHORIZED_TIP:
            (auth === false)? UNAUTHORIZED_TIP: UNPROMPTED_TIP
        })

        if(auth)
          this.getLocation()
        else this.getNow()
      }
    })

  },


  onTapLocation() {
    if(this.data.locationtypes === UNAUTHORIZED)
      wx.openSetting({
        success: res=>{
          let auth = res.authSetting["scope.userLocation"]
          if(auth){
            this.getLocation()
          }
        }
      })
    else
    this.getLocation()
  },

  getLocation(){
    wx.getLocation({
      success: res => {
        console.log(res.latitude,res.longitude)
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            let city = res.result.address_component.city
            this.setData({
              nowCity: city,
              locationtips: AUTHORIZED_TIP
            })
          this.getNow()
          },
          fail: err=>{
            console.log("err", err)
          }
        })
      },

      fail: ()=>{
        this.setData({
          locationtypes: UNAUTHORIZED,
          locationtips: UNAUTHORIZED_TIP
        })
        
      }
    })
  },

  getNow(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: '广州市',
      },
      success: res => {

        let result = res.data.result
        let temp = result.now.temp
        let weather = result.now.weather

        console.log(temp, weather)
        this.setData({
          nowTemp: temp + "°",
          nowWeather: weatherMap[weather],
          nowWeatherBackground: '/images/' + weather + '-bg.png',
        })

        wx.setNavigationBarColor({
          frontColor: '#000000',
          backgroundColor: weatherColorMap[weather],
        })

        let forecast = []
        var nowDate = new Date().getHours()
        for(let i = 0; i<8; i+=1){
          forecast.push({
            time: (nowDate+i * 3)%24 + ':00',
            iconPath: '/images/'+result.forecast[i].weather+'-icon.png',
            temp: result.forecast[i].temp + '°'
          })
        }

        this.setData({
          forecast: forecast
        })

        var todayDate = new Date()
        var todayYear = todayDate.getFullYear()
        var todayMonth = todayDate.getMonth() + 1
        var todayDay = todayDate.getDate()

        var todayLowerRange = result.today.minTemp
        var todayHigherRange = result.today.maxTemp

        this.setData({
          todayDate: todayYear + '-' + todayMonth + '-' + todayDay,
          todayRange: todayLowerRange + '°-' + todayHigherRange + '°',
        })

        callback && callback()

        
      }
    })
  }
}

Page(tmp)