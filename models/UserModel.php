<?php
/**
 * User Model
 * Handles user-related operations with Firebase Firestore
 */

class UserModel {
    private $db;
    
    public function __construct() {
        $this->db = new FirebaseDatabase();
    }
    
    /**
     * Create or update user
     * User code = Firebase UID (permanent & unique)
     */
    public function createUser($userId, $userData) {
        $user = [
            'uid' => $userId,
            'name' => $userData['name'],
            'email' => $userData['email'] ?? null,
            'phone' => $userData['phone'] ?? null,
            'photoURL' => $userData['avatar'] ?? null,
            'status' => 'online',
            'about' => 'Hey there! I am using Sendly'
        ];
        
        return $this->db->update("users/{$userId}", $user);
    }
    
    /**
     * Get user by unique code (Firebase UID)
     */
    public function getUserByCode($userCode) {
        // User code IS the Firebase UID, so fetch directly from Firestore
        $userData = $this->db->get("users/{$userCode}");
        
        // Check if user exists and has valid data
        if ($userData && is_array($userData) && isset($userData['name'])) {
            $userData['id'] = $userCode;
            $userData['user_code'] = $userCode;
            return $userData;
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
            'status' => $status
        ]);
    }
    
    /**
     * Update user profile
     */
    public function updateProfile($userId, $data) {
        return $this->db->update("users/{$userId}", $data);
    }
    
    /**
     * Get or create session user
     */
    public static function getCurrentUser() {
        if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_name'])) {
            return null;
        }
        
        return [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['user_name']
        ];
    }
}
