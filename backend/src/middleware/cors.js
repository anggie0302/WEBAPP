const cors = require('cors');

const corsOptions = {
  origin: '*', // For development purposes. In production, specify the frontend URL.
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
};

module.exports = cors(corsOptions);
