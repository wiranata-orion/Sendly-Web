/**
 * Sendly Chat Application - Main JavaScript
 * Handles all chat functionality and Firebase interactions
 */

// Global Variables
// ==========================================
let currentChatId = null;
let currentChatType = null; // 'contact' or 'group'
let currentChatName = null;
let messagesRef = null;
let messagesListener = null;

// Unread messages tracking
let unreadMessages = {}; // {chatId: count}
let chatLastMessageTime = {}; // {chatId: timestamp} for sorting
let updateChatListOrderTimer = null; // Debounce timer for chat list reorder

// Track read chats to persist across page reloads
let readChats = {}; // {chatId: timestamp} - chats that have been marked as read

// Load read chats from localStorage FIRST
loadReadChatsFromStorage();

// Reset unread counts on page load to prevent stale data
function resetUnreadCounts(userId = null) {
    unreadMessages = {};
    chatLastMessageTime = {};
    
    // Reset read chats if user changed or logging out
    if (userId === null) {
        // Logging out - clear everything
        readChats = {};
        localStorage.removeItem('sendly_read_chats');
        localStorage.removeItem('sendly_current_user');
    } else {
        // Check if user changed
        const storedUserId = localStorage.getItem('sendly_current_user');
        if (storedUserId !== userId) {
            readChats = {};
            localStorage.setItem('sendly_current_user', userId);
        }
    }
    
    // Load read chats from localStorage
    loadReadChatsFromStorage();
}

// Load read chats from localStorage
function loadReadChatsFromStorage() {
    try {
        const stored = localStorage.getItem('sendly_read_chats');
        if (stored && stored !== 'undefined' && stored !== 'null') {
            const parsed = JSON.parse(stored);
            if (parsed && typeof parsed === 'object') {
                readChats = parsed;
                return;
            }
        }
        readChats = {};
    } catch (error) {
        console.error('Error loading read chats from storage:', error);
        readChats = {};
        // Try to clear corrupted data
        try {
            localStorage.removeItem('sendly_read_chats');
        } catch (e) {
            console.error('Could not clear corrupted localStorage');
        }
    }
}

// Save read chats to localStorage
function saveReadChatsToStorage() {
    try {
        localStorage.setItem('sendly_read_chats', JSON.stringify(readChats));
    } catch (error) {
        console.error('Error saving read chats to storage:', error);
    }
}

// Mark chat as read (persist across reloads)
function markChatAsReadLocally(chatId) {
    const user = getCurrentUser();
    if (!user || !user.id) return;
    
    readChats[chatId] = Date.now();
    saveReadChatsToStorage();
}

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
    
    // Load read chats first
    loadReadChatsFromStorage();
    
    // Reset unread counts to prevent stale data
    const user = getCurrentUser();
    resetUnreadCounts(user?.id);
    
    // Try to get user from Firebase Auth if PHP session is empty
    if (!window.currentUser.id && typeof firebase !== 'undefined' && firebase.auth) {
        console.log('🔄 Checking Firebase Auth state...');
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log('✅ Got user from Firebase Auth:', user.uid);
                window.currentUser = {
                    id: user.uid,
                    name: user.displayName || 'User',
                    email: user.email,
                    photoURL: user.photoURL
                };
                // Update userCode display
                const userCodeEl = document.getElementById('userCode');
                if (userCodeEl) {
                    userCodeEl.textContent = user.uid;
                    userCodeEl.title = user.uid;
                }
                // Reset unread counts for new user
                resetUnreadCounts(user.uid);
                // Reload read chats for this user
                loadReadChatsFromStorage();
                // Reload data with correct user
                loadContactsFromFirestore();
                loadGroupsFromFirestore();
                loadRequestsFromFirestore();
            } else {
                console.error('❌ No user logged in Firebase');
                // Cleanup listeners when user logs out
                resetUnreadCounts(null);
                cleanupChatMessageListeners();
                if (groupsUnsubscribe) {
                    groupsUnsubscribe();
                    groupsUnsubscribe = null;
                }
                if (contactsUnsubscribe) {
                    contactsUnsubscribe();
                    contactsUnsubscribe = null;
                }
                if (requestsUnsubscribe) {
                    requestsUnsubscribe();
                    requestsUnsubscribe = null;
                }
                if (messagesUnsubscribe) {
                    messagesUnsubscribe();
                    messagesUnsubscribe = null;
                }
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
        emojiGrid: document.querySelector('.emoji-grid'),
        
        // User Avatar
        userAvatar: document.getElementById('userAvatar')
    };
    
    console.log('Forms found:', {
        addContactForm: !!elements.addContactForm,
        addGroupForm: !!elements.addGroupForm,
        joinGroupForm: !!elements.joinGroupForm
    });
    
    // Setup event listeners
    setupEventListeners();
    initializeEmojis();
    initializeDropdown();
    
    // Load contacts, groups, and requests from Firestore
    loadContactsFromFirestore();
    loadGroupsFromFirestore();
    loadRequestsFromFirestore();
    
    // Load user profile photo
    loadUserProfile();
    
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
            if (e.key === 'Enter') {
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
        
        // Update unread counts for all contacts and listen for new messages
        contactsSnapshot.forEach(doc => {
            updateUnreadCount(doc.id, 'contact');
            // Start listening for messages from this contact
            listenForChatMessages(doc.id, 'contact');
        });
        
        console.log('✅ Contacts loaded from Firestore');
    } catch (error) {
        console.error('Error loading contacts:', error);
    }
}

