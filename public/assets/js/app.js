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

// currentUser will be set from PHP or Firebase Auth
// Initialize with PHP values first, then override with Firebase if needed
if (typeof currentUser !== 'undefined' && currentUser && currentUser.id) {
    window.currentUser = currentUser;
    console.log('✅ currentUser from PHP:', currentUser);
} else {
    console.warn('⚠️ currentUser from PHP is empty, will try Firebase Auth');
    window.currentUser = { id: null, name: 'Guest' };
}

// ==========================================
// DOM Elements - will be populated after DOM ready
// ==========================================
let elements = {};

// ==========================================
// Initialize App
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Sendly Chat Application...');
    console.log('📝 currentUser at DOMContentLoaded:', window.currentUser);
    
    // Try to get user from Firebase Auth if PHP session is empty
    if (!window.currentUser.id && typeof firebase !== 'undefined' && firebase.auth) {
        console.log('🔄 Checking Firebase Auth state...');
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log('✅ Got user from Firebase Auth:', user.uid);
                window.currentUser = {
                    id: user.uid,
                    name: user.displayName || 'User',
                    email: user.email
                };
                // Update userCode display
                const userCodeEl = document.getElementById('userCode');
                if (userCodeEl) {
                    userCodeEl.textContent = user.uid;
                    userCodeEl.title = user.uid;
                }
                // Reload data with correct user
                loadContactsFromFirestore();
                loadGroupsFromFirestore();
            } else {
                console.error('❌ No user logged in Firebase');
            }
        });
    }
    
    // Get ALL elements after DOM is ready
    elements = {
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
        menuBtn: document.getElementById('menuBtn'),
        dropdownMenu: document.getElementById('dropdownMenu'),
        
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
    
    console.log('Forms found:', {
        addContactForm: !!elements.addContactForm,
        addGroupForm: !!elements.addGroupForm,
        joinGroupForm: !!elements.joinGroupForm
    });
    
    // Setup event listeners
    setupEventListeners();
    initializeEmojis();
    autoResizeTextarea();
    initializeDropdown();
    
    // Load contacts and groups from Firestore
    loadContactsFromFirestore();
    loadGroupsFromFirestore();
    
    // Clean URL on page load
    cleanURL();
    
    console.log('✅ Application initialized successfully');
});

