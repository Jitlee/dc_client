Vue.component('dc-food', {
	template: '#food-template',
	props: {
		categoryId: String
	},
	data() {
		return {
			_categoryId: '',
			timeoutId: 0,
			tempList: [], // 临时储存中间过渡菜品
			tempIndex: -1,
			category: '菜品',
			foods: [], // 存放所有菜品
			list: [], // 当前界面显示的
		}
	},
	created() {
		_loadData('/index.php/Api/Food/lst?machinecode=abpp001', 'foods', (rst) => {
			if(rst.length > 0) {
				rst.forEach(f=> { f.quantity = 0; f.total = 0 })
				this.foods = rst
				this.$store.commit('setFoods', rst)
				this.filter(this._categoryId)
			}
		})
	},
	mounted() {
		
	},
	methods: {
		filter(categoryId) {
			clearTimeout(this.timeoutId)
			this.list = []
			this.tempIndex = 0;
			this.tempList = this.foods.filter((item) => {  return item.categoryid == categoryId })
			this.beginTransition()
			
			const menus = this.$store.state.menus
			let menuCount = menus.length
			while(menuCount--) {
				if(menus[menuCount].categoryId == categoryId) {
					this.category = menus[menuCount].cateName
					break
				}
			}
		},
		
		beginTransition() {
			const length = this.tempList.length
			if(this.tempIndex < length) {
				this.list.push(this.tempList[this.tempIndex]) 
				this.tempIndex++
				if(this.tempIndex < length) {
					if(this.tempIndex >= 10) {
						for(let i = this.tempIndex; i < length; i++) {
							this.list.push(this.tempList[i])
						}
						this.tempList.length = 0
					} else {
						this.timeoutId = setTimeout(this.beginTransition.bind(this), 100)
					}
				}
			}
		},
		
		handleAdd(item, index) {
			item.quantity++;
			this.$store.commit('increment', item);
			$(this.$refs.list.$el).children().eq(index).animateCss('pulse')
		},
		
		handleRemove(item, index) {
			item.quantity--
			this.$store.commit('decrement', item)
		},
	},
	watch: {
		'categoryId'(val) {
			this._categoryId = val
			this.filter(val)
		}
	}
});