// ==========================================
// Load Groups from Firestore
// ==========================================
// Global variable for groups listener
let groupsUnsubscribe = null;

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
    
    // Unsubscribe from previous listener
    if (groupsUnsubscribe) {
        groupsUnsubscribe();
    }
    
    try {
        // Listen to groups in real-time
        groupsUnsubscribe = firebase.firestore()
            .collection('users').doc(user.id)
            .collection('groups')
            .onSnapshot((snapshot) => {
                console.log('Groups snapshot received, size:', snapshot.size);
                
                const groupList = document.getElementById('groupList');
                if (!groupList) return;
                
                if (snapshot.empty) {
                    groupList.innerHTML = `
                        <div class="empty-list">
                            <i class="fas fa-user-group"></i>
                            <p>Belum ada grup</p>
                        </div>
                    `;
                    return;
                }
                
                let html = '';
                snapshot.forEach(doc => {
                    const group = doc.data();
                    const avatar = group.avatar 
                        ? `<img src="${group.avatar}" alt="Avatar">` 
                        : '<i class="fas fa-users"></i>';
                    
                    html += `
                        <div class="chat-item" data-id="${doc.id}" data-type="group" data-name="${group.name || 'Group'}">
                            <div class="chat-avatar group-avatar">${avatar}</div>
                            <div class="chat-info">
                                <h4 class="chat-name">${group.name || 'Group'}</h4>
                                ${group.description ? `<p class="chat-preview">${group.description}</p>` : ''}
                            </div>
                        </div>
                    `;
                });
                
                groupList.innerHTML = html;
                
                // Re-attach click listeners
                groupList.querySelectorAll('.chat-item').forEach(item => {
                    item.addEventListener('click', handleChatSelect);
                });
                
                // Update unread counts for all groups and listen for new messages
                snapshot.forEach(doc => {
                    updateUnreadCount(doc.id, 'group');
                    // Start listening for messages from this group
                    listenForChatMessages(doc.id, 'group');
                });
                
                console.log('✅ Groups loaded/updated from Firestore');
            }, (error) => {
                console.error('Error listening to groups:', error);
            });
    } catch (error) {
        console.error('Error setting up groups listener:', error);
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
    
    // Get request list element
    const requestList = document.getElementById('requestList');
    
    // Show/hide lists based on tab
    if (tab === 'contacts') {
        elements.contactList?.classList.remove('hidden');
        elements.groupList?.classList.add('hidden');
        requestList?.classList.add('hidden');
        elements.addContactBtn?.classList.remove('hidden');
        elements.groupActions?.classList.add('hidden');
        console.log('Showing contact button, hiding group actions');
    } else if (tab === 'groups') {
        elements.contactList?.classList.add('hidden');
        elements.groupList?.classList.remove('hidden');
        requestList?.classList.add('hidden');
        elements.addContactBtn?.classList.add('hidden');
        elements.groupActions?.classList.remove('hidden');
        console.log('Hiding contact button, showing group actions');
    } else if (tab === 'requests') {
        elements.contactList?.classList.add('hidden');
        elements.groupList?.classList.add('hidden');
        requestList?.classList.remove('hidden');
        elements.addContactBtn?.classList.add('hidden');
        elements.groupActions?.classList.add('hidden');
        console.log('Showing requests tab');
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
// Reset Chat Area
// ==========================================
function resetChatArea() {
    currentChatId = null;
    currentChatType = null;
    currentChatName = null;
    
    // Show welcome, hide messages
    if (elements.welcomeMessage) elements.welcomeMessage.classList.remove('hidden');
    if (elements.messagesList) {
        elements.messagesList.classList.add('hidden');
        elements.messagesList.innerHTML = '';
    }
    if (elements.messageInputArea) elements.messageInputArea.classList.add('hidden');
    
    // Reset header
    if (elements.chatName) elements.chatName.textContent = 'Sendly';
    if (elements.chatStatus) elements.chatStatus.textContent = 'Pilih kontak atau grup untuk memulai';
    if (elements.chatAvatar) {
        const icon = elements.chatAvatar.querySelector('i');
        if (icon) icon.className = 'fas fa-comments';
    }
    
    // Hide settings button
    showGroupSettingsButton(false, false);
    
    // Remove active state from all items
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
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
    
    try {
        // Immediately clear unread badge for better UX
        unreadMessages[currentChatId] = 0;
        updateChatListBadge(currentChatId, 0);
        // Don't call updateChatListOrder here - only reorder when new messages arrive
        
        // Mark chat as read locally (persist across reloads)
        markChatAsReadLocally(currentChatId);
        
        // Mark messages as read in database (async)
        markMessagesAsRead(currentChatId, currentChatType);
        
        // Update UI
        openChat(currentChatId, currentChatType, currentChatName);
        
        // Load messages
        loadMessages(currentChatId, currentChatType);
    } catch (error) {
        console.error('Error opening chat:', error);
        // Fallback: just open chat without marking as read
        openChat(currentChatId, currentChatType, currentChatName);
        loadMessages(currentChatId, currentChatType);
    }
}

// ==========================================
// Open Chat
// ==========================================
async function openChat(chatId, chatType, chatName) {
    // Hide welcome message
    elements.welcomeMessage?.classList.add('hidden');
    elements.messagesList?.classList.remove('hidden');
    elements.messageInputArea?.classList.remove('hidden');
    
    // Update chat header
    if (elements.chatName) {
        elements.chatName.textContent = chatName;
    }
    
    if (elements.chatStatus) {
        elements.chatStatus.textContent = chatType === 'group' ? 'Grup' : '';
        if (chatType !== 'group') {
            elements.chatStatus.classList.remove('online');
        }
    }
    
    // Update avatar icon
    if (elements.chatAvatar) {
        const icon = elements.chatAvatar.querySelector('i');
        if (icon) {
            icon.className = chatType === 'group' ? 'fas fa-users' : 'fas fa-user';
        }
    }
    
    // Show/hide group settings button (only for group owners)
    if (chatType === 'group') {
        const user = getCurrentUser();
        console.log('Checking group ownership for user:', user?.id);
        if (user && user.id) {
            try {
                const groupDoc = await firebase.firestore().collection('groups').doc(chatId).get();
                console.log('Group doc exists:', groupDoc.exists);
                if (groupDoc.exists) {
                    const groupData = groupDoc.data();
                    console.log('Group data:', groupData);
                    // Check if user is the creator/owner of the group
                    const isOwner = groupData.owner_id === user.id;
                    console.log('Is owner:', isOwner, 'owner_id:', groupData.owner_id, 'user.id:', user.id);
                    showGroupSettingsButton(true, isOwner);
                } else {
                    showGroupSettingsButton(false, false);
                }
            } catch (error) {
                console.error('Error checking group owner:', error);
                showGroupSettingsButton(false, false);
            }
        }
    } else {
        showGroupSettingsButton(false, false);
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
    
    // Flag to track if this is the first load
    let isFirstLoad = true;
    
    // Listen to messages in real-time
    messagesUnsubscribe = firebase.firestore()
        .collection(collectionPath.split('/')[0])
        .doc(collectionPath.split('/')[1])
        .collection('messages')
        .orderBy('timestamp', 'asc')
        .limitToLast(50)
        .onSnapshot((snapshot) => {
            if (snapshot.empty) {
                if (elements.messagesList) {
                    elements.messagesList.innerHTML = '';
                }
                displayEmptyState();
                return;
            }
            
            if (isFirstLoad) {
                // First load: display all existing messages in order
                isFirstLoad = false;
                if (elements.messagesList) {
                    elements.messagesList.innerHTML = '';
                }
                
                // Collect all messages and sort by timestamp
                const messages = [];
                snapshot.forEach(doc => {
                    const message = doc.data();
                    message.id = doc.id;
                    messages.push(message);
                });
                
                // Sort by timestamp to ensure correct order
                messages.sort((a, b) => {
                    const timeA = getTimestampValue(a.timestamp) || getTimestampValue(a.createdAt) || 0;
                    const timeB = getTimestampValue(b.timestamp) || getTimestampValue(b.createdAt) || 0;
                    return timeA - timeB;
                });
                
                // Display sorted messages
                messages.forEach(message => {
                    displayMessage(message);
                });
            } else {
                // Subsequent updates: re-render all messages to maintain order
                snapshot.docChanges().forEach((change) => {
                    const message = change.doc.data();
                    message.id = change.doc.id;
                    
                    if (change.type === 'added') {
                        // Insert message at correct position based on timestamp
                        displayMessageInOrder(message);
                        
                        // Update chat list order - move this chat to top
                        const msgTimestamp = getTimestampValue(message.timestamp) || getTimestampValue(message.createdAt) || Date.now();
                        const targetChatId = collectionPath.includes('groups') ? collectionPath.split('/')[1] : (currentChatId || collectionPath.split('/')[1].replace(/_/g, ''));
                        if (targetChatId) {
                            // For contacts, extract the other user's ID from the chat document ID
                            let orderChatId = targetChatId;
                            if (!collectionPath.includes('groups')) {
                                const user = getCurrentUser();
                                if (user && user.id) {
                                    const chatDocId = collectionPath.split('/')[1];
                                    const ids = chatDocId.split('_');
                                    orderChatId = ids.find(id => id !== user.id) || targetChatId;
                                }
                            }
                            // Only update if timestamp is newer
                            const existingTime = chatLastMessageTime[orderChatId] || 0;
                            if (msgTimestamp > existingTime) {
                                chatLastMessageTime[orderChatId] = msgTimestamp;
                                updateChatListOrder();
                            }
                        }
                        
                        // Update unread count if message is not from current user and this chat is not currently active
                        const user = getCurrentUser();
                        const chatId = collectionPath.split('/')[1];
                        const chatType = collectionPath.includes('groups') ? 'group' : 'contact';
                        
                        if (user && message.senderId !== user.id && 
                            (currentChatId !== chatId || currentChatType !== chatType)) {
                            // This is a new unread message for a chat that's not currently open
                            updateUnreadCount(chatId, chatType);
                        }
                    } else if (change.type === 'modified') {
                        // Update existing message - remove and re-insert at correct position
                        const existingMessage = elements.messagesList?.querySelector(`[data-message-id="${message.id}"]`);
                        if (existingMessage) {
                            existingMessage.remove();
                            displayMessageInOrder(message);
                        }
                    } else if (change.type === 'removed') {
                        // Remove deleted message
                        const existingMessage = elements.messagesList?.querySelector(`[data-message-id="${message.id}"]`);
                        if (existingMessage) {
                            existingMessage.remove();
                        }
                    }
                });
            }
            
            scrollToBottom();
        }, (error) => {
            console.error('Error loading messages:', error);
            displayEmptyState();
        });
}

// ==========================================
// Unread Messages Management
// ==========================================
function updateUnreadCount(chatId, chatType) {
    const user = getCurrentUser();
    if (!user || !user.id) return;
    
    // Create chat ID for private chats
    const chatDocId = chatType === 'group' 
        ? chatId 
        : [user.id, chatId].sort().join('_');
    
    const collectionPath = chatType === 'group'
        ? `groups/${chatId}/messages`
        : `chats/${chatDocId}/messages`;
    
    // Get messages to count unread ones
    firebase.firestore()
        .collection(collectionPath.split('/')[0])
        .doc(collectionPath.split('/')[1])
        .collection('messages')
        .orderBy('timestamp', 'desc')
        .limit(200) // Increase limit to catch more messages
        .get()
        .then((snapshot) => {
            let unreadCount = 0;
            snapshot.forEach(doc => {
                const message = doc.data();
                // Count messages not sent by current user and not read by current user
                if (message.senderId !== user.id && (!message.readBy || !message.readBy.includes(user.id))) {
                    unreadCount++;
                }
            });
            
            // If chat was marked as read locally and there are no unread messages, keep it as read
            if (readChats[chatId] && unreadCount === 0) {
                unreadMessages[chatId] = 0;
                updateChatListBadge(chatId, 0);
                updateChatListOrder();
                return;
            }
            
            // Update global tracking
            unreadMessages[chatId] = unreadCount;
            
            // Update UI
            updateChatListBadge(chatId, unreadCount);
            updateChatListOrder();
            
            console.log(`Unread count for ${chatType} ${chatId}: ${unreadCount}`);
        })
        .catch((error) => {
            console.error('Error counting unread messages:', error);
        });
}

function updateChatListBadge(chatId, count) {
    const chatItem = document.querySelector(`[data-id="${chatId}"]`);
    if (!chatItem) return;
    
    // Remove existing badge
    const existingBadge = chatItem.querySelector('.unread-badge');
    if (existingBadge) {
        existingBadge.remove();
    }
    
    // Add new badge if count > 0
    if (count > 0) {
        const badge = document.createElement('span');
        badge.className = 'unread-badge';
        badge.textContent = count > 99 ? '99+' : count;
        chatItem.appendChild(badge);
    }
}

function updateChatListOrder() {
    // Debounce to prevent rapid reordering which causes jumping
    if (updateChatListOrderTimer) {
        clearTimeout(updateChatListOrderTimer);
    }
    
    updateChatListOrderTimer = setTimeout(() => {
        const contactList = document.getElementById('contactList');
        const groupList = document.getElementById('groupList');
        
        if (!contactList && !groupList) return;
        
        // Function to sort chat items
        const sortChatItems = (list) => {
            if (!list) return;
            
            const items = Array.from(list.querySelectorAll('.chat-item'));
            
            // Check if reorder is actually needed
            let needsReorder = false;
            for (let i = 0; i < items.length - 1; i++) {
                const currentId = items[i].getAttribute('data-id');
                const nextId = items[i + 1].getAttribute('data-id');
                const currentTime = chatLastMessageTime[currentId] || 0;
                const nextTime = chatLastMessageTime[nextId] || 0;
                
                if (nextTime > currentTime) {
                    needsReorder = true;
                    break;
                }
            }
            
            if (!needsReorder) return;
            
            items.sort((a, b) => {
                const aId = a.getAttribute('data-id');
                const bId = b.getAttribute('data-id');
                
                // Primary sort: by last message time (newest first)
                const aTime = chatLastMessageTime[aId] || 0;
                const bTime = chatLastMessageTime[bId] || 0;
                
                if (aTime !== bTime) {
                    return bTime - aTime; // Newest first
                }
                
                // Secondary sort: if same time, prioritize unread messages
                const aUnread = unreadMessages[aId] || 0;
                const bUnread = unreadMessages[bId] || 0;
                
                if (aUnread > 0 && bUnread === 0) return -1;
                if (bUnread > 0 && aUnread === 0) return 1;
                
                return 0;
            });
            
            // Reorder DOM elements
            items.forEach(item => list.appendChild(item));
        };
        
        sortChatItems(contactList);
        sortChatItems(groupList);
    }, 300); // 300ms debounce
}

// ==========================================
// Listen for Chat Messages (for ordering)
// ==========================================
// Store listeners to prevent duplicates
let chatMessageListeners = {};

function listenForChatMessages(chatId, chatType) {
    const user = getCurrentUser();
    if (!user || !user.id) return;
    
    // Create unique key for this listener
    const listenerKey = `${chatType}_${chatId}`;
    
    // Don't create duplicate listeners
    if (chatMessageListeners[listenerKey]) {
        return;
    }
    
    // Create chat document ID
    const chatDocId = chatType === 'group' 
        ? chatId 
        : [user.id, chatId].sort().join('_');
    
    const collectionPath = chatType === 'group'
        ? `groups/${chatId}/messages`
        : `chats/${chatDocId}/messages`;
    
    // Listen for new messages to update chat list order
    const unsubscribe = firebase.firestore()
        .collection(collectionPath.split('/')[0])
        .doc(collectionPath.split('/')[1])
        .collection('messages')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .onSnapshot((snapshot) => {
            if (snapshot.empty) return;
            
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added' || change.type === 'modified') {
                    const message = change.doc.data();
                    const msgTimestamp = getTimestampValue(message.timestamp) || getTimestampValue(message.createdAt) || Date.now();
                    
                    // Only update if this timestamp is newer than existing
                    // This prevents overwriting a more recent local timestamp from sendMessage
                    const existingTime = chatLastMessageTime[chatId] || 0;
                    if (msgTimestamp > existingTime) {
                        chatLastMessageTime[chatId] = msgTimestamp;
                        // Reorder chat list
                        updateChatListOrder();
                    }
                    
                    // Update unread count if message is not from current user
                    if (message.senderId !== user.id) {
                        // Check if this chat is not currently open
                        if (currentChatId !== chatId || currentChatType !== chatType) {
                            updateUnreadCount(chatId, chatType);
                        }
                    }
                }
            });
        }, (error) => {
            console.error(`Error listening to messages for ${chatType} ${chatId}:`, error);
        });
    
    // Store the unsubscribe function
    chatMessageListeners[listenerKey] = unsubscribe;
}

