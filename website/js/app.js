/**
 * Main Application Class - Orchestrates the chat application
 */
class ChatApp {
    constructor() {
        this.chatManager = null;
        this.uiManager = null;
        
        this.initializeApp();
    }

    // Initialize the application
    initializeApp() {
        console.log('🚀 Initializing Chat Application...');
        
        // Initialize managers
        this.uiManager = new UIManager();
        this.chatManager = new ChatManager();
        
        // Make managers globally accessible
        window.uiManager = this.uiManager;
        window.chatManager = this.chatManager;
        
        // Set up event listeners
        this.bindEvents();
        
        // Show username modal and set initial connection status
        this.uiManager.showUsernameModal();
        this.uiManager.updateConnectionStatus('Disconnected', 'disconnected');
        
        console.log('✅ Chat Application initialized successfully');
    }

    // Bind all event listeners
    bindEvents() {
        // Username modal events
        this.bindUsernameEvents();
        
        // Message input events
        this.bindMessageEvents();
        
        // Room switching events
        this.bindRoomEvents();
        
        // Window events
        this.bindWindowEvents();
    }

    // Username modal event bindings
    bindUsernameEvents() {
        const joinBtn = document.getElementById('joinChatBtn');
        const usernameInput = document.getElementById('usernameInput');
        
        if (joinBtn) {
            joinBtn.addEventListener('click', () => this.handleJoinChat());
        }
        
        if (usernameInput) {
            usernameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleJoinChat();
            });
        }
    }

    // Message input event bindings
    bindMessageEvents() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const refreshBtn = document.getElementById('refreshMessagesBtn');
        
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            messageInput.addEventListener('input', (e) => {
                this.uiManager.autoResizeInput(e.target);
                this.chatManager.handleTyping();
            });
        }
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                if (this.chatManager) {
                    this.chatManager.refreshMessages();
                }
            });
        }
    }

    // Room switching event bindings
    bindRoomEvents() {
        document.querySelectorAll('.room-item').forEach(room => {
            room.addEventListener('click', (e) => {
                const roomId = e.currentTarget.dataset.room;
                if (roomId) {
                    this.chatManager.switchRoom(roomId);
                }
            });
        });
    }

    // Window and visibility event bindings
    bindWindowEvents() {
        // Handle page unload
        window.addEventListener('beforeunload', () => {
            if (this.chatManager && this.chatManager.isConnected) {
                this.chatManager.disconnect();
            }
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.uiManager) {
                this.uiManager.hideTypingIndicator();
            }
        });
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+R or F5 for refresh (prevent default browser refresh)
            if ((e.ctrlKey && e.key === 'r') || e.key === 'F5') {
                e.preventDefault();
                if (this.chatManager) {
                    this.chatManager.refreshMessages();
                }
            }
        });
    }

    // Handle joining the chat
    handleJoinChat() {
        const usernameInput = document.getElementById('usernameInput');
        const username = usernameInput.value.trim();
        
        // Validate username
        if (username.length < CONFIG.UI.MIN_USERNAME_LENGTH) {
            this.uiManager.showError(CONFIG.MESSAGES.ERRORS.USERNAME_TOO_SHORT);
            return;
        }

        if (username.length > CONFIG.UI.MAX_USERNAME_LENGTH) {
            this.uiManager.showError(CONFIG.MESSAGES.ERRORS.USERNAME_TOO_LONG);
            return;
        }

        // Update UI and connect
        this.uiManager.hideUsernameModal();
        this.uiManager.updateUserProfile(username);
        this.uiManager.showWelcomeMessage(CONFIG.UI.ROOMS['1']); // Default to General room
        
        // Connect to chat server
        this.chatManager.connect(username);
        
        console.log(`👤 User "${username}" joined the chat`);
    }

    // Send a message
    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const content = messageInput.value.trim();
        
        if (!content) return;
        
        // Send message through chat manager
        const success = this.chatManager.sendMessage(content);
        
        if (success) {
            // Clear input and hide typing indicator
            this.uiManager.clearMessageInput();
            this.uiManager.hideTypingIndicator();
        }
    }

    // Get application status
    getStatus() {
        return {
            chatManager: this.chatManager ? this.chatManager.getConnectionInfo() : null,
            uiManager: this.uiManager ? 'initialized' : 'not initialized',
            timestamp: new Date().toISOString()
        };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌐 DOM Content Loaded - Starting Chat Application');
    window.chatApp = new ChatApp();
});

// Development helper - expose app status to console
if (window.location.hostname === 'localhost') {
    window.getChatStatus = () => {
        if (window.chatApp) {
            console.table(window.chatApp.getStatus());
        } else {
            console.log('Chat app not initialized yet');
        }
    };
    console.log('💡 Development mode: Use getChatStatus() to check app status');
}
