(function (exports) {
	'use strict';

	exports.util = {
		store: function(namespace, data) {
			if (arguments.length > 1) {
				return localStorage.setItem(namespace, JSON.stringify(data));
			} else {
				var store = localStorage.getItem(namespace);
				return store && JSON.parse(store) || [];
			}
		},
		camelCase: function(s) {
			return s.charAt(0).toUpperCase() + s.slice(1);
		},
		genId: function() {
			return (new Date().getTime() * Math.round(Math.random() * 0x1000)).toString(32);
		},
		cat: function() {
			return [].slice.call(arguments).join('');
		},
		genObj: function(){
			var self = this
			var argv = [].slice.call(arguments)
			argv.forEach(function(f){
				self[f] = {}
			})
		}
	};
})(window);