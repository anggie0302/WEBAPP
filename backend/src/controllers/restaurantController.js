const { Restaurant, MenuItem, Order, OrderItem, User } = require('../models');

exports.getRestaurantProfile = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ where: { user_id: req.user.id } });
        if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
        res.json(restaurant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMenu = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ where: { user_id: req.user.id } });
        if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

        const menuItems = await MenuItem.findAll({
            where: { restaurant_id: restaurant.id }
        });
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addMenuItem = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ where: { user_id: req.user.id } });
        if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

        const menuItem = await MenuItem.create({
            ...req.body,
            restaurant_id: restaurant.id
        });
        res.status(201).json(menuItem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const menuItem = await MenuItem.findByPk(id);
        if (!menuItem) return res.status(404).json({ error: 'Menu item not found' });
        
        // Verify ownership
        const restaurant = await Restaurant.findOne({ where: { user_id: req.user.id } });
        if (menuItem.restaurant_id !== restaurant.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        await menuItem.update(req.body);
        res.json(menuItem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const menuItem = await MenuItem.findByPk(id);
        if (!menuItem) return res.status(404).json({ error: 'Menu item not found' });

        const restaurant = await Restaurant.findOne({ where: { user_id: req.user.id } });
        if (menuItem.restaurant_id !== restaurant.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        await menuItem.destroy();
        res.json({ message: 'Menu item deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ where: { user_id: req.user.id } });
        if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

        const orders = await Order.findAll({
            where: { restaurant_id: restaurant.id },
            include: [
                { model: OrderItem, include: [MenuItem] },
                { model: User, as: 'Customer', attributes: ['name', 'phone'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const order = await Order.findByPk(orderId);

        if (!order) return res.status(404).json({ error: 'Order not found' });

        const restaurant = await Restaurant.findOne({ where: { user_id: req.user.id } });
        if (order.restaurant_id !== restaurant.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        order.status = status;
        await order.save();
        
        // Emit socket event
        const io = req.app.get('io');
        io.emit(`order_${order.id}`, { status: order.status, orderId: order.id });
        
        // Also notify drivers if status is ready
        if (status === 'ready') {
             io.emit('order_ready_for_pickup', order);
        }

        res.json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.toggleOpen = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ where: { user_id: req.user.id } });
        if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

        restaurant.is_open = !restaurant.is_open;
        await restaurant.save();

        res.json({ is_open: restaurant.is_open });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ where: { user_id: req.user.id } });
        if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

        // Calculate total earnings
        const orders = await Order.findAll({
            where: { 
                restaurant_id: restaurant.id,
                status: 'delivered' // Only delivered orders count
            }
        });

        const totalEarnings = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
        const totalOrders = orders.length;

        res.json({ totalEarnings, totalOrders });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateOrderPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findByPk(orderId);

        if (!order) return res.status(404).json({ error: 'Order not found' });

        const restaurant = await Restaurant.findOne({ where: { user_id: req.user.id } });
        if (order.restaurant_id !== restaurant.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        order.payment_status = 'paid';
        await order.save();

        res.json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
