Vue.component('dc-order', {
	template: '#order-template',
	data() {
		return {
			foodClass: '',
			listWidth: '0px',
			alipayurl: '',
			wxpayurl: '',
		}
	},
	created() {
	},
	mounted() {
		
	},
	methods: {
		handlePay() {
			const ths = this
			const state = this.$store.state
			const order = state.order
			if(!(order.totalprice > 0)) {
				return
			}
			layer.open({ type: 2 })
			const data = {
				totalprice: order.totalprice,
				number: 0,
				foods: order.foods.map(m => { return { foodsid: m.foodid, quantity: m.quantity, total: m.total,unitprice: m.preprice } })
			}
			
			_postData('/index.php/Api/Orders/submitorder', data, (rst) => {
				layer.closeAll()
				state.orderState = 1
				state.orderId = rst.orderid
				// {"msg":"","code":200,"rst":{"status":1,"orderid":51,"ordersn":"1000008144","totalprice":11.5,"wxpayurl":"weixin:\/\/wxpay\/bizpayurl?pr=B6Di6tz"}}
				ths.wxpayurl = rst.wxpayurl
				ths.alipayurl = rst.alipayurl
			}, (msg) => {
				layer.closeAll()
				layer.open({ content: msg || '提交订单失败' ,skin: 'msg' ,time: 3 })
			})
		},
		
		handleCancel(){
			const ths = this
			
			if(this.totalprice == 0) {
				return
			}
			
			//询问框
			layer.open({
				content: '您确定要取消当前订单吗？'
			    ,btn: ['是的', '不要，我要再看看']
			    ,yes: function(index){
			    		ths.$store.commit('clear')
//			    		location.reload()
			    		layer.close(index)
			    }
			  });
		},
		
		handleRemove(item) {
			this.$store.commit('remove', item)	
		},
	},
	computed: {
		totalprice() {
			const order = this.$store.state.order
			return order.totalprice
		},
		foods() {
			const foods = this.$store.state.order.foods
			this.listWidth = Math.max(3, foods.length) * 24 + 'vw'
			return foods
		},
		count() {
			return this.$store.state.order.foods.length;
		}
	}
})