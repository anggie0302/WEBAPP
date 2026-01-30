const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Restaurant, Driver } = require('../models');
const env = require('../config/env');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, ...otherData } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 8);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone
    });

    // Create related profile based on role
    if (role === 'restaurant') {
      await Restaurant.create({
        user_id: user.id,
        name: otherData.restaurant_name || `${name}'s Restaurant`,
        address: otherData.address || 'Address not set'
      });
    } else if (role === 'driver') {
      await Driver.create({
        user_id: user.id,
        vehicle_plate: otherData.vehicle_plate || 'UNKNOWN'
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('Invalid login credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error('Invalid login credentials');
    }

    const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

    res.send({ user, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.getMe = async (req, res) => {
    res.send(req.user);
};
