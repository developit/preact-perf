'use strict';

/*global Keet, util*/

(function (exports) {

	exports.todoApp = function (App) {

		var self = this;

		var cat = util.cat;

		var todo = {
			template: '{{todoapp}}{{info}}',
			todoapp: {
				tag: 'section',
				id: 'todoapp'
			},
			info: {
				tag: 'footer',
				id: 'info',
				template: cat('<p>Double-click to edit a todo</p>', '<p>Created by <a href="https://github.com/syarul">Shahrul Nizam Selamat</a></p>', '<p>Part of <a href="http://todomvc.com">TodoMVC</a></p>')
			}
		};

		var todoListCluster = function todoListCluster() {
			self.todoList = new Keet().mount({
				template: cat('<li k-dblclick="editMode({{id}})" class="{{completed}}" data-id="{{id}}" style="display:{{display}}">', '<div class="view">', '<input k-click="completeTodo({{id}})" class="toggle" type="checkbox" {{checked}}>', '<label>{{title}}</label>', '<button k-click="destroy({{id}})" class="destroy"></button>', '</div>', '<input class="edit" value="{{title}}">', '</li>'),
				list: App.todos,
				editMode: function editMode(id) {
					App.editTodos(id, this);
				},
				destroy: function destroy(id) {
					App.destroy(id);
				},
				completeTodo: function completeTodo(id) {
					App.todoCheck(id);
				}
			}).link('todo-list');
		};

		var mainCluster = function mainCluster() {
			self.main = new Keet().mount({
				template: '{{toggleAll}}{{toggleLabel}}{{todoList}}',
				toggleAll: {
					tag: 'input',
					id: 'toggle-all',
					type: 'checkbox',
					checked: '',
					style: {
						display: 'none'
					},
					'k-click': 'completeAll()'

				},
				toggleLabel: {
					template: '<label for="toggle-all">Mark all as complete</label>'
				},
				todoList: {
					tag: 'ul',
					id: 'todo-list'
				},
				completeAll: function completeAll(evt) {
					App.checkedAll(this.checked);
				}
			}).link('main').cluster(todoListCluster);
		};

		var filtersCluster = function filtersCluster() {
			self.filters = new Keet().mount({
				template: cat('<li k-click="updateUrl({{hash}})">', '<a class="{{className}}" href="{{hash}}">{{nodeValue}}</a>', '</li>'),
				list: App.filters,
				updateUrl: function updateUrl(uri) {
					App.updateFilter(uri);
				}
			}).link('filters');
		};

		var todoCountCluster = function todoCountCluster() {
			self.todoCount = new Keet().mount({
				template: '{{counter}}{{plural}}{{left}}',
				counter: {
					tag: 'strong',
					template: '0'
				},
				plural: {
					template: ' item'
				},
				left: {
					template: ' left'
				}
			}).link('todo-count');
		};

		var footerCluster = function footerCluster() {
			self.footer = new Keet().mount({
				template: '{{todoCount}}{{filters}}{{clearCompleted}}',
				todoCount: {
					tag: 'span',
					id: 'todo-count'
				},
				filters: {
					tag: 'ul',
					id: 'filters'
				},
				clearCompleted: {
					tag: 'button',
					id: 'clear-completed',
					style: {
						display: 'none'
					},
					'k-click': 'clearCompletedClicked()',
					template: 'Clear completed'
				},
				clearCompletedClicked: App.clearCompleted.bind(App)
			}).link('footer').cluster(filtersCluster, todoCountCluster);
		};

		var containerCluster = function containerCluster() {
			self.container = new Keet().mount({
				template: '{{header}}{{main}}{{footer}}',
				header: {
					tag: 'header',
					id: 'header',
					template: cat('<h1>todos</h1>', '<input id="new-todo" k-keydown="create()" placeholder="What needs to be done?" autofocus>')
				},
				main: {
					tag: 'section',
					id: 'main',
					style: {
						display: 'none'
					}
				},
				footer: {
					tag: 'footer',
					id: 'footer',
					style: {
						display: 'none'
					}
				},
				create: App.create.bind(App)
			}).link('todoapp').cluster(mainCluster, footerCluster);
		};

		this.todoapp = new Keet();

		this.todoapp.mount(todo).link('todo').cluster(containerCluster);

		setTimeout(function () {
			App.updateCheckAll();
			App.checkedAll(null, true);
			App.renderFooter();
		}, 0);
	};
})(window);