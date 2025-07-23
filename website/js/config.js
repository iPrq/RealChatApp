/**
 * Configuration module for the Chat Application
 */
const CONFIG = {
    // API Configuration
    API: {
        BASE_PORT: 8080,
        ENDPOINTS: {
            WEBSOCKET: '/ws',
            MESSAGES: '/message'
        },
        getBackendUrl() {
            // Check for environment override first
            if (window.BACKEND_URL) {
                console.log('🌍 Using environment backend URL:', window.BACKEND_URL);
                return window.BACKEND_URL;
            }
            
            // Dynamically determine backend URL based on environment
            const hostname = window.location.hostname;
            
            // Production: Use Render backend URL (update with your actual backend URL)
            if (hostname.includes('onrender.com')) {
                return 'https://realchatapp-1-ogou.onrender.com'; // Your actual backend URL
            }
            
            // Local development with environment variable support
            if (window.location.hostname === 'localhost') {
                // Check if backend URL is provided via environment or config
                const envBackendUrl = window.BACKEND_URL || localStorage.getItem('BACKEND_URL');
                if (envBackendUrl) {
                    return envBackendUrl;
                }
            }
            
            // Default: Use localhost for development
            const protocol = window.location.protocol;
            return `${protocol}//${hostname}:${this.BASE_PORT}`;
        }
    },

    // WebSocket Configuration
    WEBSOCKET: {
        TOPICS: {
            PUBLIC: '/topic/messages'
        },
        SEND_ENDPOINTS: {
            CHAT: '/app/chat'
        },
        MAX_RECONNECT_ATTEMPTS: 5,
        RECONNECT_DELAY: 3000
    },

    // UI Configuration
    UI: {
        MAX_MESSAGE_LENGTH: 500,
        MIN_USERNAME_LENGTH: 2,
        MAX_USERNAME_LENGTH: 20,
        TYPING_TIMEOUT: 2000,
        TOAST_DURATION: 3000,
        MAX_INPUT_HEIGHT: 120,
        
        // Room configuration
        ROOMS: {
            '1': 'General',
            '2': 'Development',
            '3': 'Gaming'
        },

        // Avatar colors for users
        AVATAR_COLORS: [
            'linear-gradient(135deg, #667eea, #764ba2)',
            'linear-gradient(135deg, #f093fb, #f5576c)',
            'linear-gradient(135deg, #4facfe, #00f2fe)',
            'linear-gradient(135deg, #43e97b, #38f9d7)',
            'linear-gradient(135deg, #fa709a, #fee140)',
            'linear-gradient(135deg, #30cfd0, #91a7ff)',
            'linear-gradient(135deg, #a8edea, #fed6e3)',
            'linear-gradient(135deg, #ff9a9e, #fecfef)'
        ]
    },

    // System messages
    MESSAGES: {
        CONNECTION: {
            CONNECTING: 'Connecting...',
            CONNECTED: 'Connected',
            DISCONNECTED: 'Disconnected',
            FAILED: 'Connection Failed'
        },
        ERRORS: {
            USERNAME_TOO_SHORT: 'Username must be at least 2 characters long',
            USERNAME_TOO_LONG: 'Username must be less than 20 characters',
            MESSAGE_TOO_LONG: 'Message is too long. Maximum 500 characters allowed.',
            CONNECTION_FAILED: 'Failed to connect to chat server. Please try again.',
            SEND_FAILED: 'Failed to send message. Please try again.',
            NOT_CONNECTED: 'Not connected to server'
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
