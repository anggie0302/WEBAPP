const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Promotion = sequelize.define('Promotion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  restaurant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Restaurants',
      key: 'id'
    }
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  discount_type: {
    type: DataTypes.ENUM('percent', 'fixed'),
    allowNull: false
  },
  discount_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  min_order: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  valid_from: {
    type: DataTypes.DATE
  },
  valid_until: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  tableName: 'promotions'
});

module.exports = Promotion;
