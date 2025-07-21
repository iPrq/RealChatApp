# RealChat - Modern Chat Application Frontend

A beautiful, modern frontend for the chat application built with HTML, CSS, and JavaScript. This frontend connects to the Spring Boot backend using WebSocket (STOMP) for real-time messaging.

## Features

### 🎨 Beautiful Modern UI
- Clean, responsive design with gradient backgrounds
- Professional chat interface with message bubbles
- Real-time typing indicators
- Online user list
- Multiple chat rooms
- Smooth animations and transitions

### 💬 Real-time Messaging
- WebSocket connection using STOMP protocol
- Instant message delivery
- Message history loading
- System notifications (user join/leave)
- Message timestamps with smart formatting

### 🔧 Interactive Features
- Username customization with avatar colors
- Room switching (General, Development, Gaming)
- Connection status indicator
- Sound notifications for new messages
- Auto-resizing message input
- Emoji button (ready for implementation)
- File attachment button (ready for implementation)

### 📱 Responsive Design
- Mobile-friendly interface
- Adaptive layout for different screen sizes
- Touch-friendly controls
- Collapsible sidebar on mobile

## Backend Integration

This frontend is designed to work with the Spring Boot chat application from [iPrq/Chat-Application](https://github.com/iPrq/Chat-Application).

### API Endpoints Used:
- **WebSocket**: `ws://localhost:8080/ws` (with SockJS fallback)
- **Message Topic**: `/topic/messages` (subscription)
- **Send Message**: `/app/chat` (publish)
- **Get Messages**: `GET /message` (REST API)

### Message Structure:
```json
{
  "content": "Hello world!",
  "sender": "username",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "roomid": 1
}
```

## Setup Instructions

### Prerequisites
1. **Backend Server**: Make sure the Spring Boot chat application is running on `http://localhost:8080`
2. **Web Server**: Serve the frontend files using any web server (see options below)

### Option 1: Using Live Server (VS Code)
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html` and select "Open with Live Server"
3. The application will open in your browser at `http://127.0.0.1:5500`

### Option 2: Using Python HTTP Server
```bash
# Navigate to the project directory
cd "d:\Code\Project Websites\RealChatApp\Website"

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Then open `http://localhost:8000` in your browser.

### Option 3: Using Node.js HTTP Server
```bash
# Install http-server globally
npm install -g http-server

# Navigate to project directory and start server
cd "d:\Code\Project Websites\RealChatApp\Website"
http-server -p 8000

# Open http://localhost:8000 in your browser
```

### Option 4: Using any Web Server
Simply serve the files from any web server (Apache, Nginx, etc.) and access through your browser.

## Configuration

### Backend URL Configuration
If your backend is running on a different port or host, update the WebSocket connection URLs in `script.js`:

```javascript
// Line ~100 in script.js
const socket = new SockJS('http://localhost:8080/ws');

// Line ~140 in script.js  
const response = await fetch('http://localhost:8080/message');
```

### CORS Configuration
Make sure your Spring Boot backend allows CORS from your frontend domain. The backend should include:

```java
// In WebSocketConfiguration.java
config.addEndpoint("/ws").setAllowedOrigins("*").withSockJS();
```

## File Structure

```
Website/
├── index.html          # Main HTML structure
├── styles.css          # Beautiful CSS styling
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Features in Detail

### User Interface
- **Sidebar**: User profile, chat rooms list
- **Main Area**: Message history, typing indicator, message input
- **Users Panel**: Online users list (desktop only)
- **Modal**: Username entry on first visit

### WebSocket Features
- Automatic reconnection on connection loss
- Connection status indicator
- Real-time message broadcasting
- Room-based messaging

### Message Features
- Message history persistence
- Smart timestamp formatting ("Just now", "5m ago", etc.)
- HTML escaping for security
- Character limit (500 characters)
- System messages for user events

## Customization

### Themes
The CSS uses CSS custom properties for easy theming. Key color variables:
- Primary: `#3498db` (blue)
- Success: `#2ecc71` (green)  
- Warning: `#f39c12` (orange)
- Danger: `#e74c3c` (red)

### Adding New Rooms
To add new chat rooms, update the sidebar HTML and the `roomNames` object in `script.js`.

### Sound Notifications
The app includes Web Audio API-based notification sounds. You can replace this with actual audio files if preferred.

## Troubleshooting

### Connection Issues
1. Ensure the backend server is running on port 8080
2. Check browser console for WebSocket errors
3. Verify CORS configuration in backend
4. Try refreshing the page

### Messages Not Appearing
1. Check if WebSocket connection is established (green status indicator)
2. Verify the message format matches the backend expectations
3. Check browser console for JavaScript errors

### Styling Issues
1. Ensure all CSS files are loading properly
2. Check for browser caching issues
3. Verify font and icon CDN availability

## Contributing

Feel free to enhance this frontend with additional features:
- Emoji picker implementation
- File upload functionality
- Message search
- User mentions
- Message reactions
- Dark/light theme toggle
- Message encryption
- Voice messages

## License

This project is open source and available under the MIT License.