// ==========================================
// Setup Event Listeners
// ==========================================
function setupEventListeners() {
    // Form submissions - IMPORTANT: Use direct event binding
    const addContactForm = document.getElementById('addContactForm');
    if (addContactForm) {
        addContactForm.onsubmit = function(e) {
            e.preventDefault();
            console.log('Add contact form submitted');
            handleAddContact(e);
            return false;
        };
        console.log('✅ Add contact form listener attached');
    } else {
        console.error('❌ Add contact form not found');
    }
    
    const addGroupForm = document.getElementById('addGroupForm');
    if (addGroupForm) {
        addGroupForm.onsubmit = function(e) {
            e.preventDefault();
            console.log('Add group form submitted');
            handleAddGroup(e);
            return false;
        };
        console.log('✅ Add group form listener attached');
    }
    
    const joinGroupForm = document.getElementById('joinGroupForm');
    if (joinGroupForm) {
        joinGroupForm.onsubmit = function(e) {
            e.preventDefault();
            console.log('Join group form submitted');
            handleJoinGroup(e);
            return false;
        };
        console.log('✅ Join group form listener attached');
    }
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
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
        elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // File attachment
    if (elements.attachBtn) {
        elements.attachBtn.addEventListener('click', () => elements.fileInput?.click());
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
    
    // Add buttons
    if (elements.addContactBtn) {
        elements.addContactBtn.addEventListener('click', () => {
            console.log('Opening add contact modal');
            openModal('addContactModal');
        });
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
    
    // Copy user code
    if (elements.copyUserCode) {
        elements.copyUserCode.addEventListener('click', copyUserCode);
    }
}

// ==========================================
// Load Contacts from Firestore
// ==========================================
async function loadContactsFromFirestore() {
    console.log('Loading contacts from Firestore...');
    
    if (typeof firebase === 'undefined') {
        console.log('Firebase not defined');
        return;
    }
    
    // Get current user
    const user = getCurrentUser();
    if (!user || !user.id) {
        console.log('No current user, will retry when Firebase Auth is ready');
        return;
    }
    
    try {
        console.log('Fetching contacts for user:', user.id);
        const contactsSnapshot = await firebase.firestore()
            .collection('users').doc(user.id)
            .collection('contacts')
            .get();
        
        console.log('Contacts snapshot size:', contactsSnapshot.size);
        
        const contactList = document.getElementById('contactList');
        if (!contactList) {
            console.log('Contact list element not found');
            return;
        }
        
        if (contactsSnapshot.empty) {
            contactList.innerHTML = `
                <div class="empty-list">
                    <i class="fas fa-user-plus"></i>
                    <p>Belum ada kontak</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        contactsSnapshot.forEach(doc => {
            const contact = doc.data();
            const avatar = contact.photoURL 
                ? `<img src="${contact.photoURL}" alt="Avatar">` 
                : '<i class="fas fa-user"></i>';
            
            html += `
                <div class="chat-item" data-id="${doc.id}" data-type="contact" data-name="${contact.name || 'User'}">
                    <div class="chat-avatar">${avatar}</div>
                    <div class="chat-info">
                        <h4 class="chat-name">${contact.name || 'User'}</h4>
                        <p class="chat-preview">${contact.email || ''}</p>
                    </div>
                </div>
            `;
        });
        
        contactList.innerHTML = html;
        
        // Re-attach click listeners
        contactList.querySelectorAll('.chat-item').forEach(item => {
            item.addEventListener('click', handleChatSelect);
        });
        
        console.log('✅ Contacts loaded from Firestore');
    } catch (error) {
        console.error('Error loading contacts:', error);
    }
}

// ==========================================
// Load Groups from Firestore
// ==========================================
async function loadGroupsFromFirestore() {
    console.log('Loading groups from Firestore...');
    
    if (typeof firebase === 'undefined') {
        console.log('Firebase not ready for groups');
        return;
    }
    
    // Get current user
    const user = getCurrentUser();
    if (!user || !user.id) {
        console.log('No current user for groups, will retry when Firebase Auth is ready');
        return;
    }
    
    try {
        const groupsSnapshot = await firebase.firestore()
            .collection('users').doc(user.id)
            .collection('groups')
            .get();
        
        const groupList = document.getElementById('groupList');
        if (!groupList) return;
        
        if (groupsSnapshot.empty) {
            groupList.innerHTML = `
                <div class="empty-list">
                    <i class="fas fa-user-group"></i>
                    <p>Belum ada grup</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        groupsSnapshot.forEach(doc => {
            const group = doc.data();
            const avatar = group.avatar 
                ? `<img src="${group.avatar}" alt="Avatar">` 
                : '<i class="fas fa-users"></i>';
            
            html += `
                <div class="chat-item" data-id="${doc.id}" data-type="group" data-name="${group.name || 'Group'}">
                    <div class="chat-avatar group-avatar">${avatar}</div>
                    <div class="chat-info">
                        <h4 class="chat-name">${group.name || 'Group'}</h4>
                        <p class="chat-preview">${group.description || 'Grup'}</p>
                    </div>
                </div>
            `;
        });
        
        groupList.innerHTML = html;
        
        // Re-attach click listeners
        groupList.querySelectorAll('.chat-item').forEach(item => {
            item.addEventListener('click', handleChatSelect);
        });
        
        console.log('✅ Groups loaded from Firestore');
    } catch (error) {
        console.error('Error loading groups:', error);
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
// Load Messages from Firestore
// ==========================================
let messagesUnsubscribe = null;

function loadMessages(chatId, chatType) {
    // Get current user
    const user = getCurrentUser();
    if (!user || !user.id) {
        console.error('Cannot load messages: currentUser not defined');
        showToast('Sesi tidak valid. Silakan login ulang.', 'error');
        return;
    }
    
    // Clear previous listener
    if (messagesUnsubscribe) {
        messagesUnsubscribe();
        messagesUnsubscribe = null;
    }
    
    // Clear messages - show empty state first, not loading
    if (elements.messagesList) {
        elements.messagesList.innerHTML = '';
    }
    
    // Create chat ID for private chats (sorted to ensure consistency)
    const chatDocId = chatType === 'group' 
        ? chatId 
        : [user.id, chatId].sort().join('_');
    
    const collectionPath = chatType === 'group'
        ? `groups/${chatId}/messages`
        : `chats/${chatDocId}/messages`;
    
    console.log('Loading messages from:', collectionPath);
    
    // Listen to messages in real-time
    messagesUnsubscribe = firebase.firestore()
        .collection(collectionPath.split('/')[0])
        .doc(collectionPath.split('/')[1])
        .collection('messages')
        .orderBy('timestamp', 'asc')
        .limitToLast(50)
        .onSnapshot((snapshot) => {
            if (elements.messagesList) {
                elements.messagesList.innerHTML = '';
            }
            
            if (snapshot.empty) {
                displayEmptyState();
                return;
            }
            
            snapshot.forEach(doc => {
                const message = doc.data();
                message.id = doc.id;
                displayMessage(message);
            });
            
            scrollToBottom();
        }, (error) => {
            console.error('Error loading messages:', error);
            displayEmptyState();
        });
}

// ==========================================
// Display Message
// ==========================================
function displayMessage(message) {
    if (!elements.messagesList) return;
    
    // Safe check for currentUser
    const user = getCurrentUser();
    const currentUserId = user ? user.id : null;
    const isSent = currentUserId && message.senderId === currentUserId;
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
    
    // Get current user
    const user = getCurrentUser();
    if (!user || !user.id) {
        showToast('Sesi tidak valid. Silakan login ulang.', 'error');
        return;
    }
    
    const text = elements.messageInput?.value.trim();
    const file = elements.fileInput?.files[0];
    
    // Don't do anything if empty
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
            senderId: user.id,
            senderName: user.name || 'User',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: new Date().toISOString()
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
        
        // Create chat ID for private chats (sorted to ensure consistency)
        const chatDocId = currentChatType === 'group' 
            ? currentChatId 
            : [user.id, currentChatId].sort().join('_');
        
        // Save message to Firestore
        if (currentChatType === 'group') {
            await firebase.firestore()
                .collection('groups')
                .doc(currentChatId)
                .collection('messages')
                .add(message);
        } else {
            // Create or update chat document first
            const chatRef = firebase.firestore().collection('chats').doc(chatDocId);
            await chatRef.set({
                participants: [user.id, currentChatId],
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            // Add message
            await chatRef.collection('messages').add(message);
        }
        
        // Clear input
        if (elements.messageInput) {
            elements.messageInput.value = '';
            elements.messageInput.style.height = 'auto';
        }
        clearFilePreview();
        
    } catch (error) {
        console.error('Error sending message:', error);
        showToast('Gagal mengirim pesan: ' + error.message, 'error');
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
// Helper: Get Current User (from PHP or Firebase)
// ==========================================
function getCurrentUser() {
    // First check window.currentUser (set from PHP or earlier Firebase check)
    if (window.currentUser && window.currentUser.id) {
        return window.currentUser;
    }
    
    // Fallback: Check Firebase Auth directly
    if (typeof firebase !== 'undefined' && firebase.auth) {
        const firebaseUser = firebase.auth().currentUser;
        if (firebaseUser) {
            window.currentUser = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'User',
                email: firebaseUser.email
            };
            return window.currentUser;
        }
    }
    
    return null;
}

// ==========================================
// Add Contact
// ==========================================
async function handleAddContact(e) {
    e.preventDefault();
    console.log('handleAddContact called');
    
    // Get current user
    const user = getCurrentUser();
    if (!user || !user.id) {
        showToast('Sesi tidak valid. Silakan login ulang.', 'error');
        console.error('currentUser is not defined or invalid. user:', user);
        return;
    }
    
    const formData = new FormData(e.target);
    const userCode = formData.get('user_code');
    
    if (!userCode || !userCode.trim()) {
        showToast('Kode pengguna wajib diisi', 'error');
        return;
    }
    
    const trimmedCode = userCode.trim();
    console.log('User code entered:', trimmedCode);
    console.log('Current user:', user);
    
    // Check if trying to add self
    if (trimmedCode === user.id) {
        showToast('Tidak dapat menambahkan diri sendiri', 'error');
        return;
    }
    
    // Check if Firebase is ready
    if (typeof firebase === 'undefined' || !firebase.firestore) {
        showToast('Firebase belum siap, coba lagi', 'error');
        console.error('Firebase not ready');
        return;
    }
    
    try {
        showToast('Mencari pengguna...', 'info');
        
        // First, verify user exists in Firestore
        console.log('Searching for user:', trimmedCode);
        const userDoc = await firebase.firestore().collection('users').doc(trimmedCode).get();
        
        console.log('User doc exists:', userDoc.exists);
        
        if (!userDoc.exists) {
            showToast('Kode pengguna tidak ditemukan', 'error');
            return;
        }
        
        const targetUser = userDoc.data();
        console.log('Target user data:', targetUser);
        
        // Check if contact already exists
        const existingContact = await firebase.firestore()
            .collection('users').doc(user.id)
            .collection('contacts').doc(trimmedCode).get();
        
        if (existingContact.exists) {
            showToast('Kontak sudah ada', 'error');
            return;
        }
        
        // Add contact to current user's contacts subcollection
        await firebase.firestore()
            .collection('users').doc(user.id)
            .collection('contacts').doc(trimmedCode).set({
                user_id: trimmedCode,
                name: targetUser.name || 'User',
                email: targetUser.email || null,
                photoURL: targetUser.photoURL || null,
                user_code: trimmedCode,
                added_at: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        showToast('Kontak berhasil ditambahkan!', 'success');
        closeModal('addContactModal');
        e.target.reset();
        
        // Reload contacts
        loadContactsFromFirestore();
    } catch (error) {
        console.error('Error adding contact:', error);
        showToast('Terjadi kesalahan: ' + error.message, 'error');
    }
}

// ==========================================
// Add Group
// ==========================================
async function handleAddGroup(e) {
    e.preventDefault();
    console.log('handleAddGroup called');
    
    // Get current user
    const user = getCurrentUser();
    if (!user || !user.id) {
        showToast('Sesi tidak valid. Silakan login ulang.', 'error');
        console.error('currentUser is not defined or invalid. user:', user);
        return;
    }
    
    const formData = new FormData(e.target);
    const groupName = formData.get('name');
    const groupDescription = formData.get('description') || '';
    
    console.log('Group name:', groupName);
    console.log('Current user for group:', user);
    
    if (!groupName || !groupName.trim()) {
        showToast('Nama grup wajib diisi', 'error');
        return;
    }
    
    // Check if Firebase is ready
    if (typeof firebase === 'undefined' || !firebase.firestore) {
        showToast('Firebase belum siap, coba lagi', 'error');
        console.error('Firebase not ready');
        return;
    }
    
    try {
        showToast('Membuat grup...', 'info');
        
        // Generate a simple group code
        const groupCode = generateGroupCode();
        
        // Create group in Firestore
        const groupRef = await firebase.firestore().collection('groups').add({
            name: groupName.trim(),
            description: groupDescription,
            code: groupCode,
            owner_id: user.id,
            members: [user.id],
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            updated_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('Group created with ID:', groupRef.id);
        
        // Add group to user's groups subcollection
        await firebase.firestore()
            .collection('users').doc(user.id)
            .collection('groups').doc(groupRef.id).set({
                group_id: groupRef.id,
                name: groupName.trim(),
                code: groupCode,
                role: 'owner',
                joined_at: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        showToast(`Grup berhasil dibuat! Kode: ${groupCode}`, 'success');
        
        // Show group code in modal temporarily
        const modal = document.getElementById('addGroupModal');
        const modalContent = modal.querySelector('.modal-content');
        
        // Remove existing code display if any
        const existingDisplay = modalContent.querySelector('.group-code-display');
        if (existingDisplay) existingDisplay.remove();
        
        // Create group code display
        const codeDisplay = document.createElement('div');
        codeDisplay.className = 'group-code-display';
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
        
        // Reload groups
        setTimeout(() => {
            loadGroupsFromFirestore();
        }, 1000);
        
    } catch (error) {
        console.error('Error creating group:', error);
        showToast('Terjadi kesalahan: ' + error.message, 'error');
    }
}

// Generate random group code
function generateGroupCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
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
    console.log('handleJoinGroup called');
    
    // Get current user
    const user = getCurrentUser();
    if (!user || !user.id) {
        showToast('Sesi tidak valid. Silakan login ulang.', 'error');
        console.error('currentUser is not defined or invalid. user:', user);
        return;
    }
    
    const formData = new FormData(e.target);
    const rawCode = formData.get('group_code');
    
    if (!rawCode || !rawCode.trim()) {
        showToast('Kode grup wajib diisi', 'error');
        return;
    }
    
    const groupCode = rawCode.trim().toUpperCase();
    console.log('Group code entered:', groupCode);
    
    // Check if Firebase is ready
    if (typeof firebase === 'undefined' || !firebase.firestore) {
        showToast('Firebase belum siap, coba lagi', 'error');
        console.error('Firebase not ready');
        return;
    }
    
    try {
        showToast('Mencari grup...', 'info');
        
        // Search for group by code
        const groupsSnapshot = await firebase.firestore()
            .collection('groups')
            .where('code', '==', groupCode)
            .limit(1)
            .get();
        
        if (groupsSnapshot.empty) {
            showToast('Kode grup tidak ditemukan', 'error');
            return;
        }
        
        const groupDoc = groupsSnapshot.docs[0];
        const groupData = groupDoc.data();
        const groupId = groupDoc.id;
        
        console.log('Found group:', groupData);
        
        // Check if already a member
        if (groupData.members && groupData.members.includes(user.id)) {
            showToast('Anda sudah menjadi anggota grup ini', 'error');
            return;
        }
        
        // Add user to group members
        await firebase.firestore().collection('groups').doc(groupId).update({
            members: firebase.firestore.FieldValue.arrayUnion(user.id),
            updated_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Add group to user's groups subcollection
        await firebase.firestore()
            .collection('users').doc(user.id)
            .collection('groups').doc(groupId).set({
                group_id: groupId,
                name: groupData.name,
                code: groupCode,
                role: 'member',
                joined_at: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        showToast('Berhasil bergabung ke grup!', 'success');
        closeModal('joinGroupModal');
        e.target.reset();
        
        // Reload groups
        loadGroupsFromFirestore();
        
    } catch (error) {
        console.error('Error joining group:', error);
        showToast('Terjadi kesalahan: ' + error.message, 'error');
    }
}

// ==========================================
// Dropdown Menu
// ==========================================
function initializeDropdown() {
    const menuBtn = elements.menuBtn;
    const dropdownMenu = elements.dropdownMenu;
    
    if (menuBtn && dropdownMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                dropdownMenu.classList.remove('show');
            }
        });
    }
    
    // Settings Button
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    
    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            settingsModal.classList.remove('hidden');
            dropdownMenu.classList.remove('show');
        });
    }
    
    // Initialize settings functionality
    initializeSettings();
}

// ==========================================
// Settings Functionality
// ==========================================
function initializeSettings() {
    // Change Email
    const changeEmailBtn = document.getElementById('changeEmailBtn');
    const changeEmailForm = document.getElementById('changeEmailForm');
    const cancelEmailChange = document.getElementById('cancelEmailChange');
    const saveEmailChange = document.getElementById('saveEmailChange');
    
    if (changeEmailBtn && changeEmailForm) {
        changeEmailBtn.addEventListener('click', () => {
            changeEmailForm.classList.toggle('hidden');
        });
        
        cancelEmailChange?.addEventListener('click', () => {
            changeEmailForm.classList.add('hidden');
            document.getElementById('newEmail').value = '';
            document.getElementById('emailPassword').value = '';
        });
        
        saveEmailChange?.addEventListener('click', async () => {
            const newEmail = document.getElementById('newEmail').value.trim();
            const password = document.getElementById('emailPassword').value;
            
            if (!newEmail || !password) {
                showToast('Semua field harus diisi', 'error');
                return;
            }
            
            try {
                // Re-authenticate user
                const user = firebase.auth().currentUser;
                const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
                await user.reauthenticateWithCredential(credential);
                
                // Update email
                await user.updateEmail(newEmail);
                await user.sendEmailVerification();
                
                showToast('Email berhasil diubah! Silakan verifikasi email baru.', 'success');
                document.getElementById('currentEmailDisplay').textContent = newEmail;
                changeEmailForm.classList.add('hidden');
                document.getElementById('newEmail').value = '';
                document.getElementById('emailPassword').value = '';
            } catch (error) {
                console.error('Change email error:', error);
                if (error.code === 'auth/wrong-password') {
                    showToast('Password salah', 'error');
                } else if (error.code === 'auth/email-already-in-use') {
                    showToast('Email sudah digunakan', 'error');
                } else {
                    showToast('Gagal mengubah email', 'error');
                }
            }
        });
    }
    
    // Change Password
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const changePasswordForm = document.getElementById('changePasswordForm');
    const cancelPasswordChange = document.getElementById('cancelPasswordChange');
    const savePasswordChange = document.getElementById('savePasswordChange');
    
    if (changePasswordBtn && changePasswordForm) {
        changePasswordBtn.addEventListener('click', () => {
            changePasswordForm.classList.toggle('hidden');
        });
        
        cancelPasswordChange?.addEventListener('click', () => {
            changePasswordForm.classList.add('hidden');
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmNewPassword').value = '';
        });
        
        savePasswordChange?.addEventListener('click', async () => {
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;
            
            if (!currentPassword || !newPassword || !confirmNewPassword) {
                showToast('Semua field harus diisi', 'error');
                return;
            }
            
            if (newPassword !== confirmNewPassword) {
                showToast('Password baru tidak cocok', 'error');
                return;
            }
            
            if (newPassword.length < 6) {
                showToast('Password minimal 6 karakter', 'error');
                return;
            }
            
            try {
                const user = firebase.auth().currentUser;
                const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
                await user.reauthenticateWithCredential(credential);
                await user.updatePassword(newPassword);
                
                showToast('Password berhasil diubah!', 'success');
                changePasswordForm.classList.add('hidden');
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmNewPassword').value = '';
            } catch (error) {
                console.error('Change password error:', error);
                if (error.code === 'auth/wrong-password') {
                    showToast('Password saat ini salah', 'error');
                } else {
                    showToast('Gagal mengubah password', 'error');
                }
            }
        });
    }
    
    // Delete Account
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const deleteAccountModal = document.getElementById('deleteAccountModal');
    const confirmDeleteAccount = document.getElementById('confirmDeleteAccount');
    
    if (deleteAccountBtn && deleteAccountModal) {
        deleteAccountBtn.addEventListener('click', () => {
            deleteAccountModal.classList.remove('hidden');
        });
        
        confirmDeleteAccount?.addEventListener('click', async () => {
            const password = document.getElementById('deletePassword').value;
            
            if (!password) {
                showToast('Masukkan password untuk konfirmasi', 'error');
                return;
            }
            
            try {
                const user = firebase.auth().currentUser;
                const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
                await user.reauthenticateWithCredential(credential);
                
                // Delete user data from Firestore
                await firebase.firestore().collection('users').doc(user.uid).delete();
                
                // Delete user account
                await user.delete();
                
                showToast('Akun berhasil dihapus', 'success');
                setTimeout(() => {
                    window.location.href = BASE_URL + '/login';
                }, 1500);
            } catch (error) {
                console.error('Delete account error:', error);
                if (error.code === 'auth/wrong-password') {
                    showToast('Password salah', 'error');
                } else {
                    showToast('Gagal menghapus akun', 'error');
                }
            }
        });
    }
    
    // Close modal buttons for settings
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.modal;
            if (modalId) {
                document.getElementById(modalId)?.classList.add('hidden');
            }
        });
    });
}

// ==========================================
// Clean URL Function
// ==========================================
function cleanURL() {
    // Remove route from URL, keep only base path
    const basePath = '/Website-Platform/';
    if (window.location.pathname !== basePath && window.location.pathname !== basePath.slice(0, -1)) {
        history.replaceState(null, '', basePath);
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
