Vue.component('dc-print', {
	template: '#print-template',
	data() {
		return {
			totalprice: 0,
			foods: [],
		}
	},
	created() {
		var mediaQueryList = window.matchMedia('print');
		mediaQueryList.addListener(function(mql) {
		    if (mql.matches) {
		        console.log('before printing')
		    } else {
		        console.log('after printing')
		    }
		})
	},
	mounted() {
		
	},
	methods: {
		print(){
			const state = this.$store.state
			this.totalprice = state.totalprice
			this.foods = state.foods.slice()
			console.log('开始打印')
			window.print()
//			console.log('打印结束')
//			state.orderState = 0
//			setTimeout(()=> {
//				console.log('打印结束')
//				state.orderState = 0
//			}, 5000)
			
		}
	},
	computed: {
		printing() {
			const printing = this.$store.state.orderState == 2
			if(printing) {
				this.print()
			}
			return printing
		}
	},
})