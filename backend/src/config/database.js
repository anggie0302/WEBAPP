const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = env.DB_URL
  ? new Sequelize(env.DB_URL, {
      dialect: 'mysql',
      logging: false,
      dialectOptions: env.DB_SSL ? { ssl: { require: true, rejectUnauthorized: false } } : undefined,
    })
  : new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASS, {
      host: env.DB_HOST,
      port: env.DB_PORT,
      dialect: 'mysql',
      logging: false,
      dialectOptions: env.DB_SSL ? { ssl: { require: true, rejectUnauthorized: false } } : undefined,
    });

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
