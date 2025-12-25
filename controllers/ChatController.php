<?php
/**
 * Chat Controller
 * Main controller for the chat application
 */

class ChatController {
    
    public function __construct() {
        // Session check
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }
    
    /**
     * Main chat view
     */
    public function index() {
        // Check if user is logged in
        if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
            header('Location: ' . BASE_URL . '/login');
            exit;
        }
        
        // Debug session
        error_log('ChatController - Session user_id: ' . $_SESSION['user_id']);
        
        $user = [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['user_name'] ?? 'User',
            'email' => $_SESSION['user_email'] ?? '',
            'user_code' => $_SESSION['user_id'] // UID = user code
        ];
        
        // Contacts and groups will be loaded via JavaScript from Firestore
        $contacts = [];
        $groups = [];
        
        // Load main chat view
        require_once __DIR__ . '/../views/chat/index.php';
    }
    
    // User code is now the Firebase UID, no generation needed
    
    /**
     * Get messages for a conversation (API endpoint)
     */
    public function getMessages() {
        header('Content-Type: application/json');
        
        $user = UserModel::getCurrentUser();
        $receiverId = $_GET['receiver_id'] ?? null;
        $receiverType = $_GET['receiver_type'] ?? 'contact';
        
        if (!$receiverId) {
            echo json_encode(['success' => false, 'error' => 'Receiver ID required']);
            return;
        }
        
        $messages = $this->messageModel->getMessages($user['id'], $receiverId, $receiverType);
        
        echo json_encode([
            'success' => true,
            'messages' => $messages,
            'current_user_id' => $user['id']
        ]);
    }
    
    /**
     * Send a message (API endpoint)
     */
    public function sendMessage() {
        header('Content-Type: application/json');
        
        $user = UserModel::getCurrentUser();
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['receiver_id']) || empty($data['message'])) {
            echo json_encode(['success' => false, 'error' => 'Missing required fields']);
            return;
        }
        
        $messageData = [
            'sender_id' => $user['id'],
            'receiver_id' => $data['receiver_id'],
            'receiver_type' => $data['receiver_type'] ?? 'contact',
            'message' => $data['message'],
            'file_url' => $data['file_url'] ?? null,
            'file_name' => $data['file_name'] ?? null,
            'file_type' => $data['file_type'] ?? null
        ];
        
        $result = $this->messageModel->sendMessage($messageData);
        
        echo json_encode([
            'success' => true,
            'message_id' => $result['name'] ?? null
        ]);
    }
    
    /**
     * Upload file (API endpoint)
     */
    public function uploadFile() {
        header('Content-Type: application/json');
        
        if (!isset($_FILES['file'])) {
            echo json_encode(['success' => false, 'error' => 'No file uploaded']);
            return;
        }
        
        $file = $_FILES['file'];
        $uploadDir = __DIR__ . '/../uploads/';
        
        // Create upload directory if not exists
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '_' . time() . '.' . $extension;
        $filepath = $uploadDir . $filename;
        
        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            $fileUrl = BASE_URL . '/uploads/' . $filename;
            
            echo json_encode([
                'success' => true,
                'file_url' => $fileUrl,
                'file_name' => $file['name'],
                'file_type' => $file['type']
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to upload file']);
        }
    }
}
