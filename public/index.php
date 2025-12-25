<?php
/**
 * Main Entry Point - Sendly Chat Application
 */

session_start();

// Load configuration
require_once __DIR__ . '/../config/firebase.php';
require_once __DIR__ . '/../config/database.php';

// Autoload controllers and models
spl_autoload_register(function($className) {
    $paths = [
        __DIR__ . '/../controllers/' . $className . '.php',
        __DIR__ . '/../models/' . $className . '.php',
        __DIR__ . '/../core/' . $className . '.php'
    ];
    
    foreach ($paths as $path) {
        if (file_exists($path)) {
            require_once $path;
            return;
        }
    }
});

// Parse URL
$url = isset($_GET['url']) ? rtrim($_GET['url'], '/') : '';
$url = filter_var($url, FILTER_SANITIZE_URL);
$urlParts = explode('/', $url);

// Handle action parameter for API requests
$action = isset($_GET['action']) ? $_GET['action'] : null;

if ($action) {
    header('Content-Type: application/json');
    
    switch ($action) {
        case 'add_contact':
            require_once __DIR__ . '/../controllers/ContactController.php';
            $controller = new ContactController();
            $controller->add();
            break;
            
        case 'add_group':
            require_once __DIR__ . '/../controllers/GroupController.php';
            $controller = new GroupController();
            $controller->add();
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Action not found']);
            break;
    }
    exit;
}

// Default controller and method
$controllerName = !empty($urlParts[0]) ? ucfirst($urlParts[0]) . 'Controller' : 'ChatController';
$methodName = isset($urlParts[1]) ? $urlParts[1] : 'index';
$params = array_slice($urlParts, 2);

// Handle API requests
if ($urlParts[0] === 'api') {
    header('Content-Type: application/json');
    $controllerName = isset($urlParts[1]) ? ucfirst($urlParts[1]) . 'Controller' : 'ChatController';
    $methodName = isset($urlParts[2]) ? $urlParts[2] : 'index';
    
    // Handle special methods with dashes (add-by-code -> addByCode)
    if (isset($urlParts[2])) {
        $methodName = str_replace('-', ' ', $urlParts[2]);
        $methodName = str_replace(' ', '', ucwords($methodName));
        $methodName = lcfirst($methodName);
    }
    
    $params = array_slice($urlParts, 3);
}

// Load and execute controller
$controllerFile = __DIR__ . '/../controllers/' . $controllerName . '.php';

if (file_exists($controllerFile)) {
    require_once $controllerFile;
    $controller = new $controllerName();
    
    if (method_exists($controller, $methodName)) {
        call_user_func_array([$controller, $methodName], $params);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Method not found']);
    }
} else {
    // Default to chat controller
    require_once __DIR__ . '/../controllers/ChatController.php';
    $controller = new ChatController();
    $controller->index();
}
