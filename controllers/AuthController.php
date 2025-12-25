<?php
/**
 * Auth Controller
 * Handles authentication routes (login, register, logout)
 */

class AuthController {
    
    /**
     * Show login page
     */
    public function login() {
        // Check if already logged in - render chat instead
        if ($this->isLoggedIn()) {
            require_once __DIR__ . '/../controllers/ChatController.php';
            $chatController = new ChatController();
            $chatController->index();
            return;
        }
        
        require_once __DIR__ . '/../views/auth/login.php';
    }
    
    /**
     * Show register page
     */
    public function register() {
        // Check if already logged in - render chat instead
        if ($this->isLoggedIn()) {
            require_once __DIR__ . '/../controllers/ChatController.php';
            $chatController = new ChatController();
            $chatController->index();
            return;
        }
        
        require_once __DIR__ . '/../views/auth/register.php';
    }
    
    /**
     * Handle logout
     */
    public function logout() {
        // Clear session
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $_SESSION = array();
        session_destroy();
        
        // Clear cookies if any
        if (isset($_COOKIE['user_token'])) {
            setcookie('user_token', '', time() - 3600, '/');
        }
        
        // Redirect to clean URL (will show login)
        header('Location: ' . BASE_URL . '/');
        exit;
    }
    
    /**
     * Check if user is logged in (via session or cookie)
     */
    private function isLoggedIn() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        return isset($_SESSION['user_id']);
    }
    
    /**
     * API: Verify Firebase token and create session
     */
    public function verifyToken() {
        header('Content-Type: application/json');
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Debug
        error_log('verifyToken called with: ' . print_r($input, true));
        
        if (!isset($input['idToken']) || !isset($input['uid']) || empty($input['uid'])) {
            error_log('verifyToken: Missing idToken or uid');
            echo json_encode(['success' => false, 'message' => 'Token atau UID tidak valid']);
            return;
        }
        
        // Start session and store user info
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Store provided user data
        $_SESSION['user_id'] = $input['uid'];
        $_SESSION['user_name'] = $input['name'] ?? 'User';
        $_SESSION['user_email'] = $input['email'] ?? '';
        $_SESSION['user_photo'] = $input['photoURL'] ?? '';
        $_SESSION['id_token'] = $input['idToken'];
        
        // Debug
        error_log('Session created for user: ' . $_SESSION['user_id']);
        
        echo json_encode(['success' => true, 'message' => 'Session created', 'user_id' => $_SESSION['user_id']]);
    }
}
