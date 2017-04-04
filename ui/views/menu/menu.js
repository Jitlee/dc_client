Vue.component('dc-menu', {
	template: '#menu-template',
	data() {
		return {
			activeIndex: -1,
			list: []
		}
	},
	created() {
		_loadData('/Api/FoodCategory/lst', 'categroies', (rst) => {
			if(rst.length > 0) {
				rst.forEach(m=> { m.badge = 0; m.active = false })
				this.list = rst
				this.$store.commit('setMenus', this.list)
				this.handleClick(this.list[0], 0)
			}
		})
	},
	mounted() {
		
	},
	methods: {
		handleClick(item, index) {
			if(this.activeIndex > -1 && this.activeIndex < this.list.length) {
				this.list[this.activeIndex].active = ''
			}
			this.activeIndex = index
			this.list[this.activeIndex].active = 'active'
			
			this.$emit('change', this.list[this.activeIndex].categoryid)
		}
	},
});