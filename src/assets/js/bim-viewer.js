//jQuery.support.cors = true;

// Messenger 类原型定义
window.Messenger = (function() {
	var prefix = "[PROJECT_NAME]", supportPostMessage = 'postMessage' in window;
	// Target 类定义
	function Target(target, name) {
		var errMsg = '';
		if (arguments.length < 2) {
			errMsg = 'target error - target and name are both requied';
		} else if (typeof target != 'object') {
			errMsg = 'target error - target itself must be window object';
		} else if (typeof name != 'string') {
			errMsg = 'target error - target name must be string type';
		}
		if (errMsg) {
			throw new Error(errMsg);
		}
		this.target = target;
		this.name = name;
	}
	// 根据浏览器页面是否支持 postMessage 来定义消息发送函数
	if (supportPostMessage) {
		Target.prototype.send = function(msg) {
			this.target.postMessage(prefix + msg, '*');
		};
	} else {
		Target.prototype.send = function(msg) {
			// 查找预定义的消息传递函数
			var targetFunc = window.navigator[prefix + this.name];
			if (typeof targetFunc == 'function') {
				targetFunc(prefix + msg, window);
			} else {
				throw new Error("target callback function is not defined");
			}
		};
	}
	// Messenger 类定义
	function Messenger(name) {
		this.targets = {};
		this.name = name;
		this.listenFunc = [];
		this.initListen();
	}
	Messenger.prototype.addTarget = function(target, name) {
		var targetObj = new Target(target, name);
		this.targets[name] = targetObj;
	};
	Messenger.prototype.initListen = function() {
		var self = this;
		self.generalCallback = function(msg) {
			if (typeof msg == 'object' && msg.data) {
				msg = msg.data;
			}
			msg = msg.slice(prefix.length); // 去掉 msg 中的 prefix
			for (var i = 0; i < self.listenFunc.length; i++) {
				self.listenFunc[i](msg);
			}
		};
		// 根据浏览器是否支持 postMessage 来设置消息事件回调函数
		if (supportPostMessage) {
			if ('addEventListener' in document) {
				window.addEventListener('message', self.generalCallback, false);
			} else if ('attachEvent' in document) {
				window.attachEvent('onmessage', self.generalCallback);
			}
		} else {
			window.navigator[prefix + this.name] = self.generalCallback;
		}
	};
	Messenger.prototype.listen = function(callback) {
		this.listenFunc.push(callback);
	};
	Messenger.prototype.clear = function() {
		this.listenFunc = [];

        if ( supportPostMessage ){
            if ( 'removeEventListener' in document ) {
                window.removeEventListener('message', self.generalCallback, false);
            } else if ( 'detachEvent' in document ) {
                window.detachEvent('onmessage', self.generalCallback);
            }
        } else {
            // 兼容IE 6/7
            delete window.navigator[prefix + this.name];
        }
	};
	Messenger.prototype.send = function(msg) {
		var targets = this.targets, target;
		for (target in targets) {
			if (targets.hasOwnProperty(target)) { // 确保 target 为字典项属性
				targets[target].send(msg);
			}
		}
	};
	return Messenger;
})();

