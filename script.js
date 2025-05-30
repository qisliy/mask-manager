// script.js
document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const themeSwitcher = document.getElementById('theme-switcher');

    const filterStatus = document.getElementById('filter-status');
    const sortBy = document.getElementById('sort-by');
    const sortOrder = document.getElementById('sort-order');

    // Модальное окно
    const editModal = document.getElementById('edit-task-modal');
    const modalContent = editModal.querySelector('.modal-content');
    const closeButton = editModal.querySelector('.close-button');
    const editFormPlaceholder = document.getElementById('edit-form-placeholder'); // Шаблон формы

    let currentTasks = []; // Локальный кэш задач для редактирования

    // --- Тема ---
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            themeSwitcher.textContent = 'Светлая тема';
        } else {
            document.body.classList.remove('dark-theme');
            themeSwitcher.textContent = 'Темная тема';
        }
        localStorage.setItem('theme', theme);
    };

    const loadTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);
    };

    themeSwitcher.addEventListener('click', () => {
        const currentTheme = localStorage.getItem('theme') || 'light';
        applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    });

    loadTheme();

    // --- API вызовы ---
    const apiCall = async (action, method = 'GET', body = null, params = {}) => {
        const url = new URL(`api.php?action=${action}`, window.location.origin);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        const options = {
            method: method,
            headers: {}
        };
        if (body && (method === 'POST' || method === 'PUT')) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'HTTP error: ' + response.status }));
                throw new Error(errorData.message || 'Ошибка сети');
            }
            return await response.json();
        } catch (error) {
            console.error(`Ошибка API (${action}):`, error);
            alert(`Ошибка: ${error.message}`);
            return { success: false, message: error.message };
        }
    };


    // --- Отображение задач ---
    const renderTasks = (tasks) => {
        taskList.innerHTML = '';
        currentTasks = tasks; // Сохраняем задачи для быстрого доступа при редактировании

        if (!tasks || tasks.length === 0) {
            taskList.innerHTML = '<li>Нет задач. Добавьте первую!</li>';
            return;
        }

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.classList.add('task-item');
            li.classList.toggle('completed', task.status === 'completed');
            li.dataset.id = task.id;

            const priorityTextMap = { 1: 'Высокий', 2: 'Средний', 3: 'Низкий' };
            const priorityClassMap = { 1: 'task-priority-1', 2: 'task-priority-2', 3: 'task-priority-3' };

            li.innerHTML = `
                <div class="task-header">
                    <span class="task-title">${task.title}</span>
                    <span class="task-priority ${priorityClassMap[task.priority] || ''}">
                        Приоритет: ${priorityTextMap[task.priority] || 'Не указан'}
                    </span>
                </div>
                ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                <div class="task-meta">
                    <span>Статус: ${task.status === 'completed' ? 'Выполнено' : 'В процессе'}</span> |
                    <span>Срок: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Не указан'}</span> |
                    <span>Создана: ${new Date(task.created_at).toLocaleString()}</span>
                </div>
                <div class="task-actions">
                    <button class="btn-edit" data-id="${task.id}">Редактировать</button>
                    <button class="btn-delete" data-id="${task.id}">Удалить</button>
                    <button class="btn-toggle-status ${task.status}" data-id="${task.id}" data-status="${task.status}">
                        ${task.status === 'completed' ? 'В процесс' : 'Выполнено'}
                    </button>
                </div>
            `;
            taskList.appendChild(li);
        });
    };

    // Функция для экранирования HTML (базовая защита от XSS при выводе)
    function escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined) return '';
        return unsafe
            .toString()
            .replace(/&/g, "&")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .replace(/"/g, "\"")
            .replace(/'/g, "'");
    }


    // --- Загрузка задач ---
    const fetchTasks = async () => {
        const params = {
            status: filterStatus.value,
            sort_by: sortBy.value,
            sort_order: sortOrder.value
        };
        const result = await apiCall('get_tasks', 'GET', null, params);
        if (result.success) {
            renderTasks(result.tasks);
        }
    };

    // --- Добавление задачи ---
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('task-id').value; // Для редактирования (здесь не используется, но оставим)
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const priority = document.getElementById('priority').value;
        const due_date = document.getElementById('due_date').value;
        const status = document.getElementById('status').value; // для формы добавления статус по умолчанию 'pending'

        if (!title.trim()) {
            alert('Заголовок не может быть пустым.');
            return;
        }

        const taskData = { title, description, priority, due_date, status: 'pending' }; // Новые задачи всегда 'pending'

        // Используем тот же API endpoint для добавления. ID не передаем.
        const result = await apiCall('add_task', 'POST', taskData);
        if (result.success) {
            fetchTasks(); // Обновляем список
            taskForm.reset(); // Очищаем форму
            document.getElementById('task-id').value = ''; // Сбрасываем ID на всякий случай
        } else {
            alert(result.message || 'Не удалось добавить задачу.');
        }
    });

    // --- Действия с задачами (удаление, редактирование, смена статуса) ---
    taskList.addEventListener('click', async (e) => {
        const target = e.target;
        const id = target.dataset.id;

        if (target.classList.contains('btn-delete')) {
            if (confirm('Удалить эту задачу?')) {
                const result = await apiCall('delete_task', 'POST', { id });
                if (result.success) {
                    fetchTasks();
                }
            }
        } else if (target.classList.contains('btn-edit')) {
            openEditModal(id);
        } else if (target.classList.contains('btn-toggle-status')) {
            const currentStatus = target.dataset.status;
            const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';

            // Находим задачу в локальном кэше, чтобы не делать лишний GET запрос
            const taskToUpdate = currentTasks.find(task => task.id == id);
            if (taskToUpdate) {
                const updatedTaskData = { ...taskToUpdate, status: newStatus };
                const result = await apiCall('update_task', 'POST', updatedTaskData);
                if (result.success) {
                    fetchTasks();
                }
            } else {
                alert('Задача не найдена для обновления статуса.');
            }
        }
    });

    // --- Фильтрация и сортировка ---
    [filterStatus, sortBy, sortOrder].forEach(el => {
        el.addEventListener('change', fetchTasks);
    });

    // --- Логика модального окна ---
    function openEditModal(taskId) {
        const task = currentTasks.find(t => t.id == taskId);
        if (!task) return;

        // Клонируем форму из плейсхолдера и вставляем в модалку
        const clonedForm = editFormPlaceholder.cloneNode(true);
        clonedForm.style.display = 'block';
        clonedForm.id = 'actual-edit-form'; // Даем уникальный ID, если нужно

        // Удаляем старое содержимое модалки (кроме кнопки закрытия)
        while (modalContent.childNodes.length > 1) { // оставляем .close-button
            if (modalContent.lastChild !== closeButton) {
                modalContent.removeChild(modalContent.lastChild);
            } else {
                break; // на всякий случай, если что-то пойдет не так
            }
        }
        modalContent.appendChild(clonedForm);

        // Заполняем поля формы в модалке
        modalContent.querySelector('#edit-task-id').value = task.id;
        modalContent.querySelector('#edit-title').value = task.title;
        modalContent.querySelector('#edit-description').value = task.description || '';
        modalContent.querySelector('#edit-priority').value = task.priority;
        modalContent.querySelector('#edit-due_date').value = task.due_date || '';
        modalContent.querySelector('#edit-status').value = task.status;

        editModal.style.display = 'block';

        // Обработчик для кнопки "Сохранить изменения" внутри модалки
        const saveBtn = modalContent.querySelector('#save-edit-task-btn');
        if (saveBtn) { // Проверяем, существует ли кнопка
            // Удаляем старый обработчик, если есть, чтобы избежать дублирования
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

            newSaveBtn.addEventListener('click', async () => {
                const updatedTask = {
                    id: modalContent.querySelector('#edit-task-id').value,
                    title: modalContent.querySelector('#edit-title').value,
                    description: modalContent.querySelector('#edit-description').value,
                    priority: modalContent.querySelector('#edit-priority').value,
                    due_date: modalContent.querySelector('#edit-due_date').value,
                    status: modalContent.querySelector('#edit-status').value
                };
                if (!updatedTask.title.trim()) {
                    alert('Заголовок не может быть пустым.');
                    return;
                }
                const result = await apiCall('update_task', 'POST', updatedTask);
                if (result.success) {
                    closeEditModal();
                    fetchTasks();
                }
            });
        }

        // Обработчик для кнопки "Отмена" внутри модалки
        const cancelBtn = modalContent.querySelector('#cancel-edit-task-btn');
        if (cancelBtn) {
            const newCancelBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
            newCancelBtn.addEventListener('click', closeEditModal);
        }
    }

    function closeEditModal() {
        editModal.style.display = 'none';
        // Очищаем содержимое модалки (кроме кнопки закрытия), чтобы не накапливались формы
        const formInsideModal = modalContent.querySelector('#actual-edit-form');
        if (formInsideModal) {
            formInsideModal.remove();
        }
    }

    closeButton.addEventListener('click', closeEditModal);
    window.addEventListener('click', (event) => {
        if (event.target === editModal) {
            closeEditModal();
        }
    });

    // --- Начальная загрузка ---
    fetchTasks();
});