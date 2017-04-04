Vue.component('dc-pay', {
	template: '#pay-template',
	props: {
		wxpayurl: String,
		alipayurl: String,
	},
	data() {
		return {
			tabIndex: 1,
			qrCode: '',
			wxQRCode: '',
			alQRCode: '',
			timeoutId: 0,
			loopCount: 0,
		}
	},
	created() {
	},
	mounted() {
		
	},
	methods: {
		handleZhifubao() {
		 	this.tabIndex = 0
		 	this.qrCode = this.alQRCode
			console.log('开始打印')
			this.$store.state.printing = true
			this.loopCount = 0
		 	this.beginLoop()
		},
		handleWechat() {
		 	this.tabIndex = 1
		 	this.qrCode = this.wxQRCode
			this.loopCount = 0
		 	this.beginLoop()
		},
		beginLoop() {
			clearTimeout(this.timeoutId)
			const state = this.$store.state
			if(this.loopCount > 100) {
				this.loopCount = 0
				state.orderState = 0
				return
			}
			if(state.orderState == 1) {
				this.timeoutId = setTimeout(()=> {
					if(state.orderState == 1) {
						_postData('/index.php/Api/Orders/queryPaystatus', {
							orderid: state.orderId
						}, (rst)=> {
							if(rst == true) {
								console.log('准备打印')
								state.orderState = 2
							} else {
								this.loopCount++
								this.beginLoop()
							}
						}, (msg)=> {
							layer.open({ content: msg || '获取支付状态失败' ,skin: 'msg' ,time: 3 })
						})
					}
				}, 3000)
			}
		}
	},
	computed: {
		totalprice() {
			const order = this.$store.state.order
			return order.totalprice
		},
	},
	watch: {
		'wxpayurl'(val){
			this.wxQRCode = _createQRCode(val)
			if(this.tabIndex == 1) {
				this.$nextTick(()=> {
					this.qrCode = this.alQRCode
					this.loopCount = 0
					this.beginLoop()
				})
			}
		},
		'alipayurl'(val){
			this.alQRCode = _createQRCode(val)
			if(this.tabIndex == 0) {
				this.$nextTick(()=> {
					this.qrCode = this.wxQRCode
					this.loopCount = 0
					this.beginLoop()
				})
			}
		},
	}
})