/*global util, todoApp*/

(function () {
	'use strict';

	var App = {
		init: function() {
			this.todos = util.store('todos-keetjs');
			var filters = ['all', 'active', 'completed'];
			this.filters = filters.map(function (f) {
				return {
					className: '',
					hash: '#/' + f,
					nodeValue: util.camelCase(f)
				};
			});

			var props = ['complete', 'count', 'length', 'base', 'toggle'];

			util.genObj.apply(this, props);

			this.toggle['attr-k-click'] = 'completeAll()'
			this.toggle['attr-type'] = 'checkbox'
			this.toggle['css-display'] = 'none'
			this.toggle['el-checked'] = false

			this.getActive();
			this.getCompleted();
			new todoApp(this);
		},
		filterTodos: function(prop, compare, notEqual) {
			return this.todos.filter(function (f) {
				return notEqual ? f[prop] !== compare : f[prop] === compare;
			});
		},
		getIndex: function(id, cb) {
			var idx = this.todos.map(function (f) {
				return f.id;
			}).indexOf(id);
			if (~idx) cb(idx);
		},
		getActive: function() {
			var actives = this.filterTodos('completed', 'completed', true);

			this.count['value'] = this.updateCount(actives.length);
			this.length['css-display'] = this.todos.length ? 'block' : 'none';
			this.base['css-display'] = this.todos.length ? 'block' : 'none';
			return actives;
		},
		getCompleted: function() {
			var completed = this.filterTodos('completed', 'completed');

			this.complete['css-display'] = completed.length ? 'block' : 'none';
			return completed;
		},

		renderFooter: function() {
			var self = this;
			if (window.location.hash !== '') {
				this.updateFilter(window.location.hash);
			} else {
				this.updateFilter('#/all');
				window.history.pushState({}, null, '#/all');
			}

			window.onpopstate = function () {
				self.updateFilter(window.location.hash);
			};
		},
		updateFilter: function(hash) {
			var self = this;
			this.filters.map(function (f, i, r) {
				f.className = f.hash === hash ? 'selected' : '';
				if (f.className === 'selected') self.page = f.nodeValue;
				r.assign(i, f);
			});
			this.updatePage();
		},
		updatePage: function() {
			var self = this;
			this.todos.map(function (f, i, r) {
				if (self.page === 'Active' && f.completed === 'completed') f.display = 'none';
				else if (self.page === 'Completed' && f.completed !== 'completed') f.display = 'none';
				else f.display = 'block';
				r.assign(i, f);
			});
			util.store('todos-keetjs', this.todos);
			this.updateCheckAll();
			this.focus();
		},
		updateCount: function(count) {
			return util.cat('<strong>', count, '</strong> ', count === 1 ? 'item' : 'items', ' left');
		},
		create: function(e, evt) {
			var value = e.trim();

			if (evt.which === 13) {
				this.todos.push({
					id: util.genId(),
					title: value,
					completed: '',
					display: ''
				});

				util.store('todos-keetjs', this.todos);

				document.getElementById('new-todo').value = '';
				this.getActive();
				this.updatePage();
				this.updateCheckAll();
				this.focus();
			}
		},
		editTodos: function(id, ele) {
			var self = this
			,	val
			,	input
			,	isEsc;
			ele.classList.add('editing');
			input = ele.querySelector('.edit');
			val = input.value;
			input.value = '';
			input.focus();
			input.value = val;

			function saveEditing() {
				var ctx = this;
				self.getIndex(id, function (idx) {
					if (ctx.value !== '') {
						ele.classList.remove('editing');
						var changed = self.todos[idx];
						changed.title = ctx.value.trim();
						self.todos.assign(idx, changed);
						self.focus();
					} else if (ctx.value === '') {
						ele.classList.remove('editing');
						self.todos.splice(idx, 1);
					}
				});
			}

			input.onblur = function () {
				ele.classList.remove('editing');
				if (isEsc) return;
				else {
					saveEditing.call(this);
					isEsc = false;
				}
			};

			input.onkeydown = function (e) {
				if (e.which === 13) {
					saveEditing.call(this);
				} else if (e.which === 27) {
					isEsc = true;
					ele.classList.remove('editing');
				}
			};
		},
		todoCheck: function(id) {
			var self = this;
			this.getIndex(id, function (idx) {
				var changed = self.todos[idx];
				changed.completed = changed.completed === '' ? 'completed' : '';
				self.todos.assign(idx, changed);
				util.store('todos-keetjs', self.todos);
				self.getActive();
				self.updatePage();
				self.getCompleted();
				self.updateCheckAll();
			});

			this.focus();
		},
		destroy: function(id) {
			var self = this;
			this.getIndex(id, function (idx) {
				self.todos.splice(idx, 1);
			});
			util.store('todos-keetjs', this.todos);
			this.getActive();
			this.updateCheckAll();
			this.focus();
		},
		clearCompleted: function() {
			var len = this.todos.length;
			while (len--) {
				var idx = this.todos.map(function (f, i) {
					return f.completed;
				}).indexOf('completed');

				if (~idx) this.todos.splice(idx, 1);
				util.store('todos-keetjs', this.todos);
				this.getActive();
			}
			this.updateCheckAll();
			this.focus();
		},
		focus: function() {
			document.getElementById('new-todo').focus();
		},
		updateCheckAll: function() {
			this.toggle['css-display'] = this.todos.length ? 'block' : 'none';
			this.page === 'All' ? this.updateCheckPageAll() : this.page === 'Active' ? this.updateCheckPageActive() : this.updateCheckPageCompleted();
		},
		updateCheckPageAll: function() {
			this.toggle['el-checked'] = this.todos.length === this.getCompleted().length ? true : false;
		},
		updateCheckPageActive: function() {
			this.todos.length === this.getCompleted().length ?  this.toggle['css-display'] = 'none' : this.toggle['el-checked'] = false;
		},
		updateCheckPageCompleted: function() {
			if(this.todos.length) {
				this.toggle['css-display'] = this.todos.length === this.getActive().length ? 'none' : 'block';
				this.toggle['el-checked'] = this.todos.length === this.getCompleted().length ? true : false;
			};
		},
		checkedAll: function(todoList, state, initial) {
			this.todos.forEach(function (f, i) {
				if (!initial && state && f.completed !== 'completed') todoList.evented(i, 'class', 'toggle', { click: true });
				else if (!initial && !state && f.completed === 'completed') todoList.evented(i, 'class', 'toggle', { click: true });
				else if (initial && f.completed === 'completed') todoList.evented(i, 'class', 'toggle', { checked: true });
			});
			this.focus();
		}
	};

	App.init();
})();