const Order = require('../models/Order');
const Product = require('../models/Product');
const redisClient = require('../config/redisClient');

exports.createOrder = async (req, res) => {
    try {
        const { items, totalAmount, paymentMethod } = req.body;

        // Validate stock availability and reduce stock
        for (const item of items) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({ message: `Product ${item.product} not found` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
                });
            }

            // Reduce stock - REMOVED as per requirement to defer until delivery
            // product.stock -= item.quantity;
            // await product.save();
        }

        const order = new Order({
            user: req.user.id,
            items,
            totalAmount,
            paymentMethod
        });
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        let orders;
        if (req.user.role === 'owner') {
            orders = await Order.find()
                .populate('user', 'name email phone')
                .populate('items.product', 'name price imageUrl')
                .sort({ createdAt: -1 });
        } else {
            orders = await Order.find({ user: req.user.id })
                .populate('user', 'name email phone')
                .populate('items.product', 'name price imageUrl')
                .sort({ createdAt: -1 });
        }
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        if (req.user.role !== 'owner') return res.status(403).json({ message: 'Access denied' });

        const { status } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // If marking as delivered, reduce stock
        if (status === 'delivered' && order.status !== 'delivered') {
            for (const item of order.items) {
                const product = await Product.findById(item.product);

                if (!product) {
                    return res.status(404).json({ message: `Product not found for item in order` });
                }

                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        message: `Cannot deliver order. Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`
                    });
                }

                product.stock -= item.quantity;
                await product.save();
            }
            // Invalidate product cache
            await redisClient.del('products');
        }

        order.status = status;
        await order.save();

        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        if (req.user.role !== 'owner') return res.status(403).json({ message: 'Access denied' });

        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
