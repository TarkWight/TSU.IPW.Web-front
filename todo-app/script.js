const apiUrl = 'https://192.168.0.36:7088/api/tasks'; // URL вашего API для задач
const tagsApiUrl = 'https://192.168.0.36:7088/allTags'; // URL вашего API для тегов

document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const loadTasksButton = document.getElementById('load-tasks-button');
    const editTaskForm = document.getElementById('edit-task-form');
    const updateTaskButton = document.getElementById('update-task-button');
    const deleteTaskButton = document.getElementById('delete-task-button');
    const addTagsButton = document.getElementById('add-tags-button');
    const createTagForm = document.getElementById('tag-form');
    const loadTagsButton = document.getElementById('load-tags-button');
    const tagsList = document.getElementById('tags-list');
    const taskSelectList = document.getElementById('task-select-list');
    const tagButtonsContainer = document.getElementById('tag-buttons-container');
    const notification = document.getElementById('notification');

    let selectedTaskId = null; // ID выбранной задачи

    // Загрузка задач с сервера
    loadTasksButton.addEventListener('click', async () => {
        try {
            const response = await fetch(apiUrl);
            const tasks = await response.json();
            displayTasks(tasks);
            notification.style.display = 'none'; // Скрыть уведомление
        } catch (error) {
            showNotification('Ошибка загрузки задач', 'error');
        }
    });

// Загрузка всех тегов с сервера
    loadTagsButton.addEventListener('click', async () => {
        try {
            const response = await fetch("https://192.168.0.36:7088/allTags", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const tags = await response.json();
                displayTags(tags); // Отображение тегов
                showNotification('Теги успешно загружены', 'success');
            } else {
                showNotification(`Ошибка загрузки тегов: ${response.statusText}`, 'error');
            }
        } catch (error) {
            showNotification('Ошибка загрузки тегов. Проверьте подключение к серверу.', 'error');
        }
    });


    // Создание новой задачи
    taskForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description }),
            });

            if (response.ok) {
                const task = await response.json();
                appendTaskToList(task);
                showNotification('Задача успешно создана');
                taskForm.reset();
            }
        } catch (error) {
            showNotification('Ошибка создания задачи', 'error');
        }
    });

    // Редактирование задачи
    editTaskForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const title = document.getElementById('edit-task-title').value;
        const description = document.getElementById('edit-task-description').value;

        try {
            const response = await fetch(`${apiUrl}/${selectedTaskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description }),
            });

            if (response.ok) {
                showNotification('Задача успешно обновлена');
                loadTasksButton.click(); // Перезагрузить задачи
                editTaskForm.reset();
                selectedTaskId = null; // Сбросить выбранный ID задачи
            }
        } catch (error) {
            showNotification('Ошибка обновления задачи', 'error');
        }
    });

    // Функция для удаления задачи
    async function deleteTask(taskId) {
        try {
            const response = await fetch(`${apiUrl}/${taskId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                showNotification('Задача успешно удалена');
                loadTasksButton.click(); // Перезагрузить задачи
            } else {
                showNotification('Ошибка удаления задачи', 'error');
            }
        } catch (error) {
            showNotification('Ошибка удаления задачи', 'error');
        }
    }


    // Функция для отображения задач
    function displayTasks(tasks) {
        taskSelectList.innerHTML = ''; // Очищаем предыдущий список задач
        tasks.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.className = "task";

            // Иконка статуса
            const statusIcon = document.createElement("span");
            statusIcon.innerText = task.completed ? "✔️" : "❌";
            statusIcon.style.cursor = "pointer";
            statusIcon.onclick = () => toggleTaskStatus(task.id);
            taskDiv.appendChild(statusIcon);

            // Название задачи
            const title = document.createElement('span');
            title.innerText = ` Название: ${task.title}`;
            taskDiv.appendChild(title);

            // Описание задачи
            const description = document.createElement('p');
            description.innerText = `Описание: ${task.description || 'Нет описания'}`;
            taskDiv.appendChild(description);

            // Кнопки редактирования и удаления
            const editButton = document.createElement("button");
            editButton.innerText = "Редактировать";
            editButton.onclick = () => editTask(task.id);
            taskDiv.appendChild(editButton);

            const deleteButton = document.createElement("button");
            deleteButton.innerText = "Удалить";
            deleteButton.onclick = () => deleteTask(task.id);
            taskDiv.appendChild(deleteButton);

            // Получение тегов задачи
            fetch(`${apiUrl}/${task.id}/tags`)
                .then(response => response.json())
                .then(tags => {
                    const tagsContainer = document.createElement('div');
                    tagsContainer.innerText = `Теги: ${tags.map(tag => tag.name).join(', ') || 'Нет тегов'}`;
                    taskDiv.appendChild(tagsContainer);
                });

            // Устанавливаем выбранную задачу при клике
            taskDiv.onclick = () => {
                selectedTaskId = task.id; // Устанавливаем ID выбранной задачи
                showNotification(`Задача "${task.title}" выбрана для добавления тегов`, 'success');
            };

            taskSelectList.appendChild(taskDiv);
        });
    }


    // Функция для отображения тегов
    function displayTags(tags) {
        tagButtonsContainer.innerHTML = ''; // Очищаем контейнер с кнопками тегов
        tags.forEach(tag => {
            const tagLabel = document.createElement('label');
            const tagButton = document.createElement('input');
            tagButton.type = 'radio';
            tagButton.name = 'tag';
            tagButton.value = tag.id;

            tagLabel.appendChild(tagButton);
            tagLabel.append(` ${tag.name}`);
            tagButtonsContainer.appendChild(tagLabel);
        });
    }


