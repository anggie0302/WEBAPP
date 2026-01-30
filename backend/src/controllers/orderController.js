const { Order, OrderItem, MenuItem, Restaurant, Driver, User, Promotion, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                { model: Restaurant, attributes: ['name', 'address', 'image_url'] },
                { model: OrderItem, include: [MenuItem] },
                { model: Driver, include: [{model: User, attributes: ['name']}] },
                { model: User, as: 'Customer', attributes: ['name', 'phone'] }
            ]
        });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (error) {
        console.error('Error in getOrder:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const { restaurant_id, items, delivery_address, total_amount, promo_code } = req.body;
        
        let finalAmount = total_amount;
        let discountAmount = 0;
        let appliedPromoCode = null;

        const t = await sequelize.transaction();

        try {
            // Validation Promo
            if (promo_code) {
                const promo = await Promotion.findOne({
                    where: {
                        code: promo_code,
                        restaurant_id,
                        is_active: true,
                        valid_from: { [Op.lte]: new Date() },
                        valid_until: { [Op.gte]: new Date() }
                    },
                    transaction: t
                });

                if (promo) {
                    if (total_amount >= promo.min_order) {
                        if (promo.discount_type === 'percent') {
                            discountAmount = (total_amount * promo.discount_value) / 100;
                        } else {
                            discountAmount = promo.discount_value;
                        }
                        finalAmount = total_amount - discountAmount;
                        if (finalAmount < 0) finalAmount = 0;
                        appliedPromoCode = promo_code;
                    }
                }
            }

            // Verify Stock
            for (const item of items) {
                const menuItem = await MenuItem.findByPk(item.id, { transaction: t });
                if (!menuItem) {
                    throw new Error(`Menu item ${item.name} not found`);
                }
                if (menuItem.stock < item.quantity) {
                    throw new Error(`Stok tidak cukup untuk ${menuItem.name}`);
                }
                
                // Deduct stock
                menuItem.stock -= item.quantity;
                if (menuItem.stock === 0) {
                    menuItem.is_available = false;
                }
                await menuItem.save({ transaction: t });
            }

            const order = await Order.create({
                customer_id: req.user.id,
                restaurant_id,
                delivery_address,
                total_amount: finalAmount,
                status: 'pending',
                promo_code: appliedPromoCode,
                discount_amount: discountAmount,
                payment_method: 'cod',
                payment_status: 'unpaid'
            }, { transaction: t });

            for (const item of items) {
                await OrderItem.create({
                    order_id: order.id,
                    menu_item_id: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    notes: item.notes
                }, { transaction: t });
            }
            
            await t.commit();

            const fullOrder = await Order.findByPk(order.id, {
                include: [{ model: OrderItem, include: [MenuItem] }]
            });

            // Notify restaurant
            const io = req.app.get('io');
            if (io) {
                io.emit(`restaurant_${restaurant_id}_orders`, fullOrder);
            }

            res.status(201).json(fullOrder);
        } catch (error) {
            await t.rollback();
            throw error;
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { customer_id: req.user.id },
            include: [
                { model: Restaurant, attributes: ['name'] },
                { model: OrderItem, include: [MenuItem] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getReadyOrders = async (req, res) => {
    try {
        // Find ready orders that haven't been assigned to a driver yet
        const orders = await Order.findAll({
            where: { 
                status: 'ready',
                driver_id: null 
            },
            include: [
                { model: Restaurant, attributes: ['name', 'address'] },
                { model: User, as: 'Customer', attributes: ['name', 'phone'] }
            ]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.driverAcceptOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const driver = await Driver.findOne({ where: { user_id: req.user.id } });
        
        if (!driver) return res.status(404).json({ error: 'Driver profile not found' });

        const order = await Order.findByPk(orderId);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        
        if (order.status !== 'ready') return res.status(400).json({ error: 'Order not ready for pickup' });

        order.driver_id = driver.id;
        order.status = 'on_the_way';
        await order.save();

        // Refetch with associations
        const fullOrder = await Order.findByPk(order.id, {
            include: [
                { model: Restaurant, attributes: ['name', 'address', 'image_url'] },
                { model: User, as: 'Customer', attributes: ['name', 'phone'] }
            ]
        });

        const io = req.app.get('io');
        if (io) {
            io.emit(`order_${order.id}`, { status: order.status, orderId: order.id });
        }

        res.json(fullOrder);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getDriverActiveOrders = async (req, res) => {
    try {
        const driver = await Driver.findOne({ where: { user_id: req.user.id } });
        if (!driver) return res.status(404).json({ error: 'Driver profile not found' });

        const orders = await Order.findAll({
            where: { 
                driver_id: driver.id,
                status: 'on_the_way'
            },
            include: [
                { model: Restaurant, attributes: ['name', 'address', 'image_url'] },
                { model: User, as: 'Customer', attributes: ['name', 'phone'] }
            ]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDriverOrderHistory = async (req, res) => {
    try {
        const driver = await Driver.findOne({ where: { user_id: req.user.id } });
        if (!driver) return res.status(404).json({ error: 'Driver profile not found' });

        const orders = await Order.findAll({
            where: { 
                driver_id: driver.id,
                status: 'delivered'
            },
            include: [
                { model: Restaurant, attributes: ['name', 'address'] },
                { model: User, as: 'Customer', attributes: ['name'] }
            ],
            order: [['updatedAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.driverCompleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const driver = await Driver.findOne({ where: { user_id: req.user.id } });
        
        const order = await Order.findByPk(orderId);
        
        if (order.driver_id !== driver.id) return res.status(403).json({ error: 'Forbidden' });

        order.status = 'delivered';
        await order.save();

        const io = req.app.get('io');
        if (io) {
            io.emit(`order_${order.id}`, { status: order.status, orderId: order.id });
        }

        res.json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
