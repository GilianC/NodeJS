
import cors from 'cors';

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

// Définir __filename et __dirname pour ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const prisma = new PrismaClient();
const app = express();
app.set('trust proxy', 1); // Trust proxy pour Render
const server = http.createServer(app);
const io = new Server(server);

// Configuration CORS
const FRONT_URL = process.env.FRONT_URL || 'http://localhost:3000';
app.use(cors({
  origin: FRONT_URL,
  credentials: true
}));
// Middlewares pour parser les données du formulaire
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration express-session sécurisée
app.use(session({
  secret: 'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: true
  }
}));

// Route POST /login pour authentification utilisateur
app.post('/login', async (req, res) => {
  const { pseudo, password } = req.body;
  if (!pseudo || !password) {
    return res.status(400).json({ success: false, message: 'Pseudo et mot de passe requis.' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { pseudo } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Utilisateur inconnu.' });
    }
    if (typeof user.password !== 'string' || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Mot de passe incorrect.' });
    }
    req.session.user = { pseudo: user.pseudo, id: user.id };
    return res.status(200).json({ success: true, message: 'Connexion réussie.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});


// ...existing code...


// Page principale : affiche le chat si connecté, sinon le formulaire
app.get('/', async (req, res) => {
  if (req.session && req.session.user) {
    const pseudo = req.session.user.pseudo;
    const messages = await prisma.message.findMany({
      orderBy: { date: 'asc' },
      take: 50
    });
    res.render('chat.twig', { pseudo, messages });
  } else {
    res.render('login.twig');
  }
});
// Route POST /login pour authentification utilisateur
app.post('/login', async (req, res) => {
  const { pseudo, password } = req.body;
  if (!pseudo || !password) {
    return res.status(400).json({ success: false, message: 'Pseudo et mot de passe requis.' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { pseudo } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Utilisateur inconnu.' });
    }
    if (typeof user.password !== 'string' || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Mot de passe incorrect.' });
    }
    req.session.user = { pseudo: user.pseudo, id: user.id };
    return res.status(200).json({ success: true, message: 'Connexion réussie.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// Route GET /logout pour déconnexion
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
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
