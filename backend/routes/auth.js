const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../utils/validation');

const router = express.Router();

// Register new user
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { first_name, last_name, email, phone_number, password, role = 'citizen' } = req.body;

    // Check if user already exists
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    if (phone_number) {
      const existingPhone = await db('users').where({ phone_number }).first();
      if (existingPhone) {
        return res.status(400).json({ error: 'User with this phone number already exists' });
      }
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const [user] = await db('users')
      .insert({
        first_name,
        last_name,
        email,
        phone_number,
        password_hash,
        role
      })
      .returning('*');

    // Remove password hash from response
    delete user.password_hash;

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Account is not active' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Remove password hash from response
    delete user.password_hash;

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await db('users')
      .where({ id: req.user.userId })
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    delete user.password_hash;
    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { first_name, last_name, phone_number } = req.body;
    const updateData = {};

    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (phone_number) {
      // Check if phone number is already taken by another user
      const existingPhone = await db('users')
        .where({ phone_number })
        .whereNot({ id: req.user.userId })
        .first();
      
      if (existingPhone) {
        return res.status(400).json({ error: 'Phone number already in use' });
      }
      updateData.phone_number = phone_number;
    }

    updateData.updated_at = new Date();

    const [user] = await db('users')
      .where({ id: req.user.userId })
      .update(updateData)
      .returning('*');

    delete user.password_hash;
    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    // Get current user
    const user = await db('users')
      .where({ id: req.user.userId })
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const new_password_hash = await bcrypt.hash(new_password, saltRounds);

    // Update password
    await db('users')
      .where({ id: req.user.userId })
      .update({
        password_hash: new_password_hash,
        updated_at: new Date()
      });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Verify token (for frontend to check if token is valid)
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ 
    valid: true, 
    user: { 
      id: req.user.userId, 
      email: req.user.email, 
      role: req.user.role 
    } 
  });
});

module.exports = router;