// Функция для добавления тега к задаче
    async function addTagToTask(tagId, tagName) {
        try {
            const response = await fetch(`${apiUrl}/${selectedTaskId}/tags`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: tagId,  // Передаем ID тега
                    name: tagName  // Передаем имя тега
                }),
            });

            if (response.ok) {
                showNotification('Тег успешно добавлен', 'success');
                loadTasksButton.click(); // Перезагрузить задачи для обновления
            } else {
                showNotification('Ошибка добавления тега', 'error');
            }
        } catch (error) {
            showNotification('Ошибка добавления тега', 'error');
        }
    }

// Обработчик клика для кнопки добавления тегов
    addTagsButton.addEventListener('click', () => {
        const selectedTag = document.querySelector('input[name="tag"]:checked'); // Получаем выбранный тег
        if (selectedTag && selectedTaskId) {
            const tagName = selectedTag.nextSibling.textContent.trim(); // Получаем имя тега
            addTagToTask(selectedTag.value, tagName); // Передаем ID и имя выбранного тега
        } else {
            showNotification('Пожалуйста, выберите задачу и тег для добавления', 'error');
        }
    });


    // Создание нового тега
    createTagForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const tagName = document.getElementById('tag-name').value.trim();

        if (!tagName) {
            showNotification('Название тега не может быть пустым', 'error');
            return;
        }

        try {
            const response = await fetch("https://192.168.0.36:7088/tags", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: tagName }),
            });

            if (response.ok) {
                showNotification('Тег успешно создан', 'success');
                createTagForm.reset();
                loadTagsButton.click(); // Перезагрузить теги после создания
            } else {
                const errorData = await response.json();
                showNotification(`Ошибка создания тега: ${errorData.message || response.statusText}`, 'error');
            }
        } catch (error) {
            showNotification('Ошибка создания тега. Проверьте подключение к серверу.', 'error');
        }
    });





    // Функция для отображения уведомлений
    function showNotification(message, type = 'success') {
        notification.textContent = message;
        notification.className = type;
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // Обновление статуса задачи
    async function toggleTaskStatus(taskId) {
        try {
            const response = await fetch(`${apiUrl}/${taskId}/complete`, {
                method: 'PATCH',
            });

            if (response.ok) {
                loadTasksButton.click(); // Перезагрузить задачи
            }
        } catch (error) {
            showNotification('Ошибка обновления статуса задачи', 'error');
        }
    }

// Обработчик клика для кнопки добавления тегов
    addTagsButton.addEventListener('click', () => {
        const selectedTagId = document.querySelector('input[name="tag"]:checked');
        if (selectedTagId) {
            addTagToTask(selectedTagId.value);
        } else {
            showNotification('Пожалуйста, выберите тег для добавления');
        }
    });

});
