Vue.component('dc-ads', {
	template: '#ads-template',
		data() {
			return {
				list: [],
				swiper: null,
				swipeId: 'swipe' + new Date().getTime()
			}
		},
		created() {
			this.loadData()
		},
		mounted() {
		},
		methods: {
			loadData() {
				_loadData('index.php/Api/Ads/lst', 'ads', (rst) => {
					if(rst.length > 0) {
						this.list = rst
						this.setup()
					}
				})
			},
			setup() {
				let id = '#' + this.swipeId
				this.$nextTick(() => {
					this.swiper = new Swiper(id,{
					    pagination: '.pagination',
					    loop:true,
					    grabCursor: true,
					    autoplay : 5000,
						speed: 500,
					    onTap: this.handleClick.bind(this),
					})
				});
			},
			handleClick() {
				const index = this.swiper.activeIndex - 1
				const ads = this.list[index]
				if(ads) {
					layer.open({ content: `点击了第几${index}个广告`,skin: 'msg' ,time: 2 })
				}
			},
		}
});