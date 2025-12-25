<?php
/**
 * Message Model
 * Handles all message-related operations with Firebase
 */

class MessageModel {
    private $db;
    
    public function __construct() {
        $this->db = new FirebaseDatabase();
    }
    
    /**
     * Send a message
     */
    public function sendMessage($data) {
        $message = [
            'sender_id' => $data['sender_id'],
            'receiver_id' => $data['receiver_id'],
            'receiver_type' => $data['receiver_type'], // 'contact' or 'group'
            'message' => $data['message'],
            'file_url' => $data['file_url'] ?? null,
            'file_name' => $data['file_name'] ?? null,
            'file_type' => $data['file_type'] ?? null,
            'timestamp' => time() * 1000,
            'status' => 'sent'
        ];
        
        // Create chat room ID
        if ($data['receiver_type'] === 'contact') {
            $chatId = $this->getChatId($data['sender_id'], $data['receiver_id']);
        } else {
            $chatId = 'group_' . $data['receiver_id'];
        }
        
        return $this->db->push("messages/{$chatId}", $message);
    }
    
    /**
     * Get messages for a chat
     */
    public function getMessages($userId, $receiverId, $receiverType = 'contact') {
        if ($receiverType === 'contact') {
            $chatId = $this->getChatId($userId, $receiverId);
        } else {
            $chatId = 'group_' . $receiverId;
        }
        
        $messages = $this->db->get("messages/{$chatId}");
        
        if ($messages) {
            // Convert to array and sort by timestamp
            $messageArray = [];
            foreach ($messages as $id => $message) {
                $message['id'] = $id;
                $messageArray[] = $message;
            }
            
            usort($messageArray, function($a, $b) {
                return $a['timestamp'] - $b['timestamp'];
            });
            
            return $messageArray;
        }
        
        return [];
    }
    
    /**
     * Mark message as read
     */
    public function markAsRead($chatId, $messageId) {
        return $this->db->update("messages/{$chatId}/{$messageId}", [
            'status' => 'read'
        ]);
    }
    
    /**
     * Delete message
     */
    public function deleteMessage($chatId, $messageId) {
        return $this->db->delete("messages/{$chatId}/{$messageId}");
    }
    
    /**
     * Generate consistent chat ID for two users
     */
    private function getChatId($userId1, $userId2) {
        $ids = [$userId1, $userId2];
        sort($ids);
        return 'chat_' . implode('_', $ids);
    }
    
    /**
     * Get last message for chat list preview
     */
    public function getLastMessage($userId, $receiverId, $receiverType = 'contact') {
        $messages = $this->getMessages($userId, $receiverId, $receiverType);
        return !empty($messages) ? end($messages) : null;
    }
}
