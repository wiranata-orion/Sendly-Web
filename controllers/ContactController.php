<?php
/**
 * Contact Controller
 * Handles contact-related API endpoints
 */

class ContactController {
    private $contactModel;
    
    public function __construct() {
        // Ensure session is started
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->contactModel = new ContactModel();
    }
    
    /**
     * Get all contacts
     */
    public function index() {
        header('Content-Type: application/json');
        
        $user = UserModel::getCurrentUser();
        $contacts = $this->contactModel->getContacts($user['id']);
        
        echo json_encode([
            'success' => true,
            'contacts' => $contacts
        ]);
    }
    
    /**
     * Add new contact
     */
    public function add() {
        header('Content-Type: application/json');
        
        try {
            $user = UserModel::getCurrentUser();
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['name']) || empty($data['phone'])) {
                echo json_encode(['success' => false, 'message' => 'Nama dan nomor telepon wajib diisi']);
                return;
            }
            
            $result = $this->contactModel->addContact($user['id'], $data);
            
            if ($result && isset($result['name'])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Kontak berhasil ditambahkan',
                    'contact_id' => $result['name'],
                    'contact' => [
                        'id' => $result['name'],
                        'name' => $data['name'],
                        'phone' => $data['phone'],
                        'email' => $data['email'] ?? null
                    ]
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Gagal menambahkan kontak']);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }
    
    /**
     * Get single contact
     */
    public function get($contactId = null) {
        header('Content-Type: application/json');
        
        if (!$contactId) {
            echo json_encode(['success' => false, 'error' => 'Contact ID required']);
            return;
        }
        
        $user = UserModel::getCurrentUser();
        $contact = $this->contactModel->getContact($user['id'], $contactId);
        
        if ($contact) {
            echo json_encode([
                'success' => true,
                'contact' => $contact
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Contact not found']);
        }
    }
    
    /**
     * Update contact
     */
    public function update($contactId = null) {
        header('Content-Type: application/json');
        
        if (!$contactId) {
            echo json_encode(['success' => false, 'error' => 'Contact ID required']);
            return;
        }
        
        $user = UserModel::getCurrentUser();
        $data = json_decode(file_get_contents('php://input'), true);
        
        $result = $this->contactModel->updateContact($user['id'], $contactId, $data);
        
        echo json_encode([
            'success' => true,
            'message' => 'Contact updated'
        ]);
    }
    
    /**
     * Delete contact
     */
    public function delete($contactId = null) {
        header('Content-Type: application/json');
        
        if (!$contactId) {
            echo json_encode(['success' => false, 'error' => 'Contact ID required']);
            return;
        }
        
        $user = UserModel::getCurrentUser();
        $this->contactModel->deleteContact($user['id'], $contactId);
        
        echo json_encode([
            'success' => true,
            'message' => 'Contact deleted'
        ]);
    }
    
    /**
     * Search contacts
     */
    public function search() {
        header('Content-Type: application/json');
        
        $user = UserModel::getCurrentUser();
        $query = $_GET['q'] ?? '';
        
        $contacts = $this->contactModel->searchContacts($user['id'], $query);
        
        echo json_encode([
            'success' => true,
            'contacts' => array_values($contacts)
        ]);
    }
    
    /**
     * Add contact by unique code
     */
    public function addByCode() {
        header('Content-Type: application/json');
        
        try {
            $user = UserModel::getCurrentUser();
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['user_code'])) {
                echo json_encode(['success' => false, 'message' => 'Kode pengguna wajib diisi']);
                return;
            }
            
            $result = $this->contactModel->addContactByCode($user['id'], $data['user_code']);
            
            echo json_encode($result);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }
}

