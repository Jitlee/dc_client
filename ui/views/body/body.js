Vue.component('dc-body', {
	template: '#body-template',
	data() {
		return {
			categoryId: ''
		}
	},
	created() {
		
	},
	mounted() {
		
	},
	methods: {
		handleMenuChange(categoryId) {
			this.categoryId = categoryId
		}
	}
});