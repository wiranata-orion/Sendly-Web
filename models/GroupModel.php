<?php
/**
 * Group Model
 * Handles all group-related operations with Firebase
 */

class GroupModel {
    private $db;
    
    public function __construct() {
        $this->db = new FirebaseDatabase();
    }
    
    /**
     * Generate unique group code
     */
    private function generateGroupCode() {
        return strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));
    }
    
    /**
     * Create a new group
     */
    public function createGroup($creatorId, $groupData) {
        $group = [
            'name' => $groupData['name'],
            'description' => $groupData['description'] ?? null,
            'avatar' => $groupData['avatar'] ?? null,
            'creator_id' => $creatorId,
            'members' => $groupData['members'] ?? [$creatorId],
            'group_code' => $this->generateGroupCode(),
            'created_at' => time() * 1000
        ];
        
        $result = $this->db->push("groups", $group);
        
        if ($result && isset($result['name'])) {
            $groupId = $result['name'];
            
            // Add group to user's group list
            $this->addGroupToUser($creatorId, $groupId);
            
            return [
                'id' => $groupId,
                'group_code' => $group['group_code']
            ];
        }
        
        return null;
    }
    
    /**
     * Add group reference to user
     */
    private function addGroupToUser($userId, $groupId) {
        return $this->db->update("users/{$userId}/groups/{$groupId}", [
            'joined_at' => time() * 1000
        ]);
    }
    
    /**
     * Get all groups for a user
     */
    public function getGroups($userId) {
        $userGroups = $this->db->get("users/{$userId}/groups");
        
        if (!$userGroups) {
            return [];
        }
        
        $groups = [];
        foreach ($userGroups as $groupId => $data) {
            $group = $this->db->get("groups/{$groupId}");
            if ($group) {
                $group['id'] = $groupId;
                $groups[] = $group;
            }
        }
        
        // Sort by name
        usort($groups, function($a, $b) {
            return strcasecmp($a['name'], $b['name']);
        });
        
        return $groups;
    }
    
    /**
     * Get a single group
     */
    public function getGroup($groupId) {
        $group = $this->db->get("groups/{$groupId}");
        if ($group) {
            $group['id'] = $groupId;
        }
        return $group;
    }
    
    /**
     * Update group
     */
    public function updateGroup($groupId, $data) {
        return $this->db->update("groups/{$groupId}", $data);
    }
    
    /**
     * Delete group
     */
    public function deleteGroup($groupId) {
        return $this->db->delete("groups/{$groupId}");
    }
    
    /**
     * Add member to group
     */
    public function addMember($groupId, $userId) {
        $group = $this->getGroup($groupId);
        
        if ($group) {
            $members = $group['members'] ?? [];
            if (!in_array($userId, $members)) {
                $members[] = $userId;
                $this->db->update("groups/{$groupId}", ['members' => $members]);
                $this->addGroupToUser($userId, $groupId);
            }
            return true;
        }
        
        return false;
    }
    
    /**
     * Remove member from group
     */
    public function removeMember($groupId, $userId) {
        $group = $this->getGroup($groupId);
        
        if ($group) {
            $members = $group['members'] ?? [];
            $members = array_filter($members, function($m) use ($userId) {
                return $m !== $userId;
            });
            $this->db->update("groups/{$groupId}", ['members' => array_values($members)]);
            $this->db->delete("users/{$userId}/groups/{$groupId}");
            return true;
        }
        
        return false;
    }
    
    /**
     * Get group members
     */
    public function getMembers($groupId) {
        $group = $this->getGroup($groupId);
        return $group ? ($group['members'] ?? []) : [];
    }
    
    /**
     * Get group by unique code
     */
    public function getGroupByCode($groupCode) {
        $groups = $this->db->get("groups");
        
        if (!$groups || !is_array($groups)) {
            return null;
        }
        
        foreach ($groups as $groupId => $groupData) {
            if (isset($groupData['group_code']) && $groupData['group_code'] === strtoupper($groupCode)) {
                $groupData['id'] = $groupId;
                return $groupData;
            }
        }
        
        return null;
    }
    
    /**
     * Join group by code
     */
    public function joinGroup($userId, $groupCode) {
        // Get group by code
        $group = $this->getGroupByCode($groupCode);
        
        if (!$group) {
            return ['success' => false, 'message' => 'Kode grup tidak ditemukan'];
        }
        
        $groupId = $group['id'];
        
        // Check if already a member
        $members = $group['members'] ?? [];
        if (in_array($userId, $members)) {
            return ['success' => false, 'message' => 'Anda sudah menjadi anggota grup ini'];
        }
        
        // Add member to group
        $members[] = $userId;
        $this->db->update("groups/{$groupId}", ['members' => $members]);
        
        // Add group to user's group list
        $this->addGroupToUser($userId, $groupId);
        
        return [
            'success' => true,
            'message' => 'Berhasil bergabung ke grup',
            'group' => $group
        ];
    }
}

