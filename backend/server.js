const http = require('http');
const app = require('./src/app');
const { connectDB, sequelize } = require('./src/config/database');
const env = require('./src/config/env');
const initSocket = require('./src/sockets/orderSocket');

// In production (Vercel serverless), avoid eager DB connect and Socket.IO init
if (env.NODE_ENV !== 'production') {
  // Connect to Database
  connectDB();

  // Create Server
  const server = http.createServer(app);

  // Init Socket.io
  const io = initSocket(server);
  app.set('io', io);

  // Sync Database (Force: false to keep data)
  sequelize.sync({ force: false }).then(() => {
    console.log('Database synced');
  });

  server.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

module.exports = app;
