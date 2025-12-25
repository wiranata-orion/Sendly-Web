/**
 * Sendly Chat Application - Main JavaScript
 * Handles all chat functionality and Firebase interactions
 */

// ==========================================
// Global Variables
// ==========================================
let currentChatId = null;
let currentChatType = null; // 'contact' or 'group'
let currentChatName = null;
let messagesRef = null;
let messagesListener = null;

// ==========================================
// DOM Elements
// ==========================================
const elements = {
    // Sidebar
    searchInput: document.getElementById('searchInput'),
    tabButtons: document.querySelectorAll('.tab-btn'),
    contactList: document.getElementById('contactList'),
    groupList: document.getElementById('groupList'),
    addContactBtn: document.getElementById('addContactBtn'),
    addGroupBtn: document.getElementById('addGroupBtn'),
    joinGroupBtn: document.getElementById('joinGroupBtn'),
    groupActions: document.getElementById('groupActions'),
    copyUserCode: document.getElementById('copyUserCode'),
    userCode: document.getElementById('userCode'),
    
    // Chat Area
    chatHeader: document.getElementById('chatHeader'),
    chatName: document.getElementById('chatName'),
    chatStatus: document.getElementById('chatStatus'),
    chatAvatar: document.getElementById('chatAvatar'),
    messagesContainer: document.getElementById('messagesContainer'),
    welcomeMessage: document.getElementById('welcomeMessage'),
    messagesList: document.getElementById('messagesList'),
    
    // Message Input
    messageInputArea: document.getElementById('messageInputArea'),
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    attachBtn: document.getElementById('attachBtn'),
    emojiBtn: document.getElementById('emojiBtn'),
    fileInput: document.getElementById('fileInput'),
    filePreview: document.getElementById('filePreview'),
    fileName: document.getElementById('fileName'),
    removeFile: document.getElementById('removeFile'),
    
    // Modals
    addContactModal: document.getElementById('addContactModal'),
    addGroupModal: document.getElementById('addGroupModal'),
    joinGroupModal: document.getElementById('joinGroupModal'),
    addContactForm: document.getElementById('addContactForm'),
    addGroupForm: document.getElementById('addGroupForm'),
    joinGroupForm: document.getElementById('joinGroupForm'),
    
    // Emoji Picker
    emojiPicker: document.getElementById('emojiPicker'),
    emojiGrid: document.querySelector('.emoji-grid')
};

// ==========================================
// Initialize App
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Sendly Chat Application...');
    
    // Re-get ALL elements after DOM is ready
    elements.tabButtons = document.querySelectorAll('.tab-btn');
    elements.groupActions = document.getElementById('groupActions');
    elements.addContactBtn = document.getElementById('addContactBtn');
    elements.addGroupBtn = document.getElementById('addGroupBtn');
    elements.joinGroupBtn = document.getElementById('joinGroupBtn');
    elements.contactList = document.getElementById('contactList');
    elements.groupList = document.getElementById('groupList');
    
    console.log('Elements found:', {
        tabButtons: elements.tabButtons.length,
        groupActions: elements.groupActions,
        addContactBtn: elements.addContactBtn,
        addGroupBtn: elements.addGroupBtn,
        joinGroupBtn: elements.joinGroupBtn
    });
    
    initializeEventListeners();
    initializeEmojis();
    autoResizeTextarea();
    
    console.log('✅ Application initialized successfully');
});

