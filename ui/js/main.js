$.fn.extend({
		animateCss: function (animationName) {
	    	var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
	    	this.addClass('animated ' + animationName).one(animationEnd, function() {
	    		$(this).removeClass('animated ' + animationName);
	    	});
    }
})

const cv = (function() {
	if(window.require) {
		const path = require('path')
		const fs = require('fs')
		let filePath = path.join(process.env.PWD, '/js/checkversion.js')
		if(!fs.existsSync(filePath)) {
			filePath = path.join(process.resourcesPath,'/app/js/checkversion.js')
			if(!fs.existsSync(filePath)) {
				console.error('find root path failed!')
			}
		}
		return require(filePath)
	}
	return null
})()

window._createQRCode = function(url) {
	if(cv) {
		return cv.createQRCode(url)
	}
	return ''
}

// 获取数据的
window._loadData = function(api, name, callback) {
	if(cv) {
		const data = cv.readData(name)
		if(data) {
			callback(data)
		}
	} else {
		$.getJSON(api + window.location.search, null, function(rst) {
			if(rst && rst.code == 200 && rst.rst) {
				callback(rst.rst)
			}
		})	
	}
}

// 获取数据的
window._getJSON = function(api, callback) {
	if(cv) {
		cv.getJSON(api, callback, fail)
	} else {
		$.getJSON(api + window.location.search, null, function(rst) {
			if(rst && rst.code == 200 && rst.rst) {
				callback(rst.rst)
			}
		})	
	}
}


window._postData = function(api, data, callback, fail) {
	if(cv) {
		cv.postJSON(api, data, rst => {
			callback(rst)
		}, fail)
	} else {
		$.post(api, JSON.stringify(data), rst => {
			if(rst && rst.code == 200 && rst.rst) {
				callback(rst.rst)
			} else if(rst.msg) {
				fail && fail(rst.msg)
			} else {
				fail && fail()
			}
		}).fail(fail)
	}
}

// 获取数据的
window._loadData = function(api, name, callback) {
	if(cv) {
		const data = cv.readData(name)
		callback(data)
	} else {
		$.getJSON(api, null, function(rst) {
			if(rst && rst.code == 200 && rst.rst) {
				callback(rst.rst)
			}
		})	
	}
}

const router = new VueRouter({
	routes: [
		{ path: '/', component: {  template: '<dc-home></dc-home>' } },
	]
});

const calctotalprice = function(foods) {
	let totalprice = 0
	for(let i = 0, count = foods.length; i < count; i++) {
		totalprice += foods[i].total
	}
	return totalprice
}

const getMenu = function (menus, categoryId) {
	for(let i = 0, count = menus.length; i < count; i++) {
		if(menus[i].categoryId == categoryId) {
			return menus[i]
		}
	}
	return null
}

// store
const store = new Vuex.Store({
	state: {
		menus: [],
		foods: [],
		order: {
			foods: [],
			totalprice: 0,
		},
		orderId: 0,
		orderState: 0,
	},
	mutations: {
		setMenus(state, menus) {
			state.menus = menus
		},
		
		setFoods(state, foods) {
			state.foods = foods
		},
		
		increment(state, food) {
			const foods = state.order.foods;
			
			const menu = getMenu(state.menus, food.categoryId)
			if(menu) {
				menu.badge++
			}
			
			for(let i = 0, count = foods.length; i < count; i++) {
				if(foods[i].foodid == food.foodid) {
					foods[i].total = foods[i].quantity * food.preprice
					state.order.totalprice = calctotalprice(foods)
					return
				}
			}
			
			food.total = food.quantity * food.preprice
			foods.push(food)
			state.order.totalprice = calctotalprice(foods)
		},
		
		decrement(state, food) {
			const foods = state.order.foods;
			
			const menu = getMenu(state.menus, food.categoryId)
			if(menu) {
				menu.badge--
			}
			
			for(let i = 0, count = foods.length; i < count; i++) {
				if(foods[i].foodid == food.foodid) {
					foods[i].preprice = food.preprice
					foods[i].total = foods[i].quantity * food.preprice
					state.order.totalprice = calctotalprice(foods)
					if(foods[i].quantity == 0) {
						foods.splice(i, 1)
					}
					return
				}
			}
		},
		
		remove(state, food) {
			const foods = state.order.foods;
			
			const menu = getMenu(state.menus, food.categoryid)
			if(menu) {
				menu.badge -= food.quantity
			}
			
			for(let i = 0, count = foods.length; i < count; i++) {
				if(foods[i].foodid == food.foodid) {
					foods[i].preprice = food.preprice
					foods[i].quantity = 0
					foods[i].total = 0
					foods.splice(i, 1)
					state.order.totalprice = calctotalprice(foods)
					return
				}
			}
		},
		
		clear(state) {
			state.order.foods = []
			state.order.totalprice = 0
			state.foods.forEach((f) => { f.quantity = 0; f.total = 0 } )
			state.menus.forEach((f) => f.badge = 0)
		}
	}
})
	
// 启动APP
new Vue({ router, store }).$mount('#app')
