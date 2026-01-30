require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  DB_HOST: process.env.DB_HOST || 'hsnjkg.h.filess.io',
  DB_PORT: process.env.DB_PORT || 3307,
  DB_USER: process.env.DB_USER || 'food_delivery_db_emptyclose',
  DB_PASS: process.env.DB_PASS || '927a415ab8f87591f48fa82867f910114456e62e',
  DB_NAME: process.env.DB_NAME || 'food_delivery_db',
  JWT_SECRET: process.env.JWT_SECRET || 'secret_key_change_me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
