<?php
/**
 * Chat Controller
 * Main controller for the chat application
 */

class ChatController {
    private $messageModel;
    private $contactModel;
    private $groupModel;
    private $userModel;
    
    public function __construct() {
        $this->messageModel = new MessageModel();
        $this->contactModel = new ContactModel();
        $this->groupModel = new GroupModel();
        $this->userModel = new UserModel();
    }
    
    /**
     * Main chat view
     */
    public function index() {
        $user = UserModel::getCurrentUser();
        
        // Ensure user has a code
        $userData = $this->userModel->getUser($user['id']);
        if (!$userData || !isset($userData['user_code'])) {
            // Create/update user with code
            $this->userModel->createUser($user['id'], [
                'name' => $user['name']
            ]);
            $userData = $this->userModel->getUser($user['id']);
        }
        
        $user['user_code'] = $userData['user_code'] ?? 'N/A';
        
        // Get user's contacts and groups
        $contacts = $this->contactModel->getContacts($user['id']);
        $groups = $this->groupModel->getGroups($user['id']);
        
        // Ensure they are arrays
        if (!is_array($contacts)) {
            $contacts = [];
        }
        if (!is_array($groups)) {
            $groups = [];
        }
        
        // Load main chat view
        require_once __DIR__ . '/../views/chat/index.php';
    }
    
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
