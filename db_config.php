<?php
// db_config.php
define('DB_SERVER', 'localhost');    // Или ваш хост БД
define('DB_USERNAME', 'root');       // Ваше имя пользователя БД
define('DB_PASSWORD', '');           // Ваш пароль БД
define('DB_NAME', 'task_manager_db'); // Имя вашей БД

try {
    $pdo = new PDO("mysql:host=" . DB_SERVER . ";dbname=" . DB_NAME, DB_USERNAME, DB_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // В реальном приложении здесь лучше логировать ошибку, а не выводить напрямую
    die("ОШИБКА: Не удалось подключиться. " . $e->getMessage());
}
