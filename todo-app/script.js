document.addEventListener("DOMContentLoaded", function () {
    const taskForm = document.getElementById("task-form");
    const submitButton = document.getElementById("submit-button");
    const loadTasksButton = document.getElementById("load-tasks-button");
    let tasks = [];

    async function loadTasks() {
        try {
            const response = await fetch('https://192.168.0.36:7088/api/Tasks');
            if (!response.ok) {
                throw new Error('Ошибка сети при загрузке задач');
            }
            tasks = await response.json();
            displayTasks();
        } catch (error) {
            console.error('Ошибка загрузки задач:', error);
        }
    }

    function displayTasks() {
        const taskLists = document.getElementById("task-lists");
        taskLists.innerHTML = ''; // Очистка списка перед отображением

        if (tasks.length === 0) {
            taskLists.innerHTML = '<p>Задач нет.</p>';
            return;
        }

        tasks.forEach((task, index) => {
            const taskDiv = document.createElement("div");
            taskDiv.className = "task";

            const statusIcon = document.createElement("span");
            statusIcon.innerText = task.completed ? "✔️" : "❌";
            statusIcon.style.cursor = "pointer";
            statusIcon.onclick = () => toggleTaskStatus(index);
            taskDiv.appendChild(statusIcon);

            const title = document.createElement("span");
            title.innerText = ` Название: ${task.title}`;
            taskDiv.appendChild(title);

            const description = document.createElement("p");
            description.innerText = `Описание: ${task.description || 'Нет описания'}`;
            taskDiv.appendChild(description);

            const editButton = document.createElement("button");
            editButton.innerText = "Редактировать";
            editButton.onclick = () => editTask(index);
            taskDiv.appendChild(editButton);

            const deleteButton = document.createElement("button");
            deleteButton.innerText = "Удалить";
            deleteButton.onclick = () => deleteTask(index);
            taskDiv.appendChild(deleteButton);

            taskLists.appendChild(taskDiv);
        });
    }


    async function toggleTaskStatus(index) {
        const task = tasks[index];
        const action = task.completed ? 'incomplete' : 'complete';

        try {
            const response = await fetch(`https://192.168.0.36:7088/api/tasks/${task.id}/${action}`, {
                method: 'PATCH'
            });

            if (!response.ok) {
                throw new Error('Ошибка сети при изменении статуса задачи');
            }

            task.completed = !task.completed;
            displayTasks();
        } catch (error) {
            console.error('Ошибка при изменении статуса задачи:', error);
        }
    }

    function editTask(index) {
        const task = tasks[index];
        document.getElementById("task-title").value = task.title;
        document.getElementById("task-description").value = task.description || '';
        submitButton.innerText = "Сохранить";
        submitButton.setAttribute("data-action", "edit");
        submitButton.setAttribute("data-index", index);
    }

    taskForm.onsubmit = async function (event) {
        event.preventDefault();
        const title = document.getElementById("task-title").value;
        const description = document.getElementById("task-description").value;
        const action = submitButton.getAttribute("data-action");

        if (action === "create") {
            const newTask = { title, description, completed: false };

            try {
                const response = await fetch('https://192.168.0.36:7088/api/tasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newTask)
                });

                if (!response.ok) {
                    throw new Error('Ошибка сети при создании задачи');
                }

                const createdTask = await response.json();
                tasks.push(createdTask);
                displayTasks();
            } catch (error) {
                console.error('Ошибка при создании задачи:', error);
            }
        } else if (action === "edit") {
            const index = submitButton.getAttribute("data-index");
            const task = tasks[index];
            const updatedTask = {
                id: task.id,
                title,
                description,
                completed: task.completed
            };

            try {
                const response = await fetch(`https://192.168.0.36:7088/api/tasks/${task.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedTask)
                });

                if (!response.ok) {
                    throw new Error('Ошибка сети при редактировании задачи');
                }

                tasks[index] = updatedTask;
                submitButton.innerText = "Создать";
                submitButton.setAttribute("data-action", "create");
                submitButton.removeAttribute("data-index");
                displayTasks(); // Обновляем отображение
            } catch (error) {
                console.error('Ошибка при редактировании задачи:', error);
            }
        }

        taskForm.reset();
    };

    async function deleteTask(index) {
        const taskId = tasks[index].id;

        try {
            const response = await fetch(`https://192.168.0.36:7088/api/Tasks/${taskId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Ошибка сети при удалении задачи');
            }

            tasks.splice(index, 1);
            displayTasks();
        } catch (error) {
            console.error('Ошибка при удалении задачи:', error);
        }
    }

    loadTasksButton.addEventListener("click", loadTasks);

    loadTasks();
});
