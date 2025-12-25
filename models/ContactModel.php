<?php
/**
 * Contact Model
 * Handles all contact-related operations with Firebase Firestore
 */

class ContactModel {
    private $db;
    
    public function __construct() {
        $this->db = new FirebaseDatabase();
    }
    
    /**
     * Get all contacts for a user from Firestore subcollection
     */
    public function getContacts($userId) {
        // Firestore path: users/{userId}/contacts
        $contacts = $this->db->get("users/{$userId}/contacts");
        
        if ($contacts && is_array($contacts)) {
            $contactArray = [];
            foreach ($contacts as $id => $contact) {
                if (is_array($contact)) {
                    $contact['id'] = $id;
                    $contactArray[] = $contact;
                }
            }
            
            // Sort by name
            usort($contactArray, function($a, $b) {
                return strcasecmp($a['name'] ?? '', $b['name'] ?? '');
            });
            
            return $contactArray;
        }
        
        return [];
    }
    
    /**
     * Get a single contact
     */
    public function getContact($userId, $contactId) {
        $contact = $this->db->get("users/{$userId}/contacts/{$contactId}");
        if ($contact) {
            $contact['id'] = $contactId;
        }
        return $contact;
    }
    
    /**
     * Update contact
     */
    public function updateContact($userId, $contactId, $data) {
        return $this->db->update("users/{$userId}/contacts/{$contactId}", $data);
    }
    
    /**
     * Delete contact
     */
    public function deleteContact($userId, $contactId) {
        return $this->db->delete("users/{$userId}/contacts/{$contactId}");
    }
    
    /**
     * Search contacts
     */
    public function searchContacts($userId, $query) {
        $contacts = $this->getContacts($userId);
        
        return array_filter($contacts, function($contact) use ($query) {
            return stripos($contact['name'], $query) !== false ||
                   stripos($contact['phone'], $query) !== false;
        });
    }
    
    /**
     * Add contact by user code
     */
    public function addContactByCode($userId, $userCode) {
        $userModel = new UserModel();
        
        // Get user by code (user code = Firebase UID)
        $targetUser = $userModel->getUserByCode($userCode);
        
        if (!$targetUser) {
            return ['success' => false, 'message' => 'Kode pengguna tidak ditemukan'];
        }
        
        if ($targetUser['id'] === $userId) {
            return ['success' => false, 'message' => 'Tidak dapat menambahkan diri sendiri'];
        }
        
        // Check if contact already exists
        $existingContacts = $this->getContacts($userId);
        foreach ($existingContacts as $contact) {
            if (isset($contact['user_id']) && $contact['user_id'] === $targetUser['id']) {
                return ['success' => false, 'message' => 'Kontak sudah ada'];
            }
        }
        
        // Add contact
        $contactData = [
            'user_id' => $targetUser['id'],
            'name' => $targetUser['name'] ?? 'Unknown',
            'phone' => $targetUser['phone'] ?? '',
            'email' => $targetUser['email'] ?? null,
            'avatar' => $targetUser['avatar'] ?? null,
            'user_code' => $targetUser['user_code'] ?? $userCode,
            'created_at' => time() * 1000
        ];
        
        $result = $this->db->push("users/{$userId}/contacts", $contactData);
        
        if ($result && is_array($result) && isset($result['name'])) {
            $contactData['id'] = $result['name'];
            return [
                'success' => true,
                'message' => 'Kontak berhasil ditambahkan',
                'contact' => $contactData
            ];
        }
        
        return ['success' => false, 'message' => 'Gagal menambahkan kontak'];
    }
}

