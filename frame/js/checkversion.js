const fs = require('fs')
const path = require('path')
const zip = require('machinepack-zip')
const si = require('systeminformation')

const request = require('request')
const md5 = require('md5')


const dataPath = getUserFolderPath()
let configPath = path.join(path.dirname(process.execPath), 'config.json')
let config = { server: 'dc.yue68.com', port: 80 }
//let config = { server: '192.168.1.129', port: 8050 }
const LOCAL_FOLDER = '__dc__' // 缓存文件夹名称
const DATA_FOLDER = '__data' // 缓存数据文件夹名称
const IMAGE_FOLDER = '__images' // 缓存图片文件夹名称

function createQRCode(url) {
	const qrcode = require('qrcode-js')
	const base64 = qrcode.toDataURL(url, 4)
	return base64
}

// 获取html路径
function getMainPath(fileName = 'index.html') {
	const localPath = path.join(dataPath, LOCAL_FOLDER)
	return path.join(localPath, fileName)
}

// 获取数据文件
function readData(fileName) {
	const localPath = path.join(dataPath, LOCAL_FOLDER, DATA_FOLDER)
	const filePath =  path.join(localPath, md5(fileName))
	if(fs.existsSync(filePath)) {
		const content = fs.readFileSync(filePath)
		try {
			return JSON.parse(content)
		} catch(e) {}
	}
	return null
}

function saveDataFile(fileName, content) {
	const localPath = path.join(dataPath, LOCAL_FOLDER, DATA_FOLDER)
	const filePath =  path.join(localPath, md5(fileName))
	checkPath(localPath)
	fs.writeFileSync(filePath, content)
}

// 下载图片
function saveImage(imagePath, callback) {
	const ext = /\.\w+$/.exec(imagePath)[0]
	const fileName = md5(imagePath) + ext
	const localPath = path.join(dataPath, LOCAL_FOLDER, IMAGE_FOLDER)
	const filePath =  path.join(localPath, fileName)
	const fileUrl = getFullUrl(imagePath)
	const localUrl = `./${IMAGE_FOLDER}/${fileName}`
	checkPath(localPath)
	if(fs.existsSync(filePath)) {
		callback(0, localUrl)
	} else {
		request({url: fileUrl, encoding: null}, function(err, resp, body) {
			if(err) {
		  		callback(-1, fileUrl);
		  	} else {
			  	fs.writeFile(filePath, body, function(err) {
			  		if(err) {
			  			callback(-1, fileUrl)
			  			return
			  		}
			  		callback(0, localUrl)
			  	});
			}
		})	
	}
}

function readConfig() {
	try {
		const text = fs.readFileSync(configPath, 'utf8')
		const data = JSON.parse(text)
  		extend(config, data)
	} catch(e) { }
	return config
}

function saveConfig(newCofing, callback) {
	fs.writeFile(configPath, JSON.stringify(newCofing),function(err){  
        if(err) {
    		callback && callback(err)
        } else {
    		extend(config, newCofing)
    		callback && callback(null)
        }
    }); 
}

function downloadData(api, fileName, imageField, callback, proccess) {
	getJSON(api, (rst)=> {
		if(rst && rst.length > 0 && imageField) {
			proccess(rst.length, 0)
			downImages(rst, imageField, 0, ()=> {
				saveDataFile(fileName, JSON.stringify(rst))
				callback(0)
			}, proccess)
		} else {
			proccess(rst.length, rst.length)
			saveDataFile(fileName, JSON.stringify(rst))
			callback(0)
		}
	}, ()=> {
		callback(-1)
	})
}

function downImages(arr, imageField, index, callback, proccess) {
	if(index < arr.length) {
		const item = arr[index++]
		if(item[imageField]) {
			saveImage(item[imageField], (state, filePath) => {
				item[imageField] = filePath
				proccess(arr.length, index)
				downImages(arr, imageField, index, callback, proccess)
			})
		} else {
			proccess(arr.length, index)
			downImages(arr, imageField, index, callback, proccess)
		}
	} else {
		callback()
	}
}

function downloadFile(url, callback) {
	const now = new Date().getTime()
	const uuid = md5(LOCAL_FOLDER, now)
	const localPath = path.join(dataPath, LOCAL_FOLDER)
	const zipPath = path.join(localPath, uuid + '.zip')
//	const outPath = path.join(localPath, uuid)
	const outPath = localPath
	checkPath(localPath)
	request({url: url, encoding: null}, function(err, resp, body) {
		if(err) {
	  		callback(-2, '下载资源包失败');
	  	} else {
		  	fs.writeFile(zipPath, body, function(err) {
		  		if(err) {
		  			callback(-4, '资源包写入失败')
		  			return
		  		}
		    		zip.unzip({ source: zipPath, destination: outPath, }).exec({
					error: function (err) {
				 		callback(-5, '解压资源包失败')
					},
					success: function () {
						const lastFileVersion = config.fileVersion
						let newConfig = extend({}, config)
						newConfig.fileVersion = now
						saveConfig(newConfig, (err) => {
							if(err) {
								callback(-6, '保存最新的配置失败');
							} else {
								try {
									deleteFolderRecursive(zipPath)
								} catch(e) { console.error('删除旧资源失败' + e) }
								
						 		callback(0, '下文件成功');
							}
						})
					},
				});
			});
	  	}
	});
}

function getFullUrl(api) {
	const _config = config || readConfig()
	return ['http://', urlTrim(_config.server), ':', _config.port, api].join('')
}

