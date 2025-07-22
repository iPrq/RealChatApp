/**
 * UI Manager - Handles all user interface interactions and updates
 */
class UIManager {
    constructor() {
        this.users = new Set();
        this.messageContainer = null;
        this.messageInput = null;
        
        this.initializeElements();
        this.addStyles();
        console.log('UIManager initialized');
    }

    // Initialize DOM elements
    initializeElements() {
        this.messageContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
    }

    // Add required CSS styles
    addStyles() {
        const toastStyles = document.createElement('style');
        toastStyles.textContent = `
            @keyframes toastSlideIn {
                from { opacity: 0; transform: translateX(100%); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            @keyframes toastSlideOut {
                from { opacity: 1; transform: translateX(0); }
                to { opacity: 0; transform: translateX(100%); }
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
    }

    // Show/hide username modal
    showUsernameModal() {
        document.getElementById('usernameModal').style.display = 'flex';
        document.getElementById('usernameInput').focus();
    }

    hideUsernameModal() {
        document.getElementById('usernameModal').style.display = 'none';
    }

    // Update user profile display
    updateUserProfile(username) {
        document.getElementById('displayUsername').textContent = username;
        document.getElementById('currentUser').textContent = username;
        
        const avatarColor = this.generateAvatarColor(username);
        document.getElementById('userAvatar').style.background = avatarColor;
    }

    // Generate avatar color based on username
    generateAvatarColor(username) {
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        return CONFIG.UI.AVATAR_COLORS[Math.abs(hash) % CONFIG.UI.AVATAR_COLORS.length];
    }

    // Display a message in the chat
    displayMessage(message, animate = false) {
        // Remove welcome message if it exists
        const welcomeMessage = this.messageContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        const messageElement = document.createElement('div');
        const isOwnMessage = message.sender === (window.chatManager?.username || '');
        const isSystemMessage = message.sender === 'System';
        
        messageElement.className = `message ${isOwnMessage ? 'own' : ''} ${isSystemMessage ? 'system' : ''}`;
        
        if (animate) {
            messageElement.style.opacity = '0';
            messageElement.style.transform = 'translateY(20px)';
        }

        const timeString = this.formatTime(message.timestamp);

        if (isSystemMessage) {
            messageElement.innerHTML = `
                <div class="system-message">
                    <i class="fas fa-info-circle"></i>
                    <span>${message.content}</span>
                    <span class="message-time">${timeString}</span>
                </div>
            `;
        } else {
            const avatarLetter = message.sender.charAt(0).toUpperCase();
            const avatarColor = this.generateAvatarColor(message.sender);
            
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

        this.messageContainer.appendChild(messageElement);

        if (animate) {
            requestAnimationFrame(() => {
                messageElement.style.transition = 'all 0.3s ease-out';
                messageElement.style.opacity = '1';
                messageElement.style.transform = 'translateY(0)';
            });
        }
    }

    // Clear all messages
    clearMessages() {
        this.messageContainer.innerHTML = '';
    }

    // Show welcome message for a room
    showWelcomeMessage(roomName) {
        this.messageContainer.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <i class="fas fa-comments"></i>
                </div>
                <h3>Welcome to ${roomName}!</h3>
                <p>Start a conversation by sending a message below.</p>
            </div>
        `;
    }

    // Update active room in UI
    updateActiveRoom(roomId) {
        // Update active room UI
        document.querySelectorAll('.room-item').forEach(room => {
            room.classList.remove('active');
        });
        document.querySelector(`.room-item[data-room="${roomId}"]`)?.classList.add('active');
        
        // Update room name in header
        const roomName = CONFIG.UI.ROOMS[roomId];
        document.getElementById('currentRoomName').textContent = roomName;
    }

    // Manage online users
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
        if (!usersList) return;
        
        usersList.innerHTML = '';
        
        Array.from(this.users).forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            
            const avatarColor = this.generateAvatarColor(user);
            const isCurrentUser = user === (window.chatManager?.username || '');
            
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
        const onlineCountElement = document.getElementById('onlineCount');
        if (onlineCountElement) {
            onlineCountElement.textContent = this.users.size;
        }
    }

    // Connection status
    updateConnectionStatus(status, className) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            statusElement.querySelector('span').textContent = status;
            statusElement.className = `connection-status ${className}`;
        }
    }

    // Typing indicators
    showTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.style.display = 'flex';
        }
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    // Input handling
    autoResizeInput(input) {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, CONFIG.UI.MAX_INPUT_HEIGHT) + 'px';
    }

    clearMessageInput() {
        if (this.messageInput) {
            this.messageInput.value = '';
            this.autoResizeInput(this.messageInput);
        }
    }

    // Scroll to bottom of messages
    scrollToBottom() {
        if (this.messageContainer) {
            this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        }
    }

    // Utility functions
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) {
            return 'Just now';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        } else if (diffInMinutes < 1440) {
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

    // Notification sound
    playNotificationSound() {
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

    // Toast notifications
    showError(message) {
        this.showToast(message, 'error', 'fas fa-exclamation-circle');
    }

    showSuccess(message) {
        this.showToast(message, 'success', 'fas fa-check-circle');
    }

    showWarning(message) {
        this.showToast(message, 'warning', 'fas fa-exclamation-triangle');
    }

    showToast(message, type = 'info', icon = 'fas fa-info-circle') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;
        
        const colors = {
            error: '#e74c3c',
            success: '#27ae60',
            warning: '#f39c12',
            info: '#3498db'
        };
        
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${colors[type] || colors.info};
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
        
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, CONFIG.UI.TOAST_DURATION);
    }
}