// Cleanup all chat message listeners
function cleanupChatMessageListeners() {
    Object.values(chatMessageListeners).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
            unsubscribe();
        }
    });
    chatMessageListeners = {};
}

function markMessagesAsRead(chatId, chatType) {
    const user = getCurrentUser();
    if (!user || !user.id) return;
    
    // Create chat ID for private chats
    const chatDocId = chatType === 'group' 
        ? chatId 
        : [user.id, chatId].sort().join('_');
    
    const collectionPath = chatType === 'group'
        ? `groups/${chatId}/messages`
        : `chats/${chatDocId}/messages`;
    
    // Get unread messages and mark them as read
    firebase.firestore()
        .collection(collectionPath.split('/')[0])
        .doc(collectionPath.split('/')[1])
        .collection('messages')
        .where('senderId', '!=', user.id)
        .orderBy('senderId')
        .orderBy('timestamp', 'desc')
        .limit(200) // Match limit with updateUnreadCount
        .get()
        .then((snapshot) => {
            if (snapshot.empty) {
                // No unread messages, just update UI
                unreadMessages[chatId] = 0;
                updateChatListBadge(chatId, 0);
                return;
            }

            const batch = firebase.firestore().batch();
            let hasUpdates = false;

            snapshot.forEach(doc => {
                const message = doc.data();
                const readBy = message.readBy || [];
                // Only mark as read if not already read by current user
                if (!readBy.includes(user.id)) {
                    readBy.push(user.id);
                    batch.update(doc.ref, { readBy: readBy });
                    hasUpdates = true;
                }
            });

            if (hasUpdates) {
                return batch.commit();
            } else {
                // No updates needed, just update UI
                unreadMessages[chatId] = 0;
                updateChatListBadge(chatId, 0);
            }
        })
        .then(() => {
            // After successful batch commit or no updates needed, refresh unread count
            updateUnreadCount(chatId, chatType);
        })
        .catch((error) => {
            console.error('Error marking messages as read:', error);
            // Re-run updateUnreadCount to get accurate count
            updateUnreadCount(chatId, chatType);
        });
}

