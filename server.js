// Route POST /login pour authentification utilisateur
app.post('/login', async (req, res) => {
  const { pseudo, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { pseudo } });
    if (user && user.password === password) {
      req.session.user = { pseudo: user.pseudo, id: user.id };
      return res.status(200).json({ success: true });
    }
    res.status(401).json({ success: false, message: 'Identifiants invalides' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});
// Définir __filename et __dirname pour ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import twig from 'twig';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import session from 'express-session';

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static(path.join(__dirname, 'public')));


// Page de connexion pseudo
app.get('/', (req, res) => {
  res.render('login.twig');
});

// Page du chat, pseudo transmis en paramètre

app.get('/chat', async (req, res) => {
  const pseudo = req.query.pseudo;
  try {
    // Récupérer les derniers messages
    const messages = await prisma.message.findMany({
      orderBy: { date: 'asc' },
      take: 50
    });
    res.render('chat.twig', { pseudo, messages });
  } catch (err) {
    console.error('Erreur Prisma:', err);
    res.status(500).send(`<pre>Erreur serveur: ${err.message || err}</pre>`);
  }
});

// Socket.IO

let users = {};

io.on('connection', (socket) => {
  socket.on('new user', (pseudo) => {
    users[socket.id] = pseudo;
    io.emit('user list', Object.values(users));
  });
  socket.on('chat message', async (data) => {
    // Enregistrer le message dans la base
    await prisma.message.create({
      data: {
        contenu: data.message,
        pseudo: data.pseudo
      }
    });
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

dotenv.config();
