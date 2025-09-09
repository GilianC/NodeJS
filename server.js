const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const twig = require('twig');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuration Twig
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

// Fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Page principale du chat
// Page de connexion pseudo
app.get('/', (req, res) => {
  res.render('login.twig');
});

// Page du chat, pseudo transmis en paramètre
app.get('/chat', (req, res) => {
  const pseudo = req.query.pseudo;
  if (!pseudo) {
    return res.redirect('/');
  }
  res.render('chat.twig', { pseudo });
});

// Socket.IO
let users = {};
io.on('connection', (socket) => {
  socket.on('new user', (pseudo) => {
    users[socket.id] = pseudo;
    io.emit('user list', Object.values(users));
  });
  socket.on('chat message', (data) => {
    io.emit('chat message', data);
  });
  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('user list', Object.values(users));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
