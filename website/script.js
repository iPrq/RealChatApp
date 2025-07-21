class ChatApp {
    constructor() {
        this.stompClient = null;
        this.username = '';
        this.currentRoom = 1;
        this.isConnected = false;
        this.typingTimer = null;
        this.users = new Set();
        
        this.initializeApp();
    }

    initializeApp() {
        this.bindEvents();
        this.showUsernameModal();
        this.updateConnectionStatus('Disconnected', 'disconnected');
    }

    bindEvents() {
        // Username modal
        document.getElementById('joinChatBtn').addEventListener('click', () => this.handleJoinChat());
        document.getElementById('usernameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleJoinChat();
        });

        // Message input
        const messageInput = document.getElementById('messageInput');
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        messageInput.addEventListener('input', () => this.handleTyping());

        // Send button
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());

        // Room switching
        document.querySelectorAll('.room-item').forEach(room => {
            room.addEventListener('click', (e) => this.switchRoom(e.currentTarget.dataset.room));
        });

        // Auto-resize input
        messageInput.addEventListener('input', this.autoResizeInput);
    }

    showUsernameModal() {
        document.getElementById('usernameModal').style.display = 'flex';
        document.getElementById('usernameInput').focus();
    }

    hideUsernameModal() {
        document.getElementById('usernameModal').style.display = 'none';
    }

    handleJoinChat() {
        const usernameInput = document.getElementById('usernameInput');
        const username = usernameInput.value.trim();
        
        if (username.length < 2) {
            this.showError('Username must be at least 2 characters long');
            return;
        }

        if (username.length > 20) {
            this.showError('Username must be less than 20 characters');
            return;
        }

        this.username = username;
        this.hideUsernameModal();
        this.updateUserProfile();
        this.connect();
    }

    updateUserProfile() {
        document.getElementById('displayUsername').textContent = this.username;
        document.getElementById('currentUser').textContent = this.username;
        
        // Generate avatar color based on username
        const avatarColor = this.generateAvatarColor(this.username);
        document.getElementById('userAvatar').style.background = avatarColor;
    }

    generateAvatarColor(username) {
        const colors = [
            'linear-gradient(135deg, #667eea, #764ba2)',
            'linear-gradient(135deg, #f093fb, #f5576c)',
            'linear-gradient(135deg, #4facfe, #00f2fe)',
            'linear-gradient(135deg, #43e97b, #38f9d7)',
            'linear-gradient(135deg, #fa709a, #fee140)',
            'linear-gradient(135deg, #30cfd0, #91a7ff)',
            'linear-gradient(135deg, #a8edea, #fed6e3)',
            'linear-gradient(135deg, #ff9a9e, #fecfef)'
        ];
        
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        return colors[Math.abs(hash) % colors.length];
    }

    connect() {
        this.updateConnectionStatus('Connecting...', 'connecting');
        
        try {
            // Use the same hostname as the frontend to avoid CORS issues
            const backendUrl = `${window.location.protocol}//${window.location.hostname}:8080/ws`;
            const socket = new SockJS(backendUrl);
            this.stompClient = Stomp.over(socket);
            
            // Disable debug logging
            this.stompClient.debug = null;
            
            this.stompClient.connect({}, 
                () => this.onConnected(),
                (error) => this.onConnectionError(error)
            );
        } catch (error) {
            console.error('Connection error:', error);
            this.onConnectionError(error);
        }
    }

    onConnected() {
        console.log('Connected to WebSocket');
        this.isConnected = true;
        this.updateConnectionStatus('Connected', 'connected');
        
        // Subscribe to message topic
        this.stompClient.subscribe('/topic/messages', (message) => {
            this.onMessageReceived(JSON.parse(message.body));
        });

        // Load existing messages
        this.loadExistingMessages();
        
        // Add user to online list
        this.addUserToOnlineList(this.username);
        this.updateOnlineCount();

        // Send join notification
        this.sendSystemMessage(`${this.username} joined the chat`);
    }

    onConnectionError(error) {
        console.error('WebSocket connection error:', error);
        this.isConnected = false;
        this.updateConnectionStatus('Connection Failed', 'disconnected');
        this.showError('Failed to connect to chat server. Please try again.');
        
        // Retry connection after 5 seconds
        setTimeout(() => {
            if (!this.isConnected) {
                this.connect();
            }
        }, 5000);
    }

    async loadExistingMessages() {
        try {
            // Use the same hostname as the frontend to avoid CORS issues
            const backendUrl = `${window.location.protocol}//${window.location.hostname}:8080/message`;
            const response = await fetch(backendUrl);
            if (response.ok) {
                const messages = await response.json();
                
                // Clear welcome message
                document.getElementById('messagesContainer').innerHTML = '';
                
                // Display messages
                messages.forEach(message => {
                    this.displayMessage(message, false);
                });
                
                // Scroll to bottom
                this.scrollToBottom();
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const content = messageInput.value.trim();
        
        if (!content || !this.isConnected) return;
        
        if (content.length > 500) {
            this.showError('Message is too long. Maximum 500 characters allowed.');
            return;
        }

        const message = {
            content: content,
            sender: this.username,
            timestamp: new Date().toISOString(),
            roomid: parseInt(this.currentRoom)
        };

        try {
            this.stompClient.send('/app/chat', {}, JSON.stringify(message));
            messageInput.value = '';
            this.autoResizeInput({ target: messageInput });
            
            // Hide typing indicator
            this.hideTypingIndicator();
        } catch (error) {
            console.error('Error sending message:', error);
            this.showError('Failed to send message. Please try again.');
        }
    }

    sendSystemMessage(content) {
        const message = {
            content: content,
            sender: 'System',
            timestamp: new Date().toISOString(),
            roomid: parseInt(this.currentRoom)
        };

        if (this.isConnected) {
            this.stompClient.send('/app/chat', {}, JSON.stringify(message));
        }
    }

    onMessageReceived(message) {
        this.displayMessage(message, true);
        this.scrollToBottom();
        
        // Play notification sound for other users' messages
        if (message.sender !== this.username && message.sender !== 'System') {
            this.playNotificationSound();
        }
    }

    displayMessage(message, animate = false) {
        const messagesContainer = document.getElementById('messagesContainer');
        
        // Remove welcome message if it exists
        const welcomeMessage = messagesContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender === this.username ? 'own' : ''}`;
        
        if (animate) {
            messageElement.style.opacity = '0';
            messageElement.style.transform = 'translateY(20px)';
        }

        const isSystemMessage = message.sender === 'System';
        const timeString = this.formatTime(message.timestamp);
        const avatarLetter = message.sender.charAt(0).toUpperCase();
        const avatarColor = this.generateAvatarColor(message.sender);

        if (isSystemMessage) {
            messageElement.innerHTML = `
                <div class="system-message">
                    <i class="fas fa-info-circle"></i>
                    <span>${message.content}</span>
                    <span class="message-time">${timeString}</span>
                </div>
            `;
            messageElement.className = 'message system';
        } else {
            messageElement.innerHTML = `
                <div class="message-avatar" style="background: ${avatarColor}">
                    ${avatarLetter}
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-sender">${message.sender}</span>
                        <span class="message-time">${timeString}</span>
                    </div>
                    <div class="message-text">${this.escapeHtml(message.content)}</div>
                </div>
            `;
        }

        messagesContainer.appendChild(messageElement);

        if (animate) {
            // Trigger animation
            requestAnimationFrame(() => {
                messageElement.style.transition = 'all 0.3s ease-out';
                messageElement.style.opacity = '1';
                messageElement.style.transform = 'translateY(0)';
            });
        }
    }

    handleTyping() {
        if (!this.isConnected) return;
        
        // Show typing indicator for other users
        this.showTypingIndicator();
        
        // Clear existing timer
        if (this.typingTimer) {
            clearTimeout(this.typingTimer);
        }
        
        // Hide typing indicator after 2 seconds of inactivity
        this.typingTimer = setTimeout(() => {
            this.hideTypingIndicator();
        }, 2000);
    }

    showTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        indicator.style.display = 'flex';
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        indicator.style.display = 'none';
    }

    switchRoom(roomId) {
        this.currentRoom = roomId;
        
        // Update active room UI
        document.querySelectorAll('.room-item').forEach(room => {
            room.classList.remove('active');
        });
        document.querySelector(`.room-item[data-room="${roomId}"]`).classList.add('active');
        
        // Update room name in header
        const roomNames = {
            '1': 'General',
            '2': 'Development', 
            '3': 'Gaming'
        };
        document.getElementById('currentRoomName').textContent = roomNames[roomId];
        
        // Clear messages and load room-specific messages
        document.getElementById('messagesContainer').innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <i class="fas fa-comments"></i>
                </div>
                <h3>Welcome to ${roomNames[roomId]}!</h3>
                <p>Start a conversation by sending a message below.</p>
            </div>
        `;
        
        this.loadExistingMessages();
    }

    addUserToOnlineList(username) {
        this.users.add(username);
        this.updateUsersPanel();
    }

    removeUserFromOnlineList(username) {
        this.users.delete(username);
        this.updateUsersPanel();
    }

    updateUsersPanel() {
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';
        
        Array.from(this.users).forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            
            const avatarColor = this.generateAvatarColor(user);
            const isCurrentUser = user === this.username;
            
            userElement.innerHTML = `
                <div class="user-avatar" style="background: ${avatarColor}">
                    ${user.charAt(0).toUpperCase()}
                </div>
                <div class="user-details">
                    <div class="user-name">${user}${isCurrentUser ? ' (You)' : ''}</div>
                    <div class="user-status">Online</div>
                </div>
                ${isCurrentUser ? '<div class="user-badge owner"><i class="fas fa-crown"></i></div>' : ''}
            `;
            
            usersList.appendChild(userElement);
        });
    }

    updateOnlineCount() {
        document.getElementById('onlineCount').textContent = this.users.size;
    }

    updateConnectionStatus(status, className) {
        const statusElement = document.getElementById('connectionStatus');
        statusElement.querySelector('span').textContent = status;
        statusElement.className = `connection-status ${className}`;
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    autoResizeInput(event) {
        const input = event.target;
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) {
            return 'Just now';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        } else if (diffInMinutes < 1440) { // Less than 24 hours
            const hours = Math.floor(diffInMinutes / 60);
            return `${hours}h ago`;
        } else {
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    playNotificationSound() {
        // Create a simple notification sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.log('Web Audio API not supported');
        }
    }

    showError(message) {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        // Add toast styles
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1001;
            animation: toastSlideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Add CSS for toast animations
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes toastSlideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes toastSlideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .system-message {
        text-align: center;
        padding: 8px 16px;
        background: rgba(52, 152, 219, 0.1);
        border-radius: 20px;
        color: #3498db;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin: 12px auto;
        max-width: 300px;
    }
    
    .message.system {
        justify-content: center;
    }
`;
document.head.appendChild(toastStyles);

// Initialize the chat app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.chatApp && window.chatApp.isConnected) {
        window.chatApp.sendSystemMessage(`${window.chatApp.username} left the chat`);
    }
});

// Handle visibility change to show/hide typing indicators
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.chatApp) {
        window.chatApp.hideTypingIndicator();
    }
});
