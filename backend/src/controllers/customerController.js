const { Restaurant, MenuItem, Promotion } = require('../models');
const { Op } = require('sequelize');

exports.validatePromo = async (req, res) => {
  try {
    const { code, restaurant_id, total_amount } = req.body;

    const promo = await Promotion.findOne({
      where: {
        code,
        restaurant_id,
        is_active: true,
        valid_from: { [Op.lte]: new Date() },
        valid_until: { [Op.gte]: new Date() }
      }
    });

    if (!promo) {
      return res.status(404).json({ valid: false, message: 'Kode promo tidak ditemukan atau tidak valid.' });
    }

    if (total_amount < promo.min_order) {
      return res.status(400).json({ 
        valid: false, 
        message: `Minimal pesanan untuk promo ini adalah Rp ${promo.min_order.toLocaleString('id-ID')}` 
      });
    }

    let discountAmount = 0;
    if (promo.discount_type === 'percent') {
      discountAmount = (total_amount * promo.discount_value) / 100;
    } else {
      discountAmount = promo.discount_value;
    }

    // Ensure discount doesn't exceed total
    if (discountAmount > total_amount) {
        discountAmount = total_amount;
    }

    res.json({
      valid: true,
      discount_amount: discountAmount,
      promo_code: promo.code,
      message: 'Kode promo berhasil digunakan!'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      include: [{
        model: MenuItem,
        attributes: ['category', 'is_vegetarian', 'price']
      }]
    });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRestaurantMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const menuItems = await MenuItem.findAll({ where: { restaurant_id: restaurantId } });
    const restaurant = await Restaurant.findByPk(restaurantId);
    
    if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json({ restaurant, menu: menuItems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAvailablePromos = async (req, res) => {
  try {
    const promos = await Promotion.findAll({
      where: {
        is_active: true,
        valid_from: { [Op.lte]: new Date() },
        valid_until: { [Op.gte]: new Date() }
      },
      include: [{ model: Restaurant, attributes: ['name', 'image_url'] }]
    });
    res.json(promos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