// ==========================================
// Event Listeners
// ==========================================
function initializeEventListeners() {
    // Tab switching
    elements.tabButtons.forEach(btn => {
        btn.addEventListener('click', handleTabSwitch);
    });
    
    // Search functionality
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', handleSearch);
    }
    
    // Chat item selection
    document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', handleChatSelect);
    });
    
    // Message sending
    if (elements.sendBtn) {
        elements.sendBtn.addEventListener('click', sendMessage);
    }
    
    if (elements.messageInput) {
        elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // File attachment
    if (elements.attachBtn) {
        elements.attachBtn.addEventListener('click', () => {
            elements.fileInput.click();
        });
    }
    
    if (elements.fileInput) {
        elements.fileInput.addEventListener('change', handleFileSelect);
    }
    
    if (elements.removeFile) {
        elements.removeFile.addEventListener('click', clearFilePreview);
    }
    
    // Emoji picker
    if (elements.emojiBtn) {
        elements.emojiBtn.addEventListener('click', toggleEmojiPicker);
    }
    
    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.emoji-btn') && !e.target.closest('.emoji-picker')) {
            elements.emojiPicker?.classList.add('hidden');
        }
    });
    
    // Add contact/group modals
    if (elements.addContactBtn) {
        elements.addContactBtn.addEventListener('click', () => openModal('addContactModal'));
    }
    
    if (elements.addGroupBtn) {
        elements.addGroupBtn.addEventListener('click', () => openModal('addGroupModal'));
    }
    
    if (elements.joinGroupBtn) {
        elements.joinGroupBtn.addEventListener('click', () => openModal('joinGroupModal'));
    }
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = btn.getAttribute('data-modal');
            closeModal(modalId);
        });
    });
    
    // Close modal on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Form submissions
    if (elements.addContactForm) {
        elements.addContactForm.addEventListener('submit', handleAddContact);
    }
    
    if (elements.addGroupForm) {
        elements.addGroupForm.addEventListener('submit', handleAddGroup);
    }
    
    // Join group form
    if (elements.joinGroupForm) {
        elements.joinGroupForm.addEventListener('submit', handleJoinGroup);
    }
    
    // Copy user code
    if (elements.copyUserCode) {
        elements.copyUserCode.addEventListener('click', copyUserCode);
    }
}

// ==========================================
// Tab Switching
// ==========================================
function handleTabSwitch(e) {
    const tab = e.currentTarget.getAttribute('data-tab');
    
    console.log('Tab switched to:', tab);
    console.log('groupActions element:', elements.groupActions);
    
    // Update active tab
    elements.tabButtons.forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    // Show/hide lists
    if (tab === 'contacts') {
        elements.contactList?.classList.remove('hidden');
        elements.groupList?.classList.add('hidden');
        elements.addContactBtn?.classList.remove('hidden');
        elements.groupActions?.classList.add('hidden');
        console.log('Showing contact button, hiding group actions');
    } else if (tab === 'groups') {
        elements.contactList?.classList.add('hidden');
        elements.groupList?.classList.remove('hidden');
        elements.addContactBtn?.classList.add('hidden');
        elements.groupActions?.classList.remove('hidden');
        console.log('Hiding contact button, showing group actions');
    }
}

