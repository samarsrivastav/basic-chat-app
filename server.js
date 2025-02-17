// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Store active users
let onlineUsers = {};

io.on('connection', (socket) => {
    socket.on('user-online', (username) => {
        onlineUsers[socket.id] = { username, socketId: socket.id };
        io.emit('update-users', Object.values(onlineUsers));
    });

    socket.on('send-message', ({ sender, receiverId, message }) => {
        if (onlineUsers[receiverId]) {
            io.to(receiverId).emit('receive-message', { sender, message });
        }
    });

    socket.on('disconnect', () => {
        delete onlineUsers[socket.id];
        io.emit('update-users', Object.values(onlineUsers));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});