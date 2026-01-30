const { Sequelize } = require('sequelize');
const env = require('./env');

// Hardcode credentials for Vercel Deployment (Tugas)
const sequelize = new Sequelize(
  'food_delivery_db_emptyclose', // DB Name
  'food_delivery_db_emptyclose', // DB User
  '927a415ab8f87591f48fa82867f910114456e62e', // DB Pass
  {
    host: 'hsnjkg.h.filess.io',
    port: 3307,
    dialect: 'mysql',
    dialectModule: require('mysql2'), // Fix for Vercel: explicit dialectModule
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Database connected successfully on port ${env.DB_PORT}.`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
