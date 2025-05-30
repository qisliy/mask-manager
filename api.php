<?php
// api.php
require_once 'db_config.php';
header('Content-Type: application/json');

$action = $_REQUEST['action'] ?? '';
$data = json_decode(file_get_contents('php://input'), true);

switch ($action) {
    case 'get_tasks':
        getTasks($pdo);
        break;
    case 'add_task':
        addTask($pdo, $data);
        break;
    case 'update_task':
        updateTask($pdo, $data);
        break;
    case 'delete_task':
        deleteTask($pdo, $data);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Неизвестное действие']);
        break;
}

function getTasks($pdo) {
    $statusFilter = $_GET['status'] ?? null;
    $sortBy = $_GET['sort_by'] ?? 'created_at';
    $sortOrder = $_GET['sort_order'] ?? 'DESC';

    // Валидация полей сортировки
    $allowedSortBy = ['created_at', 'due_date', 'priority', 'status', 'title'];
    $allowedSortOrder = ['ASC', 'DESC'];

    if (!in_array($sortBy, $allowedSortBy)) $sortBy = 'created_at';
    if (!in_array(strtoupper($sortOrder), $allowedSortOrder)) $sortOrder = 'DESC';


    $sql = "SELECT * FROM tasks";
    $params = [];

    if ($statusFilter && in_array($statusFilter, ['pending', 'completed'])) {
        $sql .= " WHERE status = ?";
        $params[] = $statusFilter;
    }

    $sql .= " ORDER BY $sortBy $sortOrder"; // $sortBy и $sortOrder здесь безопасны после валидации

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'tasks' => $tasks]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Ошибка получения задач: ' . $e->getMessage()]);
    }
}

function addTask($pdo, $data) {
    if (empty($data['title'])) {
        echo json_encode(['success' => false, 'message' => 'Заголовок обязателен']);
        return;
    }
    $sql = "INSERT INTO tasks (title, description, priority, due_date, status) VALUES (?, ?, ?, ?, ?)";
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['title'],
            $data['description'] ?? null,
            $data['priority'] ?? 3,
            $data['due_date'] ?? null,
            $data['status'] ?? 'pending'
        ]);
        $lastId = $pdo->lastInsertId();
        // Получаем добавленную задачу
        $stmt = $pdo->prepare("SELECT * FROM tasks WHERE id = ?");
        $stmt->execute([$lastId]);
        $task = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'message' => 'Задача добавлена', 'task' => $task]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Ошибка добавления задачи: ' . $e->getMessage()]);
    }
}

function updateTask($pdo, $data) {
    if (empty($data['id']) || empty($data['title'])) {
        echo json_encode(['success' => false, 'message' => 'ID и Заголовок обязательны']);
        return;
    }
    $sql = "UPDATE tasks SET title = ?, description = ?, priority = ?, due_date = ?, status = ? WHERE id = ?";
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['title'],
            $data['description'] ?? null,
            $data['priority'] ?? 3,
            $data['due_date'] ?? null,
            $data['status'] ?? 'pending',
            $data['id']
        ]);
        // Получаем обновленную задачу
        $stmt = $pdo->prepare("SELECT * FROM tasks WHERE id = ?");
        $stmt->execute([$data['id']]);
        $task = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'message' => 'Задача обновлена', 'task' => $task]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Ошибка обновления задачи: ' . $e->getMessage()]);
    }
}

function deleteTask($pdo, $data) {
    if (empty($data['id'])) {
        echo json_encode(['success' => false, 'message' => 'ID обязателен']);
        return;
    }
    $sql = "DELETE FROM tasks WHERE id = ?";
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$data['id']]);
        echo json_encode(['success' => true, 'message' => 'Задача удалена']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Ошибка удаления задачи: ' . $e->getMessage()]);
    }
}