function deleteFolderRecursive(path) {
  	if(fs.existsSync(path)) {
		if(fs.lstatSync(path).isDirectory()) {
	    		fs.readdirSync(path).forEach(function(file,index){
		      		var curPath = path + "/" + file;
		      		if(fs.lstatSync(curPath).isDirectory()) { // recurse
		        			deleteFolderRecursive(curPath);
		      		} else { // delete file
		        			fs.unlinkSync(curPath);
		      		}
		    	});
		    	fs.rmdirSync(path);
  		} else {
  			fs.unlinkSync(path);
  		}
  	}
};

function checkPath(target) {
	if(!fs.existsSync(target)) {
		fs.mkdirSync(target, 0777)
	}
}

function getUserFolderPath() {
	return process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : '/var/local')
}

function formatVersion(version) {
	return version.split('.').map((n, i) => Number(n) * Math.pow(2, (2-i))).reduce((a,b) => a + b)
}

function urlTrim(url) {
	return url.replace(/^http:\/\//, '').replace('/\/$/', '')
}

function formatTime(time) {
	var date = new Date(time);
	return [
		date.getFullYear(), '-', 
		padStart(date.getMonth()), '-',
		padStart(date.getDate()), ' ',
		padStart(date.getHours()), ':',
		padStart(date.getMinutes()), ':',
		padStart(date.getSeconds())
	].join('');
}

function padStart(val) {
	if(Number(val) < 10) {
		return '0' + String(val)
	}
	return val
}

/* 
* @param {Object} target 目标对象。 
* @param {Object} source 源对象。 
* @param {boolean} deep 是否复制(继承)对象中的对象。 
* @returns {Object} 返回继承了source对象属性的新对象。 
*/ 
function extend(target, /*optional*/source, /*optional*/deep) { 
	target = target || {}; 
	var sType = typeof source, i = 1, options; 
	if( sType === 'undefined' || sType === 'boolean' ) { 
		deep = sType === 'boolean' ? source : false; 
		source = target; 
		target = this; 
	} 
	if( typeof source !== 'object' && Object.prototype.toString.call(source) !== '[object Function]' ) 
		source = {}; 
	while(i <= 2) { 
		options = i === 1 ? target : source; 
		if( options != null ) { 
			for( var name in options ) { 
				var src = target[name], copy = options[name]; 
				if(target === copy) 
					continue; 
				if(deep && copy && typeof copy === 'object' && !copy.nodeType) 
					target[name] = this.extend(src || 
						(copy.length != null ? [] : {}), copy, deep); 
				else if(copy !== undefined) 
					target[name] = copy; 
				} 
			} 
		i++; 
	} 
	return target; 
};

function getJSON(api, success, fail) {
	getMachineCode((machineCode) => {
		const url = getFullUrl(api) + (api.indexOf('?') == -1 ? '?' : '&') + 'machinecode=' + machineCode
		request({ url: url }, (err, response, body) => {
			if (err) {
				fail && fail()
			} else if(response.statusCode == 200) {
				try {
	    				const data = JSON.parse(body)
	    				if(data && data.code == 200) {
	            			success(data.rst)
		            	} else {
		            		fail && fail()
		            	}
		    		} catch(e) {
		    			fail && fail()
		    		}
	    		} else {
	    			fail && fail()
	    		}
		})
	})
}

function postJSON(api, data, success, fail) {
	getMachineCode((machineCode) => {
		const url = getFullUrl(api)
		data.machinecode = machineCode
		request({ url: url, body: JSON.stringify(data), json: false, method: 'post' }, (err, response, body) => {
			if (err) {
				fail && fail()
			} else if(response.statusCode == 200) {
				try {
	    				const rst = JSON.parse(body)
	    				if(rst && rst.code == 200) {
	            			success(rst.rst)
		            	} else if(rst && rst.msg) {
		            		fail && fail(rst.msg)
		            	} else {
		            		fail && fail()
		            	}
		    		} catch(e) {
		    			fail && fail()
		    		}
	    		} else {
	    			fail && fail()
	    		}
		})
	})
}

let _machineCode = '' // 机器码
//let _machineCode = 'sdoifh' // 机器码
function getMachineCode(callback) {
	if(_machineCode) {
		callback(_machineCode)
		return
	}
	// 获取机器信息
	const os = require('os')
	const isWindows = os.type() == 'Windows_NT'
	if(isWindows) {
		const mac = require('getmac')
		mac.getMac((err, address) => {
			const exec = require('child_process').exec
			execCommand(exec, 'wmic DISKDRIVE get deviceid', (val)=> {
				const diskId = val
				execCommand(exec, 'wmic BaseBoard get SerialNumber', (val)=> {
					const boardId = val
					_machineCode = md5(diskId + boardId + LOCAL_FOLDER)
					callback(_machineCode)
				}, address)
			}, address)
		})
	} else {
		const si = require('systeminformation')
		si.system(data => {
			_machineCode = md5(data.serial + LOCAL_FOLDER)
			callback(_machineCode)
		})
	}
}

function execCommand(exec, command, callback, defaultValue) {
	exec(command, (err, stdout) => {
		if(!err) {
			const results = stdout.split('\n')
			if(results.length > 1) {
				callback(results[1] )
			}
		}
		callback(defaultValue)
	})
}

module.exports = {
	readConfig: readConfig,
	saveConfig: saveConfig,
	extend: extend,
	getFullUrl: getFullUrl,
	readData: readData,
	getJSON: getJSON,
	postJSON: postJSON,
	getMainPath: getMainPath,
	downloadData: downloadData,
	downloadFile: downloadFile,
	createQRCode: createQRCode,
}