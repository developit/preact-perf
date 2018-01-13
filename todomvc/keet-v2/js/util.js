'use strict';

(function (exports) {
	exports.util = {
		store: function store(namespace, data) {
			if (arguments.length > 1) {
				return localStorage.setItem(namespace, JSON.stringify(data));
			} else {
				var store = localStorage.getItem(namespace);
				return store && JSON.parse(store) || [];
			}
		},
		camelCase: function camelCase(s) {
			return s.charAt(0).toUpperCase() + s.slice(1);
		},
		genId: function genId() {
			return (new Date().getTime() * Math.round(Math.random() * 0x1000)).toString(32);
		},
		cat: function cat() {
			return [].slice.call(arguments).join('');
		}
	};
})(window);