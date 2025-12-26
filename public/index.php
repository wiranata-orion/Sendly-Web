<?php
/**
 * Main Entry Point - Sendly Chat Application
 * Clean URL - hanya tampilkan /Website-Platform/
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
$urlParts = !empty($url) ? explode('/', $url) : [];

// Handle intent parameter for navigation (direct handling)
$intent = isset($_GET['intent']) ? $_GET['intent'] : null;

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
            
        case 'add_contact_by_code':
            require_once __DIR__ . '/../controllers/ContactController.php';
            $controller = new ContactController();
            $controller->addByCode();
            break;
            
        case 'add_group':
            require_once __DIR__ . '/../controllers/GroupController.php';
            $controller = new GroupController();
            $controller->add();
            break;
            
        case 'join_group':
            require_once __DIR__ . '/../controllers/GroupController.php';
            $controller = new GroupController();
            $controller->join();
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Action not found']);
            break;
    }
    exit;
}

// ============================================
// ROUTING LOGIC - Clean URLs
// ============================================

$isLoggedIn = isset($_SESSION['user_id']);

// Protected routes - butuh login
$protectedRoutes = ['chat', 'contacts', 'groups', 'settings', 'profile'];
$currentRoute = strtolower($urlParts[0] ?? '');

// Jika akses protected route tanpa login → redirect ke root (akan tampilkan login)
if (in_array($currentRoute, $protectedRoutes) && !$isLoggedIn) {
    header('Location: ' . BASE_URL . '/');
    exit;
}

// Root URL atau kosong
if (empty($url) || $url === '' || $url === 'public') {
    if ($isLoggedIn) {
        // Sudah login → tampilkan chat
        require_once __DIR__ . '/../controllers/ChatController.php';
        $controller = new ChatController();
        $controller->index();
    } else {
        // Belum login → cek intent dari query parameter
        if ($intent === 'register') {
            // Tampilkan register form
            require_once __DIR__ . '/../controllers/AuthController.php';
            $controller = new AuthController();
            $controller->register();
        } else {
            // Tampilkan login form (default)
            require_once __DIR__ . '/../controllers/AuthController.php';
            $controller = new AuthController();
            $controller->login();
        }
    }
    exit;
}

// Auth routes - login, register, logout
$authRoutes = ['login', 'register', 'logout'];
if (in_array($currentRoute, $authRoutes)) {
    // Jika sudah login dan akses login/register → redirect ke chat
    if ($isLoggedIn && in_array($currentRoute, ['login', 'register'])) {
        header('Location: ' . BASE_URL . '/chat');
        exit;
    }
    
    require_once __DIR__ . '/../controllers/AuthController.php';
    $controller = new AuthController();
    $controller->$currentRoute();
    exit;
}

// Parse controller and method
$controllerName = !empty($urlParts[0]) ? ucfirst($urlParts[0]) . 'Controller' : 'AuthController';
$methodName = isset($urlParts[1]) && !empty($urlParts[1]) ? $urlParts[1] : 'index';
$params = array_slice($urlParts, 2);

// Handle API requests
if (isset($urlParts[0]) && $urlParts[0] === 'api') {
    header('Content-Type: application/json');
    $controllerName = isset($urlParts[1]) ? ucfirst($urlParts[1]) . 'Controller' : 'ChatController';
    $methodName = isset($urlParts[2]) && !empty($urlParts[2]) ? $urlParts[2] : 'index';
    
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
        // Method not found - tampilkan halaman sesuai status login
        if ($isLoggedIn) {
            require_once __DIR__ . '/../controllers/ChatController.php';
            $controller = new ChatController();
            $controller->index();
        } else {
            require_once __DIR__ . '/../controllers/AuthController.php';
            $controller = new AuthController();
            $controller->login();
        }
    }
} else {
    // Controller not found - tampilkan halaman sesuai status login
    if ($isLoggedIn) {
        require_once __DIR__ . '/../controllers/ChatController.php';
        $controller = new ChatController();
        $controller->index();
    } else {
        require_once __DIR__ . '/../controllers/AuthController.php';
        $controller = new AuthController();
        $controller->login();
    }
}
