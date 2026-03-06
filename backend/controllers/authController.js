const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Admins are auto-approved for this setup (or handled manually)
        const isApproved = role === 'admin' ? true : false;

        const user = await User.create({
            name,
            email,
            password,
            role,
            isApproved
        });

        if (user) {
            res.status(201).json({
                message: 'Registration successful. Waiting for admin approval.',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isApproved: user.isApproved
                }
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            // Check if role matches
            if (user.role !== role) {
                return res.status(401).json({ message: `Invalid role for this user. Expected ${user.role}` });
            }

            // Check approval status
            if (!user.isApproved && user.role !== 'admin') {
                return res.status(403).json({ message: 'Your account is pending admin approval.' });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
