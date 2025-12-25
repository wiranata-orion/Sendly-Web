<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sendly - Chat Application</title>
    <link rel="stylesheet" href="<?= BASE_URL ?>/public/assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="app-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <!-- Sidebar Header -->
            <div class="sidebar-header">
                <div class="user-info">
                    <div class="avatar" id="userAvatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <span class="user-name"><?= htmlspecialchars($user['name']) ?></span>
                        <div class="user-code-display">
                            <span class="user-code" id="userCode" title="<?= htmlspecialchars($user['user_code'] ?? '') ?>"><?= htmlspecialchars($user['user_code'] ?? 'Loading...') ?></span>
                            <button class="icon-btn-small" id="copyUserCode" title="Copy Kode">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="header-actions">
                    <div class="dropdown">
                        <button class="icon-btn" id="menuBtn" title="Menu">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="dropdown-menu" id="dropdownMenu">
                            <a href="#" class="dropdown-item" id="settingsBtn">
                                <i class="fas fa-cog"></i> Pengaturan
                            </a>
                            <div class="dropdown-divider"></div>
                            <a href="<?= BASE_URL ?>/auth/logout" class="dropdown-item text-danger" id="logoutBtn">
                                <i class="fas fa-sign-out-alt"></i> Keluar
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Search Box -->
            <div class="search-box" id="searchBox">
                <input type="text" id="searchInput" placeholder="Cari kontak atau grup...">
            </div>

            <!-- Tabs -->
            <div class="sidebar-tabs">
                <button class="tab-btn active" data-tab="contacts">
                    <i class="fas fa-user"></i> Kontak
                </button>
                <button class="tab-btn" data-tab="groups">
                    <i class="fas fa-users"></i> Grup
                </button>
                <button class="tab-btn request-btn" id="requestBtn" data-tab="requests" title="Permintaan Kontak">
                    <i class="fas fa-envelope"></i>
                    <span class="request-badge hidden" id="requestBadge">0</span>
                </button>
            </div>

            <!-- Contact List -->
            <div class="chat-list" id="contactList">
                <?php if (!empty($contacts) && is_array($contacts)): ?>
                    <?php foreach ($contacts as $contact): ?>
                        <?php if (isset($contact['id']) && isset($contact['name'])): ?>
                        <div class="chat-item" data-id="<?= htmlspecialchars($contact['id']) ?>" data-type="contact" data-name="<?= htmlspecialchars($contact['name']) ?>">
                            <div class="chat-avatar">
                                <?php if (!empty($contact['avatar'])): ?>
                                    <img src="<?= htmlspecialchars($contact['avatar']) ?>" alt="Avatar">
                                <?php else: ?>
                                    <i class="fas fa-user"></i>
                                <?php endif; ?>
                            </div>
                            <div class="chat-info">
                                <h4 class="chat-name"><?= htmlspecialchars($contact['name']) ?></h4>
                                <p class="chat-preview"><?= htmlspecialchars($contact['phone'] ?? '') ?></p>
                            </div>
                        </div>
                        <?php endif; ?>
                    <?php endforeach; ?>
                <?php else: ?>
                    <div class="empty-list">
                        <i class="fas fa-user-plus"></i>
                        <p>Belum ada kontak</p>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Request List (Hidden by default) -->
            <div class="chat-list hidden" id="requestList">
                <div class="empty-list">
                    <i class="fas fa-envelope-open"></i>
                    <p>Tidak ada permintaan kontak</p>
                </div>
            </div>

            <!-- Group List -->
            <div class="chat-list hidden" id="groupList">
                <?php if (!empty($groups) && is_array($groups)): ?>
                    <?php foreach ($groups as $group): ?>
                        <?php if (isset($group['id']) && isset($group['name'])): ?>
                        <div class="chat-item" data-id="<?= htmlspecialchars($group['id']) ?>" data-type="group" data-name="<?= htmlspecialchars($group['name']) ?>">
                            <div class="chat-avatar group-avatar">
                                <?php if (!empty($group['avatar'])): ?>
                                    <img src="<?= htmlspecialchars($group['avatar']) ?>" alt="Avatar">
                                <?php else: ?>
                                    <i class="fas fa-users"></i>
                                <?php endif; ?>
                            </div>
                            <div class="chat-info">
                                <h4 class="chat-name"><?= htmlspecialchars($group['name']) ?></h4>
                                <p class="chat-preview"><?= htmlspecialchars($group['description'] ?? 'Grup') ?></p>
                            </div>
                        </div>
                        <?php endif; ?>
                    <?php endforeach; ?>
                <?php else: ?>
                    <div class="empty-list">
                        <i class="fas fa-user-group"></i>
                        <p>Belum ada grup</p>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Add Button -->
            <div class="sidebar-footer">
                <button class="add-btn" id="addContactBtn" title="Tambah Kontak">
                    <i class="fas fa-user-plus"></i>
                    <span>Tambah Kontak</span>
                </button>
                <div class="group-actions hidden" id="groupActions">
                    <button class="add-btn" id="addGroupBtn" title="Buat Grup">
                        <i class="fas fa-plus-circle"></i>
                        <span>Buat Grup</span>
                    </button>
                    <button class="add-btn" id="joinGroupBtn" title="Gabung Grup">
                        <i class="fas fa-sign-in-alt"></i>
                        <span>Gabung</span>
                    </button>
                </div>
            </div>
        </aside>

        <!-- Main Chat Area -->
        <main class="chat-area">
            <!-- Chat Header -->
            <div class="chat-header" id="chatHeader">
                <div class="chat-header-info">
                    <div class="chat-avatar" id="chatAvatar">
                        <i class="fas fa-comments"></i>
                    </div>
                    <div class="chat-details">
                        <h3 id="chatName">Sendly</h3>
                        <span id="chatStatus">Pilih kontak atau grup untuk memulai</span>
                    </div>
                </div>
            </div>

            <!-- Messages Container -->
            <div class="messages-container" id="messagesContainer">
                <div class="welcome-message" id="welcomeMessage">
                    <i class="fas fa-comments"></i>
                    <h2>Selamat Datang di Sendly</h2>
                    <p>Pilih kontak atau grup untuk memulai percakapan</p>
                </div>
                <div class="messages-list hidden" id="messagesList">
                    <!-- Messages will be loaded here -->
                </div>
            </div>

            <!-- Message Input -->
            <div class="message-input-area hidden" id="messageInputArea">
                <div class="input-container">
                    <button class="icon-btn" id="attachBtn" title="Lampirkan File">
                        <i class="fas fa-paperclip"></i>
                    </button>
                    <input type="file" id="fileInput" hidden>
                    
                    <div class="message-input-wrapper">
                        <textarea id="messageInput" placeholder="Ketik pesan..." rows="1"></textarea>
                    </div>
                    
                    <button class="icon-btn emoji-btn" id="emojiBtn" title="Emoji">
                        <i class="fas fa-smile"></i>
                    </button>
                    
                    <button class="send-btn" id="sendBtn" title="Kirim">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                
                <!-- File Preview -->
                <div class="file-preview hidden" id="filePreview">
                    <div class="file-preview-content">
                        <i class="fas fa-file" id="fileIcon"></i>
                        <span id="fileName">filename.pdf</span>
                        <button class="icon-btn" id="removeFile">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Add Contact Modal -->
    <div class="modal hidden" id="addContactModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Kirim Permintaan Kontak</h3>
                <button class="icon-btn close-modal" data-modal="addContactModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="addContactForm">
                <div class="form-group">
                    <label for="contactCode">Kode Pengguna (UID)</label>
                    <input type="text" id="contactCode" name="user_code" required placeholder="Paste kode UID pengguna" style="width: 100%; font-family: monospace; font-size: 12px;">
                    <small style="color: var(--text-muted); font-size: 12px; margin-top: 4px; display: block;">
                        <i class="fas fa-info-circle"></i> Minta pengguna untuk copy kode UID-nya, lalu paste di sini. Permintaan akan dikirim dan menunggu persetujuan.
                    </small>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary close-modal" data-modal="addContactModal">Batal</button>
                    <button type="submit" class="btn btn-primary">Kirim Permintaan</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Add Group Modal -->
    <div class="modal hidden" id="addGroupModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Buat Grup Baru</h3>
                <button class="icon-btn close-modal" data-modal="addGroupModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <!-- Create Group Form -->
            <form id="addGroupForm">
                <div class="form-group">
                    <label for="groupName">Nama Grup</label>
                    <input type="text" id="groupName" name="name" required placeholder="Masukkan nama grup">
                </div>
                <div class="form-group">
                    <label for="groupDescription">Deskripsi (Opsional)</label>
                    <textarea id="groupDescription" name="description" placeholder="Deskripsi grup..."></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary close-modal" data-modal="addGroupModal">Batal</button>
                    <button type="submit" class="btn btn-primary">Buat Grup</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Join Group Modal -->
    <div class="modal hidden" id="joinGroupModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Gabung Grup</h3>
                <button class="icon-btn close-modal" data-modal="joinGroupModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <!-- Join Group Form -->
            <form id="joinGroupForm">
                <div class="form-group">
                    <label for="groupCode">Kode Grup</label>
                    <input type="text" id="groupCode" name="group_code" required placeholder="Masukkan kode grup" style="text-transform: uppercase; width: 100%; font-family: monospace; letter-spacing: 1px;">
                    <small style="color: var(--text-muted); font-size: 12px; margin-top: 4px; display: block;">
                        <i class="fas fa-info-circle"></i> Minta kode grup dari admin grup
                    </small>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary close-modal" data-modal="joinGroupModal">Batal</button>
                    <button type="submit" class="btn btn-primary">Gabung Grup</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Settings Modal -->
    <?php include __DIR__ . '/../settings/index.php'; ?>

    <!-- Emoji Picker -->
    <div class="emoji-picker hidden" id="emojiPicker">
        <div class="emoji-grid">
            <!-- Emojis will be loaded here -->
        </div>
    </div>

    <!-- Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js"></script>

    <!-- Firebase Configuration from separate file -->
    <script src="<?= BASE_URL ?>/public/firebase-config.js"></script>

    <!-- Application Configuration -->
    <script>
        // Current user info - Debug: Check if user data is properly set
        const currentUser = {
            id: "<?= isset($user['id']) && !empty($user['id']) ? $user['id'] : '' ?>",
            name: "<?= isset($user['name']) ? htmlspecialchars($user['name']) : 'User' ?>"
        };
        
        // Debug log
        console.log('🔑 PHP User ID:', currentUser.id || 'EMPTY');
        console.log('👤 PHP User Name:', currentUser.name);
        
        if (!currentUser.id) {
            console.error('❌ User ID is empty! Session may not be set correctly.');
        }
        
        // Base URL
        const BASE_URL = "<?= BASE_URL ?>";
    </script>

    <!-- Main JavaScript -->
    <script src="<?= BASE_URL ?>/public/assets/js/app.js"></script>
</body>
</html>