// ==========================================
// Search Functionality
// ==========================================
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const activeList = document.querySelector('.chat-list:not(.hidden)');
    
    if (!activeList) return;
    
    const chatItems = activeList.querySelectorAll('.chat-item');
    
    chatItems.forEach(item => {
        const name = item.getAttribute('data-name').toLowerCase();
        if (name.includes(query)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// ==========================================
// Chat Selection
// ==========================================
function handleChatSelect(e) {
    const chatItem = e.currentTarget;
    
    // Update active state
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    chatItem.classList.add('active');
    
    // Get chat info
    currentChatId = chatItem.getAttribute('data-id');
    currentChatType = chatItem.getAttribute('data-type');
    currentChatName = chatItem.getAttribute('data-name');
    
    // Update UI
    openChat(currentChatId, currentChatType, currentChatName);
    
    // Load messages
    loadMessages(currentChatId, currentChatType);
}

// ==========================================
// Open Chat
// ==========================================
function openChat(chatId, chatType, chatName) {
    // Hide welcome message
    elements.welcomeMessage?.classList.add('hidden');
    elements.messagesList?.classList.remove('hidden');
    elements.messageInputArea?.classList.remove('hidden');
    
    // Update chat header
    if (elements.chatName) {
        elements.chatName.textContent = chatName;
    }
    
    if (elements.chatStatus) {
        elements.chatStatus.textContent = chatType === 'group' ? 'Grup' : 'Online';
        if (chatType !== 'group') {
            elements.chatStatus.classList.add('online');
        }
    }
    
    // Update avatar icon
    if (elements.chatAvatar) {
        const icon = elements.chatAvatar.querySelector('i');
        if (icon) {
            icon.className = chatType === 'group' ? 'fas fa-users' : 'fas fa-user';
        }
    }
}

// ==========================================
// Load Messages from Firebase
// ==========================================
function loadMessages(chatId, chatType) {
    // Clear previous listener
    if (messagesListener && messagesRef) {
        messagesRef.off('child_added', messagesListener);
    }
    
    // Clear messages
    if (elements.messagesList) {
        elements.messagesList.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    }
    
    // Set messages reference
    const userId = currentUser.id;
    const path = chatType === 'group' 
        ? `groups/${chatId}/messages`
        : `chats/${userId}_${chatId}/messages`;
    
    messagesRef = database.ref(path);
    
    // Load existing messages
    messagesRef.orderByChild('timestamp').limitToLast(50).once('value')
        .then(snapshot => {
            if (elements.messagesList) {
                elements.messagesList.innerHTML = '';
            }
            
            if (!snapshot.exists()) {
                displayEmptyState();
                return;
            }
            
            const messages = [];
            snapshot.forEach(childSnapshot => {
                const message = childSnapshot.val();
                message.id = childSnapshot.key;
                messages.push(message);
            });
            
            messages.forEach(message => {
                displayMessage(message);
            });
            
            scrollToBottom();
        })
        .catch(error => {
            console.error('Error loading messages:', error);
            showToast('Gagal memuat pesan', 'error');
        });
    
    // Listen for new messages
    messagesListener = messagesRef.orderByChild('timestamp').limitToLast(1).on('child_added', (snapshot) => {
        const message = snapshot.val();
        message.id = snapshot.key;
        
        // Check if message already displayed (avoid duplicates on initial load)
        if (!document.querySelector(`[data-message-id="${message.id}"]`)) {
            displayMessage(message);
            scrollToBottom();
        }
    });
}

// ==========================================
// Display Message
// ==========================================
function displayMessage(message) {
    if (!elements.messagesList) return;
    
    const isSent = message.senderId === currentUser.id;
    const messageClass = isSent ? 'sent' : 'received';
    
    const messageEl = document.createElement('div');
    messageEl.className = `message ${messageClass}`;
    messageEl.setAttribute('data-message-id', message.id);
    
    let messageContent = `
        <div class="message-bubble">
    `;
    
    // Add sender name for group chats and received messages
    if (currentChatType === 'group' && !isSent) {
        messageContent += `<div class="message-sender">${escapeHtml(message.senderName || 'Unknown')}</div>`;
    }
    
    // Add message text
    if (message.text) {
        messageContent += `<div class="message-text">${escapeHtml(message.text)}</div>`;
    }
    
    // Add file if exists
    if (message.fileUrl) {
        if (message.fileType && message.fileType.startsWith('image/')) {
            messageContent += `<img src="${message.fileUrl}" alt="Image" class="message-image" onclick="window.open('${message.fileUrl}', '_blank')">`;
        } else {
            messageContent += `
                <div class="message-file" onclick="window.open('${message.fileUrl}', '_blank')">
                    <i class="fas fa-file"></i>
                    <div class="message-file-info">
                        <div class="message-file-name">${escapeHtml(message.fileName || 'File')}</div>
                        <div class="message-file-type">${message.fileType || 'file'}</div>
                    </div>
                </div>
            `;
        }
    }
    
    // Add timestamp
    const time = formatTime(message.timestamp);
    messageContent += `
            <div class="message-meta">
                <span class="message-time">${time}</span>
    `;
    
    if (isSent) {
        messageContent += `<i class="fas fa-check-double message-status"></i>`;
    }
    
    messageContent += `
            </div>
        </div>
    `;
    
    messageEl.innerHTML = messageContent;
    elements.messagesList.appendChild(messageEl);
}

// ==========================================
// Send Message
// ==========================================
async function sendMessage() {
    if (!currentChatId || !currentChatType) {
        showToast('Pilih chat terlebih dahulu', 'error');
        return;
    }
    
    const text = elements.messageInput?.value.trim();
    const file = elements.fileInput?.files[0];
    
    if (!text && !file) {
        return;
    }
    
    // Disable send button
    if (elements.sendBtn) {
        elements.sendBtn.disabled = true;
        elements.sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }
    
    try {
        const message = {
            senderId: currentUser.id,
            senderName: currentUser.name,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };
        
        if (text) {
            message.text = text;
        }
        
        // Upload file if exists
        if (file) {
            const fileUrl = await uploadFile(file);
            message.fileUrl = fileUrl;
            message.fileName = file.name;
            message.fileType = file.type;
        }
        
        // Save message to Firebase
        const userId = currentUser.id;
        const path = currentChatType === 'group' 
            ? `groups/${currentChatId}/messages`
            : `chats/${userId}_${currentChatId}/messages`;
        
        await database.ref(path).push(message);
        
        // Clear input
        if (elements.messageInput) {
            elements.messageInput.value = '';
            autoResizeTextarea();
        }
        clearFilePreview();
        
        showToast('Pesan terkirim', 'success');
        
    } catch (error) {
        console.error('Error sending message:', error);
        showToast('Gagal mengirim pesan', 'error');
    } finally {
        // Re-enable send button
        if (elements.sendBtn) {
            elements.sendBtn.disabled = false;
            elements.sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }
    }
}

// ==========================================
// File Upload
// ==========================================
async function uploadFile(file) {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = storage.ref(`uploads/${fileName}`);
    
    const snapshot = await storageRef.put(file);
    const downloadURL = await snapshot.ref.getDownloadURL();
    
    return downloadURL;
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showToast('Ukuran file maksimal 10MB', 'error');
        e.target.value = '';
        return;
    }
    
    // Show preview
    if (elements.filePreview && elements.fileName) {
        elements.fileName.textContent = file.name;
        elements.filePreview.classList.remove('hidden');
        
        // Update icon based on file type
        const fileIcon = document.getElementById('fileIcon');
        if (fileIcon) {
            if (file.type.startsWith('image/')) {
                fileIcon.className = 'fas fa-image';
            } else if (file.type.startsWith('video/')) {
                fileIcon.className = 'fas fa-video';
            } else if (file.type.includes('pdf')) {
                fileIcon.className = 'fas fa-file-pdf';
            } else {
                fileIcon.className = 'fas fa-file';
            }
        }
    }
}

function clearFilePreview() {
    if (elements.fileInput) {
        elements.fileInput.value = '';
    }
    if (elements.filePreview) {
        elements.filePreview.classList.add('hidden');
    }
}

// ==========================================
// Emoji Picker
// ==========================================
function initializeEmojis() {
    const emojis = [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
        '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
        '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
        '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
        '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
        '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
        '🤢', '🤮', '🤧', '🥵', '🥶', '😶‍🌫️', '🥴', '😵',
        '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟',
        '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦',
        '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖',
        '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡',
        '😠', '🤬', '👍', '👎', '👌', '✌️', '🤞', '🤟',
        '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👋',
        '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝',
        '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '❤️',
        '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎',
        '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘',
        '💝', '💟', '🔥', '✨', '💫', '⭐', '🌟', '✅'
    ];
    
    if (elements.emojiGrid) {
        elements.emojiGrid.innerHTML = '';
        emojis.forEach(emoji => {
            const emojiItem = document.createElement('div');
            emojiItem.className = 'emoji-item';
            emojiItem.textContent = emoji;
            emojiItem.addEventListener('click', () => {
                insertEmoji(emoji);
            });
            elements.emojiGrid.appendChild(emojiItem);
        });
    }
}

function toggleEmojiPicker(e) {
    e.stopPropagation();
    elements.emojiPicker?.classList.toggle('hidden');
}

function insertEmoji(emoji) {
    if (elements.messageInput) {
        const cursorPos = elements.messageInput.selectionStart;
        const textBefore = elements.messageInput.value.substring(0, cursorPos);
        const textAfter = elements.messageInput.value.substring(cursorPos);
        
        elements.messageInput.value = textBefore + emoji + textAfter;
        elements.messageInput.focus();
        
        // Set cursor after emoji
        const newCursorPos = cursorPos + emoji.length;
        elements.messageInput.setSelectionRange(newCursorPos, newCursorPos);
        
        autoResizeTextarea();
    }
}

// ==========================================
// Modal Functions
// ==========================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// ==========================================
// Add Contact
// ==========================================
async function handleAddContact(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userCode = formData.get('user_code').trim().toUpperCase();
    
    if (!userCode) {
        showToast('Kode pengguna wajib diisi', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/api/contacts/add-by-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_code: userCode })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast(result.message || 'Kontak berhasil ditambahkan!', 'success');
            closeModal('addContactModal');
            e.target.reset();
            
            // Reload page to show new contact
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showToast(result.message || 'Gagal menambah kontak', 'error');
        }
    } catch (error) {
        console.error('Error adding contact:', error);
        showToast('Terjadi kesalahan saat menambah kontak', 'error');
    }
}

