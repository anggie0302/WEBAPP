const express = require('express');
const cors = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const orderRoutes = require('./routes/orderRoutes');
const driverRoutes = require('./routes/driverRoutes');

const app = express();

app.use(express.json());
app.use(cors);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/driver', driverRoutes);

app.get('/', (req, res) => {
  res.send('Food Delivery Backend is Running!');
});

app.use(errorHandler);

module.exports = app;
