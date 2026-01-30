const { sequelize } = require('../config/database');
const User = require('./User');
const Restaurant = require('./Restaurant');
const MenuItem = require('./MenuItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Driver = require('./Driver');
const Review = require('./Review');
const Promotion = require('./Promotion');

// Define associations
User.hasOne(Restaurant, { foreignKey: 'user_id' });
Restaurant.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(Driver, { foreignKey: 'user_id' });
Driver.belongsTo(User, { foreignKey: 'user_id' });

Restaurant.hasMany(MenuItem, { foreignKey: 'restaurant_id' });
MenuItem.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

Restaurant.hasMany(Promotion, { foreignKey: 'restaurant_id' });
Promotion.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

User.hasMany(Order, { foreignKey: 'customer_id' });
Order.belongsTo(User, { as: 'Customer', foreignKey: 'customer_id' });

Restaurant.hasMany(Order, { foreignKey: 'restaurant_id' });
Order.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

Driver.hasMany(Order, { foreignKey: 'driver_id' });
Order.belongsTo(Driver, { foreignKey: 'driver_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

MenuItem.hasMany(OrderItem, { foreignKey: 'menu_item_id' });
OrderItem.belongsTo(MenuItem, { foreignKey: 'menu_item_id' });

User.hasMany(Review, { foreignKey: 'customer_id' });
Review.belongsTo(User, { as: 'Customer', foreignKey: 'customer_id' });

Restaurant.hasMany(Review, { foreignKey: 'restaurant_id' });
Review.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

Order.hasOne(Review, { foreignKey: 'order_id' });
Review.belongsTo(Order, { foreignKey: 'order_id' });

module.exports = {
  sequelize,
  User,
  Restaurant,
  MenuItem,
  Order,
  OrderItem,
  Driver,
  Review,
  Promotion
};
