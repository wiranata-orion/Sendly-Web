<?php
/**
 * Group Controller
 * Handles group-related API endpoints
 */

class GroupController {
    private $groupModel;
    
    public function __construct() {
        $this->groupModel = new GroupModel();
    }
    
    /**
     * Get all groups
     */
    public function index() {
        header('Content-Type: application/json');
        
        $user = UserModel::getCurrentUser();
        $groups = $this->groupModel->getGroups($user['id']);
        
        echo json_encode([
            'success' => true,
            'groups' => $groups
        ]);
    }
    
    /**
     * Create new group (alias for add action)
     */
    public function add() {
        $this->create();
    }
    
    /**
     * Create new group
     */
    public function create() {
        header('Content-Type: application/json');
        
        try {
            $user = UserModel::getCurrentUser();
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['name'])) {
                echo json_encode(['success' => false, 'message' => 'Nama grup wajib diisi']);
                return;
            }
            
            $groupId = $this->groupModel->createGroup($user['id'], $data);
            
            if ($groupId) {
                // groupId is now an array with 'id' and 'group_code'
                $groupInfo = is_array($groupId) ? $groupId : ['id' => $groupId, 'group_code' => null];
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Grup berhasil dibuat',
                    'group_id' => $groupInfo['id'],
                    'group_code' => $groupInfo['group_code'],
                    'group' => [
                        'id' => $groupInfo['id'],
                        'name' => $data['name'],
                        'description' => $data['description'] ?? null,
                        'group_code' => $groupInfo['group_code']
                    ]
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Gagal membuat grup']);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }
    
    /**
     * Get single group
     */
    public function get($groupId = null) {
        header('Content-Type: application/json');
        
        if (!$groupId) {
            echo json_encode(['success' => false, 'error' => 'Group ID required']);
            return;
        }
        
        $group = $this->groupModel->getGroup($groupId);
        
        if ($group) {
            echo json_encode([
                'success' => true,
                'group' => $group
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Group not found']);
        }
    }
    
    /**
     * Update group
     */
    public function update($groupId = null) {
        header('Content-Type: application/json');
        
        if (!$groupId) {
            echo json_encode(['success' => false, 'error' => 'Group ID required']);
            return;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $result = $this->groupModel->updateGroup($groupId, $data);
        
        echo json_encode([
            'success' => true,
            'message' => 'Group updated'
        ]);
    }
    
    /**
     * Delete group
     */
    public function delete($groupId = null) {
        header('Content-Type: application/json');
        
        if (!$groupId) {
            echo json_encode(['success' => false, 'error' => 'Group ID required']);
            return;
        }
        
        $this->groupModel->deleteGroup($groupId);
        
        echo json_encode([
            'success' => true,
            'message' => 'Group deleted'
        ]);
    }
    
    /**
     * Add member to group
     */
    public function addMember($groupId = null) {
        header('Content-Type: application/json');
        
        if (!$groupId) {
            echo json_encode(['success' => false, 'error' => 'Group ID required']);
            return;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['user_id'])) {
            echo json_encode(['success' => false, 'error' => 'User ID required']);
            return;
        }
        
        $result = $this->groupModel->addMember($groupId, $data['user_id']);
        
        echo json_encode([
            'success' => $result,
            'message' => $result ? 'Member added' : 'Failed to add member'
        ]);
    }
    
    /**
     * Remove member from group
     */
    public function removeMember($groupId = null) {
        header('Content-Type: application/json');
        
        if (!$groupId) {
            echo json_encode(['success' => false, 'error' => 'Group ID required']);
            return;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['user_id'])) {
            echo json_encode(['success' => false, 'error' => 'User ID required']);
            return;
        }
        
        $result = $this->groupModel->removeMember($groupId, $data['user_id']);
        
        echo json_encode([
            'success' => $result,
            'message' => $result ? 'Member removed' : 'Failed to remove member'
        ]);
    }
    
    /**
     * Join group by unique code
     */
    public function join() {
        header('Content-Type: application/json');
        
        try {
            $user = UserModel::getCurrentUser();
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['group_code'])) {
                echo json_encode(['success' => false, 'message' => 'Kode grup wajib diisi']);
                return;
            }
            
            $result = $this->groupModel->joinGroup($user['id'], $data['group_code']);
            
            echo json_encode($result);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }
}

