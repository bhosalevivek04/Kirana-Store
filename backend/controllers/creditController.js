const CreditLedger = require('../models/CreditLedger');
const User = require('../models/User');

exports.addCreditEntry = async (req, res) => {
    try {
        const { userId, amount, type, description } = req.body;

        // Admin can add entries for any user
        // Customer can only add entries for themselves
        if (req.user.role === 'admin') {
            // Admin adding entry for a customer
            const entry = new CreditLedger({
                user: userId,
                amount,
                type,
                description
            });
            await entry.save();
            res.status(201).json(entry);
        } else {
            // Customer adding entry for themselves (when placing order on credit)
            const entry = new CreditLedger({
                user: req.user.id,
                amount,
                type,
                description
            });
            await entry.save();
            res.status(201).json(entry);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getUserCredits = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const credits = await CreditLedger.find({ user: req.params.userId }).sort({ date: -1 });
        res.json(credits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllCredits = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        // Aggregate to get total credit per user
        const credits = await CreditLedger.aggregate([
            {
                $group: {
                    _id: '$user',
                    totalCredit: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', { $multiply: ['$amount', -1] }] } },
                    lastUpdated: { $max: '$date' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails'
            },
            {
                $project: {
                    userId: '$_id',
                    name: '$userDetails.name',
                    email: '$userDetails.email',
                    totalCredit: 1,
                    lastUpdated: 1
                }
            }
        ]);
        res.json(credits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all credit entries (detailed transactions)
exports.getAllCreditEntries = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        const entries = await CreditLedger.find()
            .populate('user', 'name email')
            .sort({ date: -1 });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update credit entry
exports.updateCreditEntry = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        const { amount, type, description } = req.body;
        const entry = await CreditLedger.findByIdAndUpdate(
            req.params.id,
            { amount, type, description },
            { new: true }
        ).populate('user', 'name email');

        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        res.json(entry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete credit entry
exports.deleteCreditEntry = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        const entry = await CreditLedger.findByIdAndDelete(req.params.id);

        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        res.json({ message: 'Entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

