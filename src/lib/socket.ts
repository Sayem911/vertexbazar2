import { Server } from 'socket.io';

let io: Server | null = null;

export default function initializeSocket(server: any) {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('A user connected');

      socket.on('disconnect', () => {
        console.log('A user disconnected');
      });
    });
  }

  return io;
}

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized');
  }
  return io;
};