// 定义 JSON 对象
if (!this.JSON) {
	this.JSON = {};
}
// 初始化各种JSON转换函数
(function() {
	function f(n) {
		return n < 10 ? '0' + n : n;
	}
	if (typeof Date.prototype.toJSON !== 'function') {
		Date.prototype.toJSON = function(key) {

			return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-'
					+ f(this.getUTCMonth() + 1) + '-' + f(this.getUTCDate())
					+ 'T' + f(this.getUTCHours()) + ':'
					+ f(this.getUTCMinutes()) + ':' + f(this.getUTCSeconds())
					+ 'Z' : null;
		};
		String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function(
				key) {
			return this.valueOf();
		};
	}
	var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g
			, escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g
			, gap, indent, meta = { // table
									// of
									// character
									// substitutions
			'\b' : '\\b',
			'\t' : '\\t',
			'\n' : '\\n',
			'\f' : '\\f',
			'\r' : '\\r',
			'"' : '\\"',
			'\\' : '\\\\'
		}, rep;
	function quote(string) {
		escapable.lastIndex = 0;
		return escapable.test(string) ? '"'
				+ string.replace(escapable,
						function(a) {
							var c = meta[a];
							return typeof c === 'string' ? c : '\\u'
									+ ('0000' + a.charCodeAt(0).toString(16))
											.slice(-4);
						}) + '"' : '"' + string + '"';
	}
	function str(key, holder) {
		var i, // The loop counter.
		k, // The member key.
		v, // The member value.
		length, mind = gap, partial, value = holder[key];
		if (value && typeof value === 'object'
				&& typeof value.toJSON === 'function') {
			value = value.toJSON(key);
		}
		if (typeof rep === 'function') {
			value = rep.call(holder, key, value);
		}
		switch (typeof value) {
		case 'string':
			return quote(value);
		case 'number':
			return isFinite(value) ? String(value) : 'null';
		case 'boolean':
		case 'null':
			return String(value);
		case 'object':
			if (!value) {
				return 'null';
			}
			gap += indent;
			partial = [];
			if (Object.prototype.toString.apply(value) === '[object Array]') {
				length = value.length;
				for (i = 0; i < length; i += 1) {
					partial[i] = str(i, value) || 'null';
				}
				v = partial.length === 0 ? '[]' : gap ? '[\n' + gap
						+ partial.join(',\n' + gap) + '\n' + mind + ']' : '['
						+ partial.join(',') + ']';
				gap = mind;
				return v;
			}
			if (rep && typeof rep === 'object') {
				length = rep.length;
				for (i = 0; i < length; i += 1) {
					k = rep[i];
					if (typeof k === 'string') {
						v = str(k, value);
						if (v) {
							partial.push(quote(k) + (gap ? ': ' : ':') + v);
						}
					}
				}
			} else {
				for (k in value) {
					if (Object.hasOwnProperty.call(value, k)) {
						v = str(k, value);
						if (v) {
							partial.push(quote(k) + (gap ? ': ' : ':') + v);
						}
					}
				}
			}
			v = partial.length === 0 ? '{}' : gap ? '{\n' + gap
					+ partial.join(',\n' + gap) + '\n' + mind + '}' : '{'
					+ partial.join(',') + '}';
			gap = mind;
			return v;
		}
	}
	if (typeof JSON.stringify !== 'function') {
		JSON.stringify = function(value, replacer, space) {
			var i;
			gap = '';
			indent = '';
			if (typeof space === 'number') {
				for (i = 0; i < space; i += 1) {
					indent += ' ';
				}
			} else if (typeof space === 'string') {
				indent = space;
			}
			rep = replacer;
			if (replacer
					&& typeof replacer !== 'function'
					&& (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
				throw new Error('JSON.stringify');
			}
			return str('', {
				'' : value
			});
		};
	}
	if (typeof JSON.parse !== 'function') {
		JSON.parse = function(text, reviver) {
			var j;
			function walk(holder, key) {
				var k, v, value = holder[key];
				if (value && typeof value === 'object') {
					for (k in value) {
						if (Object.hasOwnProperty.call(value, k)) {
							v = walk(value, k);
							if (v !== undefined) {
								value[k] = v;
							} else {
								delete value[k];
							}
						}
					}
				}
				return reviver.call(holder, key, value);
			}
			text = String(text);
			cx.lastIndex = 0;
			if (cx.test(text)) {
				text = text.replace(cx,
						function(a) {
							return '\\u'
									+ ('0000' + a.charCodeAt(0).toString(16))
											.slice(-4);
						});
			}
			if (/^[\],:{}\s]*$/
					.test(text
							.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
							.replace(
									/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
									']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
				j = eval('(' + text + ')');
				return typeof reviver === 'function' ? walk({
					'' : j
				}, '') : j;
			}
			throw new SyntaxError('JSON.parse');
		};
	}
}());


var BimViewer = TiViewer;//Backward compatible

//clientMsgID, 接收Nebula发送过来消息的客户端messenger的ID。
function TiViewer(obj,clientID) {
	this.iframeObject = obj;
	this.clientID=clientID||'BimEmbedParent';
	this.messenger = new Messenger('BimEmbedParent');
	this.onSelect = null; // (names)
	this.onRemove = null; // (username, guid, title, content)
	this.onSave = null; // (username, guid, title, content, isNew)
	this.onLoad = null; // ()
	this.onSnapshot = null; // (url)
	this.onChangeVisibleSet = null;
	this.getCameraCallback = null; // (camera_string)
	this.onSearch = null;
	this.onLabelSwitch = null;
	this.onSnapshotsSwitch = null;
	this.onViewSync = null;
	this.onLoadFile = null;
	this.onLoadSnapShot = null;
	this.onLoadSnapshotFile = null;
	this.onLimitLabel = null;
	this.onGetAnchorInfo = null;
	this.onSelectionCanceled = null;

	this.messenger.addTarget(this.iframeObject.contentWindow, 'BimEmbed');

	this.test = function() {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "test"
		}));
	};
	this.viewSync = function(camera) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "viewSync",
			"camera" : camera
		}));
	}

	this.setUserName = function(username) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setUserName",
			"username" : username
		}));
	};
	this.setSelectionCountMax = function(content) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setSelectionCountMax",
			"content" : content
		}));
	}
	this.createFile = function(filename) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "createFile",
			"filename" : filename
		}));
	};
	this.renameFile = function(filename, file_idx) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "renameFile",
			"filename" : filename,
			"file_idx" : file_idx
		}));
	};
	this.activeLabel = function(file_idx, label_idx) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "activeLabel",
			"file_idx" : file_idx,
			"label_idx" : label_idx
		}));
	};
	this.removeLabel = function(file_idx, label_idx) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "removeLabel",
			"file_idx" : file_idx,
			"label_idx" : label_idx
		}));
	};
	this.saveLabelFile = function(file_idx) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "saveLabelFile",
			"file_idx" : file_idx
		}));
	};
	this.toggleLabelManager = function() {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "toggleLabelManager"
		}));
	}
	this.beginScreenLabel = function() {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "beginScreenLabel"
		}));
	};
	this.beginModifyLabel = function() {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "beginModifyLabel"
		}));
	};
	this.confirmScreenLabel = function() {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "confirmScreenLabel"
		}));
	};
	this.confirmModifyLabel = function() {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "confirmModifyLabel"
		}));
	};
	this.cancelScreenLabel = function() {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "cancelScreenLabel"
		}));
	};
	this.setLabelType = function (type, file_idx, label_idx) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setLabelType",
			"type" : type,
			"file_idx" : file_idx,
			"label_idx" : label_idx
		}));
	};
	this.setLabelColor = function (color, file_idx, label_idx) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setLabelColor",
			"color" : color,
			"file_idx" : file_idx,
			"label_idx" : label_idx
		}));
	};
	this.setLabelFont = function (font, file_idx, label_idx) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setLabelFont",
			"font" : font,
			"file_idx" : file_idx,
			"label_idx" : label_idx
		}));
	};
	this.setLabelFontSize = function (font_size, file_idx, label_idx) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setLabelFontSize",
			"font_size" : font_size,
			"file_idx" : file_idx,
			"label_idx" : label_idx
		}));
	};
	this.setLabelText = function (text, file_idx, label_idx) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setLabelText",
			"text" : text,
			"file_idx" : file_idx,
			"label_idx" : label_idx
		}));
	}
	this.loadFile = function(content, username, guid) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "loadFile",
			"content" : content,
			"username" : username,
			"guid" : guid
		}));
	};
	this.loadFileAndShow = function(content, username, guid) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "loadFileAndShow",
			"content" : content,
			"username" : username,
			"guid" : guid
		}));
	};
	this.unloadFile = function(username, guid) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "unloadFile",
			"username" : username,
			"guid" : guid
		}));
	};
	this.setDisplayMode = function(h) { // { uid: mode }
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setDisplayMode",
			setting : JSON.stringify(h.ModelInfo),
			bZoomTo:h.bZoomTo,
			mClr:(h.mClr ? JSON.stringify(h.mClr) : null)
			,bHideAllElem:h.bHideAllElem
		}));
	};
	this.setModelColor = function(h) { // { uid: mode }
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setModelColor",
			setting : JSON.stringify(h)
		}));
	};
	this.setModelCompactUsingColor = function(h) { // { uid: mode }
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setModelCompactUsingColor",
			setting : JSON.stringify(h)
		}));
	};
	this.setDefaultColorSwitch = function(h) { // { uid: mode }
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setDefaultColorSwitch",
			setting : JSON.stringify(h)
		}));
	};
	this.setGroupNames = function(group_name_set, length) { // { uid: mode }
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setGroupNames",
			"group_name_set" : group_name_set,
			"length" : length
		}));
	};

	this.selectGroups = function(group_name_set, length) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "selectGroups",
			"group_name_set" : group_name_set,
			"length" : length
		}));
	};
	//外部命令接口
	this.tiCmd = function(sCmd) {
		// "snapshots":false}
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "tiCmd",
			data : sCmd
		}));
	};

	this.getCamera = function(callback) { // function (camera_string)
		if (callback)
			this.getCameraCallback = callback;
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "getCamera"
		}));
	};
	this.setCamera = function(camera_string) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setCamera",
			content : camera_string
		}));
	};
	this.setCameraFront = function() {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setCameraFront"
		}));
	};
	this.setCameraBack = function() {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setCameraBack"
		}));
	};
	this.setCameraLeft = function() {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setCameraLeft"
		}));
	};
	this.setCameraRight = function() {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setCameraRight"
		}));
	};
	this.setCameraTop = function() {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setCameraTop"
		}));
	};
	this.setCameraBottom = function() {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setCameraBottom"
		}));
	};
	this.setCameraIsometric = function() {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setCameraIsometric"
		}));
	};
	this.getSnapshot = function(callback) {
		if (callback)
			this.onSnapshot = callback;
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "getSnapshot"
		}));
	};
	this.loadSnapshotFile = function(content, username, guid) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "loadSnapshotFile",
			"content" : content,
			"username" : username,
			"guid" : guid
		}));
	};
	this.loadSnapshotFileAndShow = function(content, username, guid) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "loadSnapshotFileAndShow",
			"content" : content,
			"username" : username,
			"guid" : guid
		}));
	};
	this.unloadSnapshotFile = function(username, guid) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "unloadSnapshotFile",
			"username" : username,
			"guid" : guid
		}));
	};
	this.loadUnitMapTable = function(unitMapTable) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "loadUnitMapTable",
			"unitMapTable" : unitMapTable
		}));
	};
	this.loadDefinitionMapTable = function(definitionMapTable) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "loadDefinitionMapTable",
			"definitionMapTable" : definitionMapTable
		}));
	};
	this.setMouseModeMove = function() {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setMouseModeMove"
		}));
	};
	this.setMouseModeRotate = function() {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setMouseModeRotate"
		}));
	};
	this.setMouseModeScale = function() {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setMouseModeScale"
		}));
	};
	this.setMouseModeSelect = function() {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setMouseModeSelect"
		}));
	};
	this.toggleClip = function() {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "toggleClip"
		}));
	};
	this.toggleGrid = function() {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "toggleGrid"
		}));
	};
	this.zoomToTarget = function() {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "zoomToTarget"
		}));
	};
	this.toggleLinearMeasure = function() {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "toggleLinearMeasure"
		}));
	}
	this.zoomToConflicts = function(id1, id2, strpoint) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "zoomToConflicts",
			"id1" : id1,
			"id2" : id2,
			"strpoint" : strpoint
		}));
	};
	this.drawlines = function(strpoints) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "drawLines",
			"strpoints" : strpoints
		}));
	};
	this.limitLabel = function(msg) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "limitLabel",
			"type" : msg.type,
			"content" : msg.content
		}));
	};
	this.setElementColor = function(color_sets) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setElementColor",
			"content" : color_sets
		}));
	};
	this.setElementVisible = function(elemsVisInfo) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setElementVisible",
			"content" : elemsVisInfo
		}));
	};
	this.changeElementVisible = function(elemsVisInfo) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "changeElementVisible",
			"content" : elemsVisInfo
		}));
	};
	this.setanchor = function(anchor_sets) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setAnchor",
			"content" : anchor_sets
		}));
	};
	this.updateShowAnchorUI = function(bShow) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "updateShowAnchorUI",
			"bShow" : bShow
		}));
	};
	this.changeElementColor = function(color_sets) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "changeElementColor",
			"content" : color_sets
		}));
	};
	this.updateElementColor = function(instances_color) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "updateElementColor",
			"content" : instances_color
		}));
	};
	this.setLabelPageConfig = function(content) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "setLabelPageConfig",
			"content" : content
		}));
	};
	this.clearAnchor = function(content) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "clearAnchor",
			"content" : content
		}));
	};
	// 根据构件信息选择构件实例
	this.selectByElementInfo = function(content) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "selectByElementInfo",
			"content" : content
		}));
	};
	// 取消已选中构件
	this.cancelSelectedElement = function(content,m2e) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "cancelSelectedElement",
			"content" : content,
			"m2e":m2e
		}));
	};
	this.onresize = function(content) {
		this.messenger.targets['BimEmbed'].send(JSON.stringify({
			function_name : "onresize",
			"content" : content
		}));
	}
	obj.objectReference = this;
	this.messenger.listen(function(msg) {
		msg = JSON.parse(msg);
		var thisref = obj.objectReference;
		if (msg.function_name == "onSelect") {
			if (thisref.onSelect) {
				if(msg.clientID==thisref.clientID)
					thisref.onSelect(msg.names);
			}
		} else if (msg.function_name == "onRemove") {
			if (thisref.onRemove)
				thisref.onRemove(msg.username, msg.guid, msg.title,
								msg.content);
		} else if (msg.function_name == "onSave") {
			if (thisref.onSave)
				thisref.onSave(msg.username, msg.guid, msg.title, msg.content,
						msg.isNew);
		} else if (msg.function_name == "onLoad") {
			if (thisref.onLoad)
				thisref.onLoad(eval(msg.views));
		} else if (msg.function_name == "getCameraCallback") {
			if (thisref.getCameraCallback)
				thisref.getCameraCallback(msg.content);
		} else if (msg.function_name == "getSnapshotCallback") {
			if (thisref.onSnapshot)
				thisref.onSnapshot(msg.content);
		} else if (msg.function_name == "onRemoveSnapshotFile") {
			if (thisref.onRemoveSnapshotFile)
				thisref.onRemoveSnapshotFile(msg.username, msg.guid, msg.title,
						msg.content);
		} else if (msg.function_name == "onSaveSnapshotFile") {
			if (thisref.onSaveSnapshotFile)
				thisref.onSaveSnapshotFile(msg.username, msg.guid, msg.title,
						msg.content, msg.isNew);
		} else if (msg.function_name == "onLoadSnapshotFile") {
			if (thisref.onLoadSnapshotFile)
				thisref.onLoadSnapshotFile(eval(msg.content));
		} else if (msg.function_name == "onChangeVisibleSet") {
			if (thisref.onChangeVisibleSet)
				thisref.onChangeVisibleSet(eval(msg.visible_set));
		} else if (msg.function_name == "onSearch") {
			if (thisref.onSearch)
				thisref.onSearch(msg.keyword);
		} else if (msg.function_name == "onLabelSwitch") {
			if (thisref.onLabelSwitch)
				thisref.onLabelSwitch(msg.guid,msg.content);
		} else if (msg.function_name == "onSnapshotsSwitch") {
			if (thisref.onSnapshotsSwitch)
				thisref.onSnapshotsSwitch(msg.guid,msg.content);
		} else if (msg.function_name == "onViewSync") {
			if (thisref.onViewSync)
				thisref.onViewSync(msg.camera);
		} else if (msg.function_name == "onLoadFile") {
			if (thisref.onLoadFile) {
				thisref.onLoadFile(msg.content);
			}
		} else if (msg.function_name == "onLimitLabel") {
			if (thisref.onLimitLabel) {
				thisref.onLimitLabel(eval(msg));
			}
		} else if (msg.function_name == "onGetAnchorInfo") {
			if (thisref.onGetAnchorInfo) {
				thisref.onGetAnchorInfo(msg.content);
			}
		} else if (msg.function_name == "onSelectionCanceled") {
			if (thisref.onSelectionCanceled) {
				thisref.onSelectionCanceled(msg.names);
			}
		} else if (msg.function_name == "onNotify") {
			if (thisref.onNotify) {
				thisref.onNotify(msg.param);
			}
		}
	});
	this.registerNotify = function( onNotify ) {
		this.onNotify = onNotify;
		
		return this;
	}
	this.register = function(onload, onselect, onremove, onsave, onsnapshot,
			onremovesnapshot, onsavesnapshot, onchangevisibleset, onsearch,
			onlabelswitch, onsnapshotsswitch, onViewSync, onloadfile,
			onloadsnapshotfile, onlimitlabel, ongetanchorinfo,
			onselectioncanceled, onNotify) {
		this.onLoad = onload;
		this.onLoadFile = onloadfile;
		this.onLoadSnapshotFile = onloadsnapshotfile;
		this.onSelect = onselect;
		this.onRemove = onremove;
		this.onSave = onsave;
		this.onSnapshot = onsnapshot;
		this.onRemoveSnapshotFile = onremovesnapshot;
		this.onSaveSnapshotFile = onsavesnapshot;
		this.onChangeVisibleSet = onchangevisibleset;
		this.onSearch = onsearch;
		this.onLabelSwitch = onlabelswitch;
		this.onSnapshotsSwitch = onsnapshotsswitch;
		this.onViewSync = onViewSync;
		this.onLimitLabel = onlimitlabel;
		this.onGetAnchorInfo = ongetanchorinfo;
		this.onSelectionCanceled = onselectioncanceled;
		this.onNotify = onNotify;
		return this;
	};
	return this;
};