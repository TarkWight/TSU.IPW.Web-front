document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoList = document.getElementById('todo-list');
    const saveBtn = document.getElementById('save-btn');
    const loadBtn = document.getElementById('load-btn');
    const noTasksMsg = document.getElementById('no-tasks-msg');

    let todos = [];

    function checkTasks() {
        if (todos.length === 0) {
            noTasksMsg.style.display = 'block';
            todoList.style.display = 'none';
        } else {
            noTasksMsg.style.display = 'none';
            todoList.style.display = 'block';
        }
    }

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTodoTitle = document.getElementById('new-todo-title').value.trim();
        const newTodoBody = document.getElementById('new-todo-body').value.trim();

        if (newTodoTitle && newTodoBody) {
            const newTodo = { title: newTodoTitle, body: newTodoBody, completed: false };
            todos.push(newTodo);
            renderTodos();
            document.getElementById('new-todo-title').value = '';
            document.getElementById('new-todo-body').value = '';
        }
    });

    function renderTodos() {
        todoList.innerHTML = '';
        todos.forEach((todo, index) => {
            const todoItem = document.createElement('li');
            todoItem.className = todo.completed ? 'completed' : '';

            todoItem.innerHTML = `
                <input type="checkbox" class="checkbox" ${todo.completed ? 'checked' : ''}>
                <div class="todo-title" contenteditable="false">${todo.title}</div>
                <div class="todo-body" contenteditable="false">${todo.body}</div>
                <div>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;

            todoItem.querySelector('.checkbox').addEventListener('click', () => {
                todo.completed = !todo.completed;
                renderTodos();
            });

            todoItem.querySelector('.delete-btn').addEventListener('click', () => {
                todos.splice(index, 1);
                renderTodos();
            });

            const editBtn = todoItem.querySelector('.edit-btn');
            const titleElement = todoItem.querySelector('.todo-title');
            const bodyElement = todoItem.querySelector('.todo-body');

            editBtn.addEventListener('click', () => {
                if (editBtn.textContent === 'Edit') {
                    titleElement.contentEditable = true;
                    bodyElement.contentEditable = true;
                    todoItem.classList.add('editing');
                    editBtn.textContent = 'Save';
                } else {
                    titleElement.contentEditable = false;
                    bodyElement.contentEditable = false;
                    todoItem.classList.remove('editing');
                    editBtn.textContent = 'Edit';

                    todo.title = titleElement.textContent.trim();
                    todo.body = bodyElement.textContent.trim();
                    renderTodos();
                }
            });

            todoList.appendChild(todoItem);
        });
        checkTasks();
    }

    saveBtn.addEventListener('click', () => {
        const data = JSON.stringify(todos);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'todos.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    loadBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.addEventListener('change', () => {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    todos = JSON.parse(reader.result);
                    renderTodos();
                } catch (e) {
                    alert('Error loading tasks');
                }
            };
            reader.readAsText(file);
        });
        input.click();
    });

    checkTasks();
});
