document.addEventListener("DOMContentLoaded", function () {
    const taskForm = document.getElementById("task-form");
    const submitButton = document.getElementById("submit-button");
    const loadTasksButton = document.getElementById("load-tasks-button");
    let tasks = [];

    // Функция для загрузки задач с сервера
    async function loadTasks() {
        try {
            const response = await fetch('https://192.168.0.36:7088/api/Tasks'); // URL вашего API
            if (!response.ok) {
                throw new Error('Ошибка сети при загрузке задач');
            }
            tasks = await response.json();
            displayTasks(); // Обновляем отображение после загрузки
        } catch (error) {
            console.error('Ошибка загрузки задач:', error);
        }
    }

    // Функция для отображения задач
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

            // Иконка статуса (выполнено/не выполнено)
            const statusIcon = document.createElement("span");
            statusIcon.innerText = task.completed ? "✔️" : "❌";
            statusIcon.style.cursor = "pointer";
            statusIcon.onclick = () => toggleTaskStatus(index);
            taskDiv.appendChild(statusIcon);

            // Название задачи
            const title = document.createElement("span");
            title.innerText = task.title;
            taskDiv.appendChild(title);

            // Кнопка редактирования
            const editButton = document.createElement("button");
            editButton.innerText = "Редактировать";
            editButton.onclick = () => editTask(index);
            taskDiv.appendChild(editButton);

            // Кнопка удаления
            const deleteButton = document.createElement("button");
            deleteButton.innerText = "Удалить";
            deleteButton.onclick = () => deleteTask(index);
            taskDiv.appendChild(deleteButton);

            taskLists.appendChild(taskDiv);
        });
    }

    // Функция для изменения статуса задачи
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

            task.completed = !task.completed; // Обновляем локальный статус
            displayTasks(); // Обновляем отображение задач
        } catch (error) {
            console.error('Ошибка при изменении статуса задачи:', error);
        }
    }

    // Функция для редактирования задачи
    function editTask(index) {
        const task = tasks[index];
        document.getElementById("task-title").value = task.title;
        document.getElementById("task-description").value = task.description || '';
        submitButton.innerText = "Сохранить";
        submitButton.setAttribute("data-action", "edit");
        submitButton.setAttribute("data-index", index);
    }

    // Функция для добавления новой задачи или редактирования существующей
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
                tasks.push(createdTask); // Добавляем созданную задачу в локальный список
                displayTasks(); // Обновляем отображение
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

                tasks[index] = updatedTask; // Обновляем задачу в локальном массиве
                submitButton.innerText = "Создать";
                submitButton.setAttribute("data-action", "create");
                submitButton.removeAttribute("data-index");
                displayTasks(); // Обновляем отображение
            } catch (error) {
                console.error('Ошибка при редактировании задачи:', error);
            }
        }

        taskForm.reset(); // Сбрасываем форму
    };

    // Функция для удаления задачи
    async function deleteTask(index) {
        const taskId = tasks[index].id;

        try {
            const response = await fetch(`https://192.168.0.36:7088/api/Tasks/${taskId}`, {
                method: 'DELETE' // Удаление задачи
            });

            if (!response.ok) {
                throw new Error('Ошибка сети при удалении задачи');
            }

            tasks.splice(index, 1); // Удаляем задачу из локального массива
            displayTasks(); // Обновляем отображение
        } catch (error) {
            console.error('Ошибка при удалении задачи:', error);
        }
    }

    // Загрузка задач при нажатии на кнопку
    loadTasksButton.addEventListener("click", loadTasks);

    loadTasks(); // Изначальная загрузка задач с сервера при загрузке страницы
});
