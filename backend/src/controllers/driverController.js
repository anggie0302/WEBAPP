const { Driver, Order } = require('../models');

exports.getDriverProfile = async (req, res) => {
    try {
        const driver = await Driver.findOne({ where: { user_id: req.user.id } });
        if (!driver) return res.status(404).json({ error: 'Driver not found' });
        res.json(driver);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.toggleAvailability = async (req, res) => {
    try {
        const driver = await Driver.findOne({ where: { user_id: req.user.id } });
        if (!driver) return res.status(404).json({ error: 'Driver not found' });

        driver.is_available = !driver.is_available;
        await driver.save();

        res.json({ is_available: driver.is_available });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const driver = await Driver.findOne({ where: { user_id: req.user.id } });
        if (!driver) return res.status(404).json({ error: 'Driver not found' });

        const orders = await Order.findAll({
            where: { 
                driver_id: driver.id,
                status: 'delivered'
            }
        });

        // Assuming 20% commission for driver or similar logic. 
        // For simplicity, let's say driver gets 20% of order total as fee.
        const totalEarnings = orders.reduce((sum, order) => sum + (Number(order.total_amount) * 0.2), 0);
        const totalDeliveries = orders.length;

        res.json({ totalEarnings, totalDeliveries });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
