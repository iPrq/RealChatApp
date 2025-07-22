/**
 * Chat Manager - Handles WebSocket connections and messaging
 */
class ChatManager {
    constructor() {
        this.stompClient = null;
        this.socket = null;
        this.username = '';
        this.currentRoom = '1';
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.typingTimer = null;
        
        console.log('ChatManager initialized');
    }

    // Connect to WebSocket server
    connect(username) {
        this.username = username;
        this.updateConnectionStatus(CONFIG.MESSAGES.CONNECTION.CONNECTING, 'connecting');
        
        try {
            const backendUrl = CONFIG.API.getBackendUrl() + CONFIG.API.ENDPOINTS.WEBSOCKET;
            console.log('Connecting to:', backendUrl);
            
            this.socket = new SockJS(backendUrl);
            this.stompClient = Stomp.over(this.socket);
            
            // Disable debug logging in production
            this.stompClient.debug = window.location.hostname === 'localhost' ? console.log : null;
            
            this.stompClient.connect({}, 
                () => this.onConnected(),
                (error) => this.onConnectionError(error)
            );
        } catch (error) {
            console.error('Connection error:', error);
            this.onConnectionError(error);
        }
    }

    // Handle successful connection
    onConnected() {
        console.log('✅ Connected to WebSocket successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.updateConnectionStatus(CONFIG.MESSAGES.CONNECTION.CONNECTED, 'connected');
        
        // Subscribe to message topic
        this.stompClient.subscribe(CONFIG.WEBSOCKET.TOPICS.PUBLIC, (message) => {
            this.onMessageReceived(JSON.parse(message.body));
        });

        // Load existing messages
        this.loadExistingMessages();
        
        // Send join notification
        this.sendSystemMessage(`${this.username} joined the chat`);
        
        // Update UI
        if (window.uiManager) {
            uiManager.addUserToOnlineList(this.username);
            uiManager.updateOnlineCount();
        }
    }

    // Handle connection errors
    onConnectionError(error) {
        console.error('❌ WebSocket error:', error);
        this.isConnected = false;
        this.updateConnectionStatus(CONFIG.MESSAGES.CONNECTION.FAILED, 'disconnected');
        
        if (window.uiManager) {
            uiManager.showError(CONFIG.MESSAGES.ERRORS.CONNECTION_FAILED);
        }
        
        // Retry connection
        if (this.reconnectAttempts < CONFIG.WEBSOCKET.MAX_RECONNECT_ATTEMPTS) {
            this.reconnectAttempts++;
            console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${CONFIG.WEBSOCKET.MAX_RECONNECT_ATTEMPTS})`);
            
            setTimeout(() => {
                if (!this.isConnected) {
                    this.connect(this.username);
                }
            }, CONFIG.WEBSOCKET.RECONNECT_DELAY);
        }
    }

    // Load existing messages from REST API
    async loadExistingMessages() {
        try {
            const backendUrl = CONFIG.API.getBackendUrl() + CONFIG.API.ENDPOINTS.MESSAGES;
            const response = await fetch(backendUrl);
            
            if (response.ok) {
                const messages = await response.json();
                console.log(`📋 Loaded ${messages.length} existing messages`);
                
                // Clear welcome message
                if (window.uiManager) {
                    uiManager.clearMessages();
                    messages.forEach(message => uiManager.displayMessage(message, false));
                    uiManager.scrollToBottom();
                }
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    // Send chat message
    sendMessage(content) {
        if (!content.trim() || !this.isConnected) return false;
        
        if (content.length > CONFIG.UI.MAX_MESSAGE_LENGTH) {
            if (window.uiManager) {
                uiManager.showError(CONFIG.MESSAGES.ERRORS.MESSAGE_TOO_LONG);
            }
            return false;
        }

        const message = {
            content: content.trim(),
            sender: this.username,
            timestamp: new Date().toISOString(),
            roomid: parseInt(this.currentRoom)
        };

        try {
            this.stompClient.send(CONFIG.WEBSOCKET.SEND_ENDPOINTS.CHAT, {}, JSON.stringify(message));
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            if (window.uiManager) {
                uiManager.showError(CONFIG.MESSAGES.ERRORS.SEND_FAILED);
            }
            return false;
        }
    }

    // Send system message
    sendSystemMessage(content) {
        const message = {
            content: content,
            sender: 'System',
            timestamp: new Date().toISOString(),
            roomid: parseInt(this.currentRoom)
        };

        if (this.isConnected) {
            this.stompClient.send(CONFIG.WEBSOCKET.SEND_ENDPOINTS.CHAT, {}, JSON.stringify(message));
        }
    }

    // Handle received messages
    onMessageReceived(message) {
        if (window.uiManager) {
            uiManager.displayMessage(message, true);
            uiManager.scrollToBottom();
            
            // Play notification sound for other users' messages
            if (message.sender !== this.username && message.sender !== 'System') {
                uiManager.playNotificationSound();
            }
        }
    }

    // Switch chat room
    switchRoom(roomId) {
        this.currentRoom = roomId;
        console.log('🏠 Changed to room:', this.currentRoom);
        
        if (window.uiManager) {
            uiManager.updateActiveRoom(roomId);
            uiManager.clearMessages();
            uiManager.showWelcomeMessage(CONFIG.UI.ROOMS[roomId]);
            this.loadExistingMessages();
        }
    }

    // Handle typing indicators
    handleTyping() {
        if (!this.isConnected) return;
        
        if (window.uiManager) {
            uiManager.showTypingIndicator();
        }
        
        // Clear existing timer
        if (this.typingTimer) {
            clearTimeout(this.typingTimer);
        }
        
        // Hide typing indicator after timeout
        this.typingTimer = setTimeout(() => {
            if (window.uiManager) {
                uiManager.hideTypingIndicator();
            }
        }, CONFIG.UI.TYPING_TIMEOUT);
    }

    // Update connection status
    updateConnectionStatus(status, className) {
        if (window.uiManager) {
            uiManager.updateConnectionStatus(status, className);
        }
    }

    // Get connection info
    getConnectionInfo() {
        return {
            isConnected: this.isConnected,
            username: this.username,
            currentRoom: this.currentRoom,
            reconnectAttempts: this.reconnectAttempts
        };
    }

    // Disconnect from server
    disconnect() {
        if (this.stompClient && this.isConnected) {
            this.sendSystemMessage(`${this.username} left the chat`);
            this.stompClient.disconnect();
        }
        
        this.isConnected = false;
        this.socket = null;
        this.stompClient = null;
        console.log('👋 Disconnected from WebSocket');
    }
}
