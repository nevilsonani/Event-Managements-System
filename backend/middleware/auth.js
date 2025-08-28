const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  let client;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get a client from the connection pool
    client = await pool.connect();
    
    // Get user from database to ensure they still exist
    const result = await client.query(
      'SELECT id, email, name FROM users WHERE id = $1', 
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired' });
    }
    return res.status(403).json({ message: 'Invalid token' });
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
    }
  }
};

const authorizeEventCreator = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT created_by FROM events WHERE id = $1',
      [eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (result.rows[0].created_by !== userId) {
      return res.status(403).json({ message: 'Only event creator can perform this action' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { authenticateToken, authorizeEventCreator };