// ==========================================
// Display Message
// ==========================================
function displayMessage(message) {
    if (!elements.messagesList) return;
    
    // Check if message already exists (prevent duplicates)
    const existingMessage = elements.messagesList.querySelector(`[data-message-id="${message.id}"]`);
    if (existingMessage) {
        return; // Message already displayed
    }
    
    // Remove empty state if exists
    const emptyState = elements.messagesList.querySelector('.empty-list');
    if (emptyState) {
        emptyState.remove();
    }
    
    // Safe check for currentUser
    const user = getCurrentUser();
    const currentUserId = user ? user.id : null;
    const isSent = currentUserId && message.senderId === currentUserId;
    const messageClass = isSent ? 'sent' : 'received';
    
    const messageEl = document.createElement('div');
    messageEl.className = `message ${messageClass}`;
    messageEl.setAttribute('data-message-id', message.id);
    
    // Store timestamp for ordering
    const messageTimestamp = getTimestampValue(message.timestamp) || getTimestampValue(message.createdAt) || Date.now();
    messageEl.setAttribute('data-timestamp', messageTimestamp);
    
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
    
    // Add timestamp - use local time as fallback for new messages
    let time = formatTime(message.timestamp);
    if (!time && message.createdAt) {
        // Fallback to createdAt if timestamp is not resolved yet
        time = formatTime(message.createdAt);
    }
    if (!time) {
        // Ultimate fallback to current time for brand new messages
        time = formatTime(new Date());
    }
    
    messageContent += `
            <div class="message-meta">
                <span class="message-time">${time}</span>
    `;
    
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
            createdAt: new Date().toISOString(),
            readBy: [user.id] // Sender automatically marks as read
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
        
        // Update chat list order - move this chat to top
        chatLastMessageTime[currentChatId] = Date.now();
        updateChatListOrder();
        
        // Clear input
        if (elements.messageInput) {
            elements.messageInput.value = '';
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
                email: firebaseUser.email,
                photoURL: firebaseUser.photoURL
            };
            return window.currentUser;
        }
    }
    
    return null;
}