// ==========================================
// Add Group
// ==========================================
async function handleAddGroup(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const groupData = {
        name: formData.get('name'),
        description: formData.get('description') || null
    };
    
    try {
        const response = await fetch(`${BASE_URL}/api/groups/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(groupData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success with group code
            const groupCode = result.group_code || 'N/A';
            showToast(`Grup berhasil dibuat! Kode: ${groupCode}`, 'success');
            
            // Show group code in modal temporarily
            const modal = document.getElementById('addGroupModal');
            const modalContent = modal.querySelector('.modal-content');
            
            // Create group code display
            const codeDisplay = document.createElement('div');
            codeDisplay.style.cssText = 'padding: 20px; text-align: center; background: var(--bg-glass); margin: 20px; border-radius: var(--radius-lg); border: 1px solid var(--border-color);';
            codeDisplay.innerHTML = `
                <p style="color: var(--text-secondary); margin-bottom: 10px; font-size: 14px;">Kode Grup Anda:</p>
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <span style="font-size: 24px; font-weight: 700; color: var(--primary-light); letter-spacing: 2px;">${groupCode}</span>
                    <button class="icon-btn" onclick="navigator.clipboard.writeText('${groupCode}'); showToast('Kode disalin!', 'success');" title="Copy">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                <p style="color: var(--text-muted); margin-top: 10px; font-size: 12px;">Bagikan kode ini untuk mengundang anggota</p>
            `;
            
            // Insert before form
            const form = modalContent.querySelector('#addGroupForm');
            form.parentElement.insertBefore(codeDisplay, form);
            
            // Reset form
            e.target.reset();
            
            // Reload page after 4 seconds
            setTimeout(() => {
                window.location.reload();
            }, 4000);
        } else {
            showToast(result.message || 'Gagal membuat grup', 'error');
        }
    } catch (error) {
        console.error('Error creating group:', error);
        showToast('Terjadi kesalahan saat membuat grup', 'error');
    }
}

// ==========================================
// Utility Functions
// ==========================================
function scrollToBottom() {
    if (elements.messagesContainer) {
        elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
    }
}

function displayEmptyState() {
    if (elements.messagesList) {
        elements.messagesList.innerHTML = `
            <div class="empty-list">
                <i class="fas fa-comments"></i>
                <p>Belum ada pesan</p>
            </div>
        `;
    }
}

function autoResizeTextarea() {
    if (elements.messageInput) {
        elements.messageInput.style.height = 'auto';
        elements.messageInput.style.height = elements.messageInput.scrollHeight + 'px';
        
        elements.messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    }
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// ==========================================
// Copy User Code Function
// ==========================================
function copyUserCode() {
    const userCodeEl = document.getElementById('userCode');
    if (!userCodeEl) return;
    
    const code = userCodeEl.textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        showToast('Kode berhasil disalin!', 'success');
        
        // Visual feedback
        const btn = document.getElementById('copyUserCode');
        const icon = btn.querySelector('i');
        icon.classList.remove('fa-copy');
        icon.classList.add('fa-check');
        
        setTimeout(() => {
            icon.classList.remove('fa-check');
            icon.classList.add('fa-copy');
        }, 2000);
    }).catch(err => {
        showToast('Gagal menyalin kode', 'error');
    });
}

// ==========================================
// Handle Join Group
// ==========================================
async function handleJoinGroup(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const groupCode = formData.get('group_code').trim().toUpperCase();
    
    if (!groupCode) {
        showToast('Kode grup wajib diisi', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/api/groups/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ group_code: groupCode })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast(result.message || 'Berhasil bergabung ke grup!', 'success');
            closeModal('addGroupModal');
            e.target.reset();
            
            // Reload page to show new group
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {join
            showToast(result.message || 'Gagal bergabung ke grup', 'error');
        }
    } catch (error) {
        console.error('Error joining group:', error);
        showToast('Terjadi kesalahan saat bergabung ke grup', 'error');
    }
}

// ==========================================
// CSS for fade out animation
// ==========================================
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translate(-50%, 0);
        }
        to {
            opacity: 0;
            transform: translate(-50%, 20px);
        }
    }
`;
document.head.appendChild(style);

console.log('✨ All functions loaded successfully');
