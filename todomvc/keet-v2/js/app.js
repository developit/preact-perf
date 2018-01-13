'use strict';

/*global util, todoApp*/

(function () {

	var TODO_APP;

	var App = {
		init: function init() {
			this.todos = util.store('todos-keetjs');
			var filters = ['all', 'active', 'completed'];
			this.filters = filters.map(function (f) {
				return {
					className: '',
					hash: '#/' + f,
					nodeValue: util.camelCase(f)
				};
			});

			TODO_APP = new todoApp(this);

			this.getActive();
			this.getCompleted();
		},
		filterTodos: function filterTodos(prop, compare, notEqual) {
			return this.todos.filter(function (f) {
				return notEqual ? f[prop] !== compare : f[prop] === compare;
			});
		},
		getIndex: function getIndex(id, cb) {
			var idx = this.todos.map(function (f) {
				return f.id;
			}).indexOf(id);
			if (~idx) cb(idx);
		},
		getActive: function getActive() {
			var actives = this.filterTodos('completed', 'completed', true);

			TODO_APP.todoCount.contentUpdate('counter', actives.length.toString());
			TODO_APP.todoCount.contentUpdate('plural', actives.length == 1 ? ' item' : ' items');

			TODO_APP.container.toggle('footer', this.todos.length ? 'block' : 'none');

			TODO_APP.main.toggle('toggleAll', this.todos.length ? 'block' : 'none');
			TODO_APP.container.toggle('main', this.todos.length ? 'block' : 'none');

			return actives;
		},
		getCompleted: function getCompleted() {
			var completed = this.filterTodos('completed', 'completed');

			TODO_APP.footer.toggle('clearCompleted', completed.length ? 'block' : 'none');
			return completed;
		},

		renderFooter: function renderFooter() {
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
		updateFilter: function updateFilter(hash) {
			var self = this;
			this.filters.map(function (f, i, r) {
				f.className = f.hash === hash ? 'selected' : '';
				if (f.className === 'selected') self.page = f.nodeValue;
				r.update(i, f);
			});
			this.updatePage();
		},
		updatePage: function updatePage() {
			var self = this;
			this.todos.map(function (f, i, r) {
				if (self.page === 'Active' && f.completed === 'completed') f.display = 'none';else if (self.page === 'Completed' && f.completed !== 'completed') f.display = 'none';else f.display = 'block';
				if (f.completed === 'completed') f.checked = 'checked';else f.checked = '';
				r.update(i, f);
			});
			util.store('todos-keetjs', this.todos);
			this.updateCheckAll();
			this.focus();
		},
		create: function create(evt) {
			var value = evt.target.value.trim();

			if (evt.which === 13) {
				this.todos.push({
					id: util.genId(),
					title: value,
					completed: '',
					display: '',
					checked: ''
				});

				util.store('todos-keetjs', this.todos);

				document.getElementById('new-todo').value = '';
				this.getActive();
				this.updatePage();
				this.focus();
			}
		},
		editTodos: function editTodos(id, ele) {
			var self = this,
			    val,
			    input,
			    isEsc;
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
						self.todos.update(idx, changed);
						self.focus();
					} else if (ctx.value === '') {
						ele.classList.remove('editing');
						self.todos.splice(idx, 1);
					}
				});
			}

			input.onblur = function () {
				ele.classList.remove('editing');
				if (isEsc) return;else {
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
		todoCheck: function todoCheck(id) {
			var self = this;
			this.getIndex(id, function (idx) {
				var changed = self.todos[idx];
				changed.completed = changed.completed === '' ? 'completed' : '';
				self.todos.update(idx, changed);
				util.store('todos-keetjs', self.todos);
				self.getActive();
				self.updatePage();
				self.getCompleted();
				self.updateCheckAll();
			});

			this.focus();
		},
		destroy: function destroy(id) {
			var self = this;
			this.getIndex(id, function (idx) {
				self.todos.splice(idx, 1);
			});
			util.store('todos-keetjs', this.todos);
			this.getActive();
			this.updateCheckAll();
			this.focus();
		},
		clearCompleted: function clearCompleted() {
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
		focus: function focus() {
			document.getElementById('new-todo').focus();
		},
		updateCheckAll: function updateCheckAll() {
			TODO_APP.main.toggle('toggleAll', this.todos.length ? 'block' : 'none');
			this.page === 'All' ? this.updateCheckPageAll() : this.page === 'Active' ? this.updateCheckPageActive() : this.updateCheckPageCompleted();
		},
		updateCheckPageAll: function updateCheckPageAll() {
			TODO_APP.main.setAttr('toggleAll', 'checked', this.todos.length === this.getCompleted().length ? true : false);
		},
		updateCheckPageActive: function updateCheckPageActive() {
			this.todos.length === this.getCompleted().length ? TODO_APP.main.toggle('toggleAll', 'none') : TODO_APP.main.setAttr('toggleAll', 'checked', '');
		},
		updateCheckPageCompleted: function updateCheckPageCompleted() {
			if (this.todos.length) {
				TODO_APP.main.toggle('toggleAll', this.todos.length === this.getActive().length ? 'none' : 'block');
				TODO_APP.main.setAttr('toggleAll', 'checked', this.todos.length === this.getCompleted().length ? true : false);
			};
		},
		checkedAll: function checkedAll(state, initial) {
			this.todos.forEach(function (f, i, r) {
				if (!initial && state && f.completed !== 'completed') {
					f.completed = 'completed';
				} else if (!initial && !state && f.completed === 'completed') {
					f.completed = '';
				}
			});
			this.updatePage();
		}
	};

	App.init();
})();