// ==========================================
// Load User Profile (including Google photo)
// ==========================================
async function loadUserProfile() {
    console.log('Loading user profile...');
    
    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.log('Firebase not ready for profile');
        return;
    }
    
    // Wait for auth state
    firebase.auth().onAuthStateChanged(async (firebaseUser) => {
        if (!firebaseUser) {
            console.log('No Firebase user for profile');
            return;
        }
        
        // Update avatar with Google photo if available
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar && firebaseUser.photoURL) {
            userAvatar.innerHTML = `<img src="${firebaseUser.photoURL}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            console.log('✅ User photo loaded from Google');
        }
        
        // Also update window.currentUser with photo
        if (window.currentUser) {
            window.currentUser.photoURL = firebaseUser.photoURL;
        }
        
        // Update user code display
        const userCodeEl = document.getElementById('userCode');
        if (userCodeEl && firebaseUser.uid) {
            userCodeEl.textContent = firebaseUser.uid;
            userCodeEl.title = firebaseUser.uid;
        }
        
        // Update user name display
        const userNameEl = document.querySelector('.user-name');
        if (userNameEl && firebaseUser.displayName) {
            userNameEl.textContent = firebaseUser.displayName;
        }
    });
}

// ==========================================
// Add Contact (Send Request)
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
            showToast('Kontak sudah ada di daftar Anda', 'error');
            return;
        }
        
        // Get current user data for the request
        const currentUserDoc = await firebase.firestore().collection('users').doc(user.id).get();
        const currentUserData = currentUserDoc.exists ? currentUserDoc.data() : {};
        
        // Send contact request to target user
        // Use set with merge to avoid overwriting if request exists
        await firebase.firestore()
            .collection('users').doc(trimmedCode)
            .collection('requests').doc(user.id).set({
                from_id: user.id,
                from_name: currentUserData.name || user.name || 'User',
                from_photoURL: currentUserData.photoURL || null,
                status: 'pending',
                sent_at: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        showToast('Permintaan kontak berhasil dikirim!', 'success');
        closeModal('addContactModal');
        e.target.reset();
    } catch (error) {
        console.error('Error adding contact:', error);
        showToast('Terjadi kesalahan: ' + error.message, 'error');
    }
}

// ==========================================
// Load Contact Requests
// ==========================================
let requestsUnsubscribe = null;

async function loadRequestsFromFirestore() {
    console.log('Loading contact requests from Firestore...');
    
    if (typeof firebase === 'undefined') {
        console.log('Firebase not defined');
        return;
    }
    
    const user = getCurrentUser();
    if (!user || !user.id) {
        console.log('No current user for requests');
        return;
    }
    
    // Unsubscribe from previous listener
    if (requestsUnsubscribe) {
        requestsUnsubscribe();
    }
    
    try {
        // Listen to requests in real-time
        requestsUnsubscribe = firebase.firestore()
            .collection('users').doc(user.id)
            .collection('requests')
            .where('status', '==', 'pending')
            .onSnapshot((snapshot) => {
                console.log('Requests snapshot size:', snapshot.size);
                updateRequestBadge(snapshot.size);
                
                const requestList = document.getElementById('requestList');
                if (!requestList) return;
                
                if (snapshot.empty) {
                    requestList.innerHTML = `
                        <div class="empty-list">
                            <i class="fas fa-envelope-open"></i>
                            <p>Tidak ada permintaan kontak</p>
                        </div>
                    `;
                    return;
                }
                
                let html = '';
                snapshot.forEach(doc => {
                    const request = doc.data();
                    const avatar = request.from_photoURL 
                        ? `<img src="${request.from_photoURL}" alt="Avatar">` 
                        : '<i class="fas fa-user"></i>';
                    
                    html += `
                        <div class="request-item" data-id="${doc.id}">
                            <div class="request-avatar">${avatar}</div>
                            <div class="request-info">
                                <div class="request-name">${escapeHtml(request.from_name || 'User')}</div>
                                <div class="request-time">Ingin menjadi kontak Anda</div>
                            </div>
                            <div class="request-actions">
                                <button class="btn-accept" onclick="acceptRequest('${doc.id}')" title="Terima">
                                    <i class="fas fa-check"></i> Terima
                                </button>
                                <button class="btn-reject" onclick="rejectRequest('${doc.id}')" title="Tolak">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    `;
                });
                
                requestList.innerHTML = html;
                console.log('✅ Requests loaded from Firestore');
            }, (error) => {
                console.error('Error loading requests:', error);
            });
    } catch (error) {
        console.error('Error setting up requests listener:', error);
    }
}

// ==========================================
// Update Request Badge
// ==========================================
function updateRequestBadge(count) {
    const badge = document.getElementById('requestBadge');
    if (!badge) return;
    
    if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// ==========================================
// Accept Contact Request
// ==========================================
async function acceptRequest(requestId) {
    console.log('Accepting request:', requestId);
    
    const user = getCurrentUser();
    if (!user || !user.id) {
        showToast('Sesi tidak valid', 'error');
        return;
    }
    
    try {
        showToast('Menerima permintaan...', 'info');
        
        // Get the request data
        const requestDoc = await firebase.firestore()
            .collection('users').doc(user.id)
            .collection('requests').doc(requestId).get();
        
        if (!requestDoc.exists) {
            showToast('Permintaan tidak ditemukan', 'error');
            return;
        }
        
        const request = requestDoc.data();
        
        // Get current user data
        const currentUserDoc = await firebase.firestore().collection('users').doc(user.id).get();
        const currentUserData = currentUserDoc.exists ? currentUserDoc.data() : {};
        
        // Get requester's data
        const requesterDoc = await firebase.firestore().collection('users').doc(requestId).get();
        const requesterData = requesterDoc.exists ? requesterDoc.data() : {};
        
        // Add contact to current user's contacts (tanpa email)
        await firebase.firestore()
            .collection('users').doc(user.id)
            .collection('contacts').doc(requestId).set({
                user_id: requestId,
                name: requesterData.name || request.from_name || 'User',
                photoURL: requesterData.photoURL || request.from_photoURL || null,
                user_code: requestId,
                added_at: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        // Add current user to requester's contacts (mutual contact, tanpa email)
        await firebase.firestore()
            .collection('users').doc(requestId)
            .collection('contacts').doc(user.id).set({
                user_id: user.id,
                name: currentUserData.name || user.name || 'User',
                photoURL: currentUserData.photoURL || null,
                user_code: user.id,
                added_at: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        // Delete the request
        await firebase.firestore()
            .collection('users').doc(user.id)
            .collection('requests').doc(requestId).delete();
        
        showToast('Permintaan diterima! Kontak ditambahkan.', 'success');
        
        // Reload contacts
        loadContactsFromFirestore();
        
    } catch (error) {
        console.error('Error accepting request:', error);
        showToast('Gagal menerima permintaan: ' + error.message, 'error');
    }
}

// ==========================================
// Reject Contact Request
// ==========================================
async function rejectRequest(requestId) {
    console.log('Rejecting request:', requestId);
    
    const user = getCurrentUser();
    if (!user || !user.id) {
        showToast('Sesi tidak valid', 'error');
        return;
    }
    
    try {
        // Delete the request
        await firebase.firestore()
            .collection('users').doc(user.id)
            .collection('requests').doc(requestId).delete();
        
        showToast('Permintaan ditolak', 'success');
        
    } catch (error) {
        console.error('Error rejecting request:', error);
        showToast('Gagal menolak permintaan: ' + error.message, 'error');
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

// ==========================================
// Helper function to get timestamp value for sorting
// ==========================================
function getTimestampValue(timestamp) {
    if (!timestamp) return 0;
    
    // Handle Firestore Timestamp object
    if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().getTime();
    } else if (timestamp instanceof Date) {
        return timestamp.getTime();
    } else if (typeof timestamp === 'number') {
        return timestamp;
    } else if (typeof timestamp === 'string') {
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? 0 : date.getTime();
    }
    return 0;
}

// ==========================================
// Display message at correct position based on timestamp
// ==========================================
function displayMessageInOrder(message) {
    if (!elements.messagesList) return;
    
    // Check if message already exists (prevent duplicates)
    const existingMessage = elements.messagesList.querySelector(`[data-message-id="${message.id}"]`);
    if (existingMessage) {
        return; // Message already displayed
    }
    
    // Remove empty state if exists
    const emptyState = elements.messagesList.querySelector('.empty-list');
    if (emptyState) {
        emptyState.remove();
    }
    
    // Get current user
    const user = getCurrentUser();
    const currentUserId = user ? user.id : null;
    const isSent = currentUserId && message.senderId === currentUserId;
    const messageClass = isSent ? 'sent' : 'received';
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message ${messageClass}`;
    messageEl.setAttribute('data-message-id', message.id);
    
    // Get timestamp value for this message
    const messageTimestamp = getTimestampValue(message.timestamp) || getTimestampValue(message.createdAt) || Date.now();
    messageEl.setAttribute('data-timestamp', messageTimestamp);
    
    let messageContent = `<div class="message-bubble">`;
    
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
    let time = formatTime(message.timestamp);
    if (!time && message.createdAt) {
        time = formatTime(message.createdAt);
    }
    if (!time) {
        time = formatTime(new Date());
    }
    
    messageContent += `
            <div class="message-meta">
                <span class="message-time">${time}</span>
            </div>
        </div>
    `;
    
    messageEl.innerHTML = messageContent;
    
    // Find correct position to insert based on timestamp
    const allMessages = elements.messagesList.querySelectorAll('.message[data-timestamp]');
    let insertBefore = null;
    
    for (const existingMsg of allMessages) {
        const existingTimestamp = parseInt(existingMsg.getAttribute('data-timestamp'), 10) || 0;
        if (messageTimestamp < existingTimestamp) {
            insertBefore = existingMsg;
            break;
        }
    }
    
    if (insertBefore) {
        elements.messagesList.insertBefore(messageEl, insertBefore);
    } else {
        elements.messagesList.appendChild(messageEl);
    }
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    
    // Handle Firestore serverTimestamp (null initially)
    if (timestamp === null) return '';
    
    // Handle Firestore Timestamp object
    let date;
    if (timestamp && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
        date = timestamp;
    } else if (typeof timestamp === 'number') {
        date = new Date(timestamp);
    } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
    } else {
        return '';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    
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
// Group Settings (Owner Only)
// ==========================================
let currentGroupData = null;

function setupGroupSettings() {
    const groupSettingsBtn = document.getElementById('groupSettingsBtn');
    const copyGroupCodeBtn = document.getElementById('copyGroupCode');
    
    if (groupSettingsBtn) {
        groupSettingsBtn.addEventListener('click', () => {
            if (currentChatType === 'group' && currentChatId) {
                openGroupSettings(currentChatId);
            }
        });
    }
    
    if (copyGroupCodeBtn) {
        copyGroupCodeBtn.addEventListener('click', () => {
            const code = document.getElementById('gsGroupCode')?.textContent;
            if (code && code !== '-') {
                navigator.clipboard.writeText(code).then(() => {
                    showToast('Kode grup disalin!', 'success');
                });
            }
        });
    }
}

async function openGroupSettings(groupId) {
    const user = getCurrentUser();
    if (!user || !user.id) {
        showToast('Sesi tidak valid', 'error');
        return;
    }
    
    try {
        // Get group data from Firestore
        const groupDoc = await firebase.firestore().collection('groups').doc(groupId).get();
        
        if (!groupDoc.exists) {
            showToast('Grup tidak ditemukan', 'error');
            return;
        }
        
        const groupData = groupDoc.data();
        currentGroupData = { id: groupId, ...groupData };
        
        // Check if user is owner
        const isOwner = groupData.owner_id === user.id;
        if (!isOwner) {
            showToast('Hanya pemilik grup yang dapat mengakses pengaturan', 'error');
            return;
        }
        
        // Populate modal
        document.getElementById('gsGroupName').textContent = groupData.name || '-';
        document.getElementById('gsGroupCode').textContent = groupData.code || groupId.substring(0, 8).toUpperCase();
        document.getElementById('gsDescription').textContent = groupData.description || 'Tidak ada deskripsi';
        
        // Format date
        let createdAt = '-';
        if (groupData.created_at) {
            const date = groupData.created_at.toDate ? groupData.created_at.toDate() : new Date(groupData.created_at);
            createdAt = date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        document.getElementById('gsCreatedAt').textContent = createdAt;
        
        // Load members
        const ownerIdForMembers = groupData.owner_id;
        await loadGroupMembers(groupId, ownerIdForMembers);
        
        // Show modal
        openModal('groupSettingsModal');
        
    } catch (error) {
        console.error('Error loading group settings:', error);
        showToast('Gagal memuat pengaturan grup', 'error');
    }
}

async function loadGroupMembers(groupId, ownerId) {
    const membersList = document.getElementById('gsMembersList');
    const memberCount = document.getElementById('gsMemberCount');
    
    if (!membersList) return;
    
    membersList.innerHTML = '<div class="loading-text">Memuat anggota...</div>';
    
    try {
        // Get group to get members array
        const groupDoc = await firebase.firestore().collection('groups').doc(groupId).get();
        const groupData = groupDoc.data();
        const members = groupData.members || [];
        
        memberCount.textContent = members.length;
        
        if (members.length === 0) {
            membersList.innerHTML = '<div class="empty-text">Belum ada anggota</div>';
            return;
        }
        
        let html = '';
        
        for (const memberId of members) {
            // Get user data
            const userDoc = await firebase.firestore().collection('users').doc(memberId).get();
            const userData = userDoc.exists ? userDoc.data() : { name: 'Unknown User' };
            
            const isOwner = memberId === ownerId;
            
            html += `
                <div class="group-member-item" data-member-id="${memberId}">
                    <div class="group-member-avatar">
                        ${userData.photoURL 
                            ? `<img src="${userData.photoURL}" alt="Avatar">`
                            : '<i class="fas fa-user"></i>'
                        }
                    </div>
                    <div class="group-member-info">
                        <div class="group-member-name">${userData.name || 'Unknown'}</div>
                        <div class="group-member-role">
                            <span class="role-badge ${isOwner ? 'owner' : 'member'}">
                                ${isOwner ? '<i class="fas fa-crown"></i> Owner' : 'Anggota'}
                            </span>
                        </div>
                    </div>
                    ${!isOwner ? `
                        <div class="group-member-actions">
                            <button class="btn-kick-member" data-member-id="${memberId}" data-member-name="${userData.name || 'Unknown'}" title="Keluarkan Anggota">
                                <i class="fas fa-user-times"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        membersList.innerHTML = html;
        
        // Add event listeners for kick buttons
        const kickButtons = membersList.querySelectorAll('.btn-kick-member');
        kickButtons.forEach(button => {
            button.addEventListener('click', function() {
                const memberId = this.getAttribute('data-member-id');
                const memberName = this.getAttribute('data-member-name');
                kickMember(memberId, memberName, groupId);
            });
        });
        
    } catch (error) {
        console.error('Error loading members:', error);
        membersList.innerHTML = '<div class="error-text">Gagal memuat anggota</div>';
    }
}

async function kickMember(memberId, memberName, groupId) {
    // Show confirmation modal instead of alert
    const modal = document.getElementById('kickMemberModal');
    const memberNameEl = document.getElementById('kickMemberName');
    const confirmBtn = document.getElementById('confirmKickBtn');
    
    if (memberNameEl) {
        memberNameEl.textContent = memberName;
    }
    
    // Set up confirm button
    const handleConfirm = async () => {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<div class="spinner btn-spinner"></div>';
        
        try {
            // Call backend API to kick member
            const response = await fetch(BASE_URL + '/api/group/kick-member', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    group_id: groupId,
                    member_id: memberId
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showToast(`${memberName} telah dikeluarkan dari grup`, 'success');
                // Reload group members
                const groupDoc = await firebase.firestore().collection('groups').doc(groupId).get();
                const groupData = groupDoc.data();
                const ownerId = groupData.owner_id;
                await loadGroupMembers(groupId, ownerId);
                closeModal('kickMemberModal');
            } else {
                showToast(result.message || 'Gagal mengeluarkan anggota', 'error');
            }
            
        } catch (error) {
            console.error('Error kicking member:', error);
            showToast('Terjadi kesalahan saat mengeluarkan anggota', 'error');
        } finally {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<span class="btn-text"><i class="fas fa-user-times"></i> Keluarkan</span><div class="spinner btn-spinner"></div>';
        }
    };
    
    // Remove previous event listener
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Add new event listener
    newConfirmBtn.addEventListener('click', handleConfirm);
    
    // Show modal
    openModal('kickMemberModal');
}

function showGroupSettingsButton(show, isOwner) {
    const btn = document.getElementById('groupSettingsBtn');
    const container = document.getElementById('chatHeaderActions');
    
    console.log('showGroupSettingsButton called:', { show, isOwner, container: !!container });
    
    if (container) {
        if (show && isOwner) {
            container.classList.remove('hidden');
            console.log('✅ Group settings button SHOWN');
        } else {
            container.classList.add('hidden');
            console.log('❌ Group settings button HIDDEN');
        }
    } else {
        console.error('chatHeaderActions container not found!');
    }
}

// Call setup on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    setupGroupSettings();
});

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
