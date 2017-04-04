Vue.component('dc-print', {
	template: '#print-template',
	data() {
		return {
			totalprice: 0,
			foods: [],
		}
	},
	created() {
		const ths = this
		const state = this.$store.state
		const mediaQueryList = window.matchMedia('print')
		mediaQueryList.addListener(function(mql) {
		    if (mql.matches) {
		        console.log('正在打印')
		    } else {
		        console.log('打印结束')
		        state.orderState = 0
		        ths.$store.commit('clear')
		        ths.totalprice = 0
		        ths.foods.length = 0
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
			this.$nextTick(() => {
				window.print()
			})
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