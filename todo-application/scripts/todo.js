class TodoApp {
    constructor() {
        this.todos = this.getStoredTodos();
        this.currentFilter = 'all';
        this.initializeEventListeners();
        this.render();
    }

    initializeEventListeners() {
        // Add task
        document.getElementById('add-btn').addEventListener('click', () => this.addTodo());
        document.getElementById('todo-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // Clear buttons
        document.getElementById('clear-completed').addEventListener('click', () => this.clearCompleted());
        document.getElementById('clear-all').addEventListener('click', () => this.clearAll());
    }

    getStoredTodos() {
        const stored = localStorage.getItem('todos');
        return stored ? JSON.parse(stored) : [];
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    addTodo() {
        const input = document.getElementById('todo-input');
        const text = input.value.trim();

        if (text) {
            const todo = {
                id: Date.now(),
                text: text,
                completed: false,
                createdAt: new Date().toISOString()
            };

            this.todos.unshift(todo);
            this.saveTodos();
            this.render();
            input.value = '';
        }
    }

    toggleTodo(id) {
        this.todos = this.todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        this.saveTodos();
        this.render();
    }

    editTodo(id, newText) {
        if (newText.trim()) {
            this.todos = this.todos.map(todo =>
                todo.id === id ? { ...todo, text: newText.trim() } : todo
            );
            this.saveTodos();
            this.render();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }

    clearCompleted() {
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveTodos();
        this.render();
    }

    clearAll() {
        if (confirm('Are you sure you want to delete all tasks?')) {
            this.todos = [];
            this.saveTodos();
            this.render();
        }
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'pending':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.completed).length;
        const pending = total - completed;

        document.getElementById('total-tasks').textContent = `Total: ${total}`;
        document.getElementById('pending-tasks').textContent = `Pending: ${pending}`;
        document.getElementById('completed-tasks').textContent = `Completed: ${completed}`;
    }

    render() {
        const todoList = document.getElementById('todo-list');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            todoList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No tasks found. Add a new task to get started!</p>
                </div>
            `;
        } else {
            todoList.innerHTML = filteredTodos.map(todo => `
                <div class="todo-item ${todo.completed ? 'completed' : ''}">
                    <input 
                        type="checkbox" 
                        class="todo-checkbox" 
                        ${todo.completed ? 'checked' : ''}
                        onchange="app.toggleTodo(${todo.id})"
                    >
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <div class="todo-actions">
                        <button class="edit-btn" onclick="app.startEdit(${todo.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="delete-btn" onclick="app.deleteTodo(${todo.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }

        this.updateStats();
    }

    startEdit(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const todoItem = document.querySelector(`.todo-item input[onchange="app.toggleTodo(${id})"]`).closest('.todo-item');
        const todoText = todoItem.querySelector('.todo-text');
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = todo.text;
        input.className = 'edit-input';
        input.style.cssText = `
            flex: 1;
            padding: 5px 10px;
            border: 2px solid #667eea;
            border-radius: 5px;
            font-size: 1rem;
        `;

        const saveEdit = () => {
            this.editTodo(id, input.value);
        };

        const cancelEdit = () => {
            todoItem.replaceChild(todoText, input);
        };

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
            if (e.key === 'Escape') cancelEdit();
        });

        input.addEventListener('blur', saveEdit);

        todoItem.replaceChild(input, todoText);
        input.focus();
        input.select();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app
const app = new TodoApp();

// Add some sample tasks if empty
if (app.todos.length === 0) {
    app.todos = [
        {
            id: 1,
            text: 'Welcome to your Todo App!',
            completed: false,
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            text: 'Click the checkbox to mark complete',
            completed: false,
            createdAt: new Date().toISOString()
        },
        {
            id: 3,
            text: 'Use filters to view different tasks',
            completed: true,
            createdAt: new Date().toISOString()
        }
    ];
    app.saveTodos();
    app.render();
}
