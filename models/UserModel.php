<?php
/**
 * User Model
 * Handles user-related operations with Firebase
 */

class UserModel {
    private $db;
    
    public function __construct() {
        $this->db = new FirebaseDatabase();
    }
    
    /**
     * Generate unique user code
     */
    private function generateUserCode() {
        return strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));
    }
    
    /**
     * Create or update user
     */
    public function createUser($userId, $userData) {
        // Check if user already exists
        $existingUser = $this->db->get("users/{$userId}");
        
        $user = [
            'name' => $userData['name'],
            'email' => $userData['email'] ?? null,
            'phone' => $userData['phone'] ?? null,
            'avatar' => $userData['avatar'] ?? null,
            'status' => 'online',
            'last_seen' => time() * 1000,
            'created_at' => $existingUser['created_at'] ?? time() * 1000,
            'user_code' => $existingUser['user_code'] ?? $this->generateUserCode()
        ];
        
        return $this->db->update("users/{$userId}", $user);
    }
    
    /**
     * Get user by unique code
     */
    public function getUserByCode($userCode) {
        $users = $this->db->get("users");
        
        if (!$users || !is_array($users)) {
            return null;
        }
        
        foreach ($users as $userId => $userData) {
            if (isset($userData['user_code']) && $userData['user_code'] === strtoupper($userCode)) {
                $userData['id'] = $userId;
                return $userData;
            }
        }
        
        return null;
    }
    
    /**
     * Get user by ID
     */
    public function getUser($userId) {
        return $this->db->get("users/{$userId}");
    }
    
    /**
     * Update user status
     */
    public function updateStatus($userId, $status) {
        return $this->db->update("users/{$userId}", [
            'status' => $status,
            'last_seen' => time() * 1000
        ]);
    }
    
    /**
     * Update user profile
     */
    public function updateProfile($userId, $data) {
        return $this->db->update("users/{$userId}", $data);
    }
    
    /**
     * Get or create session user (for demo purposes)
     */
    public static function getCurrentUser() {
        if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_name'])) {
            // Create a demo user
            $_SESSION['user_id'] = 'user_' . substr(md5(session_id()), 0, 8);
            $_SESSION['user_name'] = 'User ' . substr($_SESSION['user_id'], -4);
        }
        
        return [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['user_name']
        ];
    }
}
