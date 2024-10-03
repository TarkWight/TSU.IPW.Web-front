document.addEventListener("DOMContentLoaded", function () {
    const taskForm = document.getElementById("task-form");
    const submitButton = document.getElementById("submit-button");

    let tasks = [];

    // Функция для загрузки задач из API
    async function loadTasks() {
        try {
            const response = await fetch('https://192.168.0.36:7088/api/Tasks'); // URL вашего API
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            tasks = await response.json();
            displayTasks();
        } catch (error) {
            console.error('Ошибка загрузки задач:', error);
        }
    }

    // Функция для отображения задач
    function displayTasks() {
        const taskLists = document.getElementById("task-lists");
        taskLists.innerHTML = '';

        tasks.forEach((task, index) => {
            const taskDiv = document.createElement("div");
            taskDiv.className = "task";

            const statusIcon = document.createElement("span");
            statusIcon.innerText = task.completed ? "✔️" : "❌";
            statusIcon.onclick = () => toggleTaskStatus(index); // Обработчик клика для изменения статуса
            taskDiv.appendChild(statusIcon);

            const title = document.createElement("span");
            title.innerText = task.title;
            taskDiv.appendChild(title);

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

    // Функция для изменения статуса задачи
    async function toggleTaskStatus(index) {
        const task = tasks[index];
        task.completed = !task.completed;

        try {
            const response = await fetch(`https://192.168.0.36:7088/api/Tasks/${task.id}`, {
                method: 'PUT', // Изменение статуса задачи
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(task)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            displayTasks(); // Обновляем отображение задач
        } catch (error) {
            console.error('Ошибка при изменении статуса задачи:', error);
        }
    }

    // Функция для редактирования задачи
    function editTask(index) {
        const task = tasks[index];
        document.getElementById("task-title").value = task.title;
        document.getElementById("task-description").value = task.description;
        submitButton.innerText = "Сохранить";
        submitButton.setAttribute("data-action", "edit");
        submitButton.setAttribute("data-index", index);
    }

    // Функция для сохранения или создания задачи
    taskForm.onsubmit = async function (event) {
        event.preventDefault();
        const title = document.getElementById("task-title").value;
        const description = document.getElementById("task-description").value;
        const action = submitButton.getAttribute("data-action");

        if (action === "create") {
            const newTask = { title, description, completed: false };

            try {
                const response = await fetch('https://192.168.0.36:7088/api/Tasks', {
                    method: 'POST', // Создание новой задачи
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newTask)
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                await loadTasks(); // Загружаем обновленный список задач
            } catch (error) {
                console.error('Ошибка при создании задачи:', error);
            }
        } else if (action === "edit") {
            const index = submitButton.getAttribute("data-index");
            tasks[index] = { ...tasks[index], title, description };

            try {
                const response = await fetch(`https://192.168.0.36:7088/api/Tasks/${tasks[index].id}`, {
                    method: 'PUT', // Обновление существующей задачи
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(tasks[index])
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                submitButton.innerText = "Создать";
                submitButton.removeAttribute("data-index");
                await loadTasks(); // Загружаем обновленный список задач
            } catch (error) {
                console.error('Ошибка при редактировании задачи:', error);
            }
        }

        // Сбрасываем форму
        taskForm.reset();
    };

    // Функция для удаления задачи
    async function deleteTask(index) {
        const taskId = tasks[index].id;

        try {
            const response = await fetch(`https://192.168.0.36:7088/api/Tasks/${taskId}`, {
                method: 'DELETE' // Удаление задачи
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            await loadTasks(); // Загружаем обновленный список задач
        } catch (error) {
            console.error('Ошибка при удалении задачи:', error);
        }
    }

    loadTasks(); // Изначальный вызов для загрузки задач
});
