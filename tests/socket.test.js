// Test d'intégration Socket.IO
import { createServer } from 'http';
import { Server } from 'socket.io';
import Client from 'socket.io-client';

let io, serverSocket, clientSocket;

beforeAll((done) => {
  const httpServer = createServer();
  io = new Server(httpServer);
  httpServer.listen(() => {
    const port = httpServer.address().port;
    clientSocket = Client(`http://localhost:${port}`);
    io.on('connection', (socket) => {
      serverSocket = socket;
      done();
    });
  });
});

afterAll(() => {
  io.close();
  clientSocket.close();
});

test('communication Socket.IO', (done) => {
  clientSocket.on('chat message', (msg) => {
    expect(msg).toBe('Hello');
    done();
  });
  serverSocket.emit('chat message', 'Hello');
});
