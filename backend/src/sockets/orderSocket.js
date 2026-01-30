const socketIo = require('socket.io');

module.exports = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected: ' + socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};
