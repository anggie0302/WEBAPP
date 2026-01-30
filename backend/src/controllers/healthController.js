const { sequelize } = require('../models');

exports.db = async (req, res) => {
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query('SELECT 1+1 AS result');
    res.json({ ok: true, result: rows[0]?.result ?? null });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};
