const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const SALT_ROUNDS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/register
 * Register a new user with bcrypt password hashing.
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Validate name
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    const trimmedName = name.trim();
    if (trimmedName.length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Name must not exceed 255 characters'
      });
    }

    // Validate email
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail) || normalizedEmail.length > 255) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required (maximum 255 characters)'
      });
    }

    // Validate password length (8 to 72 characters)
    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        success: false,
        message: 'Password must be between 8 and 72 characters'
      });
    }

    // Check for existing user with duplicate email
    const existingCheck = await db.query(
      'SELECT id FROM users WHERE email = $1;',
      [normalizedEmail]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user into PostgreSQL
    const insertResult = await db.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at, updated_at;`,
      [trimmedName, normalizedEmail, passwordHash]
    );

    const newUser = insertResult.rows[0];

    // Generate signed JWT token upon registration to enable seamless client authentication
    let token = null;
    const rawSecret = (process.env.JWT_SECRET || '').toString().trim().replace(/^["']|["']$/g, '');
    const secret = rawSecret || process.env.JWT_SECRET;
    if (secret) {
      const rawExpiresIn = (process.env.JWT_EXPIRES_IN || '1d').toString().trim().replace(/^["']|["']$/g, '');
      const expiresIn = rawExpiresIn || '1d';
      try {
        token = jwt.sign(
          { userId: newUser.id },
          secret,
          { expiresIn }
        );
      } catch (signErr) {
        console.warn('JWT sign with configured expiresIn failed on register, falling back to 1d:', signErr.message);
        try {
          token = jwt.sign(
            { userId: newUser.id },
            secret,
            { expiresIn: '1d' }
          );
        } catch {
          token = null;
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      },
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at
      }
    });
  } catch (error) {
    // Catch database-level unique constraint violation (code 23505)
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered'
      });
    }
    return next(error);
  }
}

/**
 * POST /api/auth/login
 * Authenticate user credentials and return signed JWT.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Query user by email
    const userResult = await db.query(
      'SELECT id, name, email, password_hash FROM users WHERE email = $1;',
      [normalizedEmail]
    );

    // Generic invalid credential response (prevent email enumeration)
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = userResult.rows[0];

    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const rawSecret = (process.env.JWT_SECRET || '').toString().trim().replace(/^["']|["']$/g, '');
    const secret = rawSecret || process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not configured in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Authentication service configuration error'
      });
    }

    const rawExpiresIn = (process.env.JWT_EXPIRES_IN || '1d').toString().trim().replace(/^["']|["']$/g, '');
    const expiresIn = rawExpiresIn || '1d';

    // Sign minimal JWT payload with defensive fallback for Vercel env formatting
    let token;
    try {
      token = jwt.sign(
        { userId: user.id },
        secret,
        { expiresIn }
      );
    } catch (signErr) {
      console.warn('JWT sign with configured expiresIn failed, falling back to 1d:', signErr.message);
      token = jwt.sign(
        { userId: user.id },
        secret,
        { expiresIn: '1d' }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login
};
