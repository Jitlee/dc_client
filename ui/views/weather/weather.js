// 天气服务免费接口
const WEATHER_API = 'http://php.weather.sina.com.cn/iframe/index/w_cl.php?code=js&day=0&city=&dfc=1&charset=utf-8&_=1491110364235'
// 免费天气图标地址模版
const WATHER_IMAGE_URL = 'http://i1.sinaimg.cn/dy/weather/images/figure/${type}_mid.gif'

const WEEKS = '日一二三四五六';

Vue.component('dc-weather', {
	template: '#weather-template',
	data() {
		return {
			weather: '晴',
			icon: '',
			minT: 20,
			maxT: 23,
			
			year: '2017',
			month: '01',
			date: '01',
			week: '一',
			hour: '00',
			minutes: '00'
		}
	},
	created() {
		this.formatTimer()
		this.beginTimer()
		this.loadData()
	},
	mounted() {
	},
	methods: {
		loadData() {
			$.getScript(WEATHER_API, () =>{
	        		if(window.SWther && window.SWther.w && window.SWther.w) {
	        			for(let city in window.SWther.w) {
	        				if(window.SWther.w[city] && window.SWther.w[city].length > 0) {
							const weatherData = window.SWther.w[city][0]        					
		        				const t1 = Number(weatherData.t1)
		        				const t2 = Number(weatherData.t2)
		        				if(!isNaN(t1) && !isNaN(t2)) {
			        				this.weather = weatherData.s1
			        				this.minT = Math.min(t1, t2)
			        				this.maxT = Math.max(t1, t2)
			        				this.icon = WATHER_IMAGE_URL.replace('${type}', weatherData.f1)
		        				}
	        				}
	        			}
	        		}
	        })
		},
		beginTimer() {
			const now = new Date()
			if(now.getSeconds() == 0) {
				setInterval(this.formatTimer.bind(this), 6*1000)
			} else {
				setTimeout(this.beginTimer.bind(this), (60 - now.getSeconds()) * 1000)
			}
		},
		formatTimer() {
			const now = new Date()
			const month = now.getMonth() + 1
			const date = now.getDate()
			const hour = now.getHours()
			const minutes = now.getMinutes()
			this.year = now.getFullYear()
			this.month = month > 9 ? month : ('0' + month)
			this.date = date > 9 ? date : ('0' + date)
			this.week = WEEKS[now.getDay()]
			this.hour = hour > 9 ? hour : ('0' + hour)
			this.minutes = minutes > 9 ? minutes : ('0' + minutes)
		}
	}
});