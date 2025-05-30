<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Персональный менеджер задач</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <button id="theme-switcher">Сменить тему</button>

    <div class="container">
        <h1>Менеджер задач</h1>

        <form id="task-form">
            <h2>Добавить/Редактировать задачу</h2>
            <input type="hidden" id="task-id">
            <div>
                <label for="title">Заголовок:</label>
                <input type="text" id="title" name="title" required>
            </div>
            <div>
                <label for="description">Описание:</label>
                <textarea id="description" name="description"></textarea>
            </div>
            <div>
                <label for="priority">Приоритет:</label>
                <select id="priority" name="priority">
                    <option value="3">Низкий</option>
                    <option value="2">Средний</option>
                    <option value="1">Высокий</option>
                </select>
            </div>
            <div>
                <label for="due_date">Срок выполнения:</label>
                <input type="date" id="due_date" name="due_date">
            </div>
             <div>
                <label for="status">Статус (при редактировании):</label>
                <select id="status" name="status">
                    <option value="pending">В процессе</option>
                    <option value="completed">Выполнено</option>
                </select>
            </div>
            <button type="submit">Сохранить задачу</button>
        </form>
        
        <div id="edit-form-placeholder" style="display:none;"> <!-- Для клонирования в модалку -->
             <h2>Редактировать задачу</h2>
            <input type="hidden" id="edit-task-id">
            <div>
                <label for="edit-title">Заголовок:</label>
                <input type="text" id="edit-title" name="title" required>
            </div>
            <div>
                <label for="edit-description">Описание:</label>
                <textarea id="edit-description" name="description"></textarea>
            </div>
            <div>
                <label for="edit-priority">Приоритет:</label>
                <select id="edit-priority" name="priority">
                    <option value="3">Низкий</option>
                    <option value="2">Средний</option>
                    <option value="1">Высокий</option>
                </select>
            </div>
            <div>
                <label for="edit-due_date">Срок выполнения:</label>
                <input type="date" id="edit-due_date" name="due_date">
            </div>
             <div>
                <label for="edit-status">Статус:</label>
                <select id="edit-status" name="status">
                    <option value="pending">В процессе</option>
                    <option value="completed">Выполнено</option>
                </select>
            </div>
            <button type="button" id="save-edit-task-btn" class="btn-save">Сохранить изменения</button>
            <button type="button" id="cancel-edit-task-btn">Отмена</button>
        </div>


        <div class="filters-sorters">
            <div>
                <label for="filter-status">Фильтр по статусу:</label>
                <select id="filter-status">
                    <option value="">Все</option>
                    <option value="pending">В процессе</option>
                    <option value="completed">Выполнено</option>
                </select>
            </div>
            <div>
                <label for="sort-by">Сортировать по:</label>
                <select id="sort-by">
                    <option value="created_at">Дата создания</option>
                    <option value="due_date">Срок выполнения</option>
                    <option value="priority">Приоритет</option>
                    <option value="title">Название</option>
                </select>
            </div>
            <div>
                <label for="sort-order">Порядок:</label>
                <select id="sort-order">
                    <option value="DESC">Убывание</option>
                    <option value="ASC">Возрастание</option>
                </select>
            </div>
        </div>

        <ul id="task-list" class="task-list">
            <!-- Задачи будут вставляться сюда через JS -->
        </ul>
    </div>

    <!-- Модальное окно для редактирования -->
    <div id="edit-task-modal" class="modal">
        <div class="modal-content">
            <span class="close-button">×</span>
            <!-- Форма редактирования будет вставлена сюда -->
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>