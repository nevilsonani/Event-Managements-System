const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register for an event
router.post('/:id/register', authenticateToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    // Check if event exists and has capacity
    const eventResult = await pool.query(`
      SELECT 
        e.*,
        COUNT(r.id) as current_registrations
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'confirmed'
      WHERE e.id = $1
      GROUP BY e.id
    `, [eventId]);

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const event = eventResult.rows[0];
    
    if (event.current_registrations >= event.max_capacity) {
      return res.status(400).json({ message: 'Event is at full capacity' });
    }

    // Check if user is already registered
    const existingRegistration = await pool.query(
      'SELECT id FROM registrations WHERE user_id = $1 AND event_id = $2',
      [userId, eventId]
    );

    if (existingRegistration.rows.length > 0) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Create registration
    const result = await pool.query(
      'INSERT INTO registrations (user_id, event_id) VALUES ($1, $2) RETURNING *',
      [userId, eventId]
    );

    res.status(201).json({
      message: 'Successfully registered for event',
      registration: result.rows[0]
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Cancel registration
router.delete('/:id/register', authenticateToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM registrations WHERE user_id = $1 AND event_id = $2 RETURNING *',
      [userId, eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    res.json({
      message: 'Registration cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ message: 'Server error cancelling registration' });
  }
});

// Get user's registrations
router.get('/users/:id/registrations', authenticateToken, async (req, res) => {
  let client;
  try {
    const userId = req.params.id;

    // Ensure user can only view their own registrations
    if (parseInt(userId) !== req.user.id) {
      return res.status(403).json({ message: 'You can only view your own registrations' });
    }

    client = await pool.connect();

    const result = await client.query(`
      SELECT 
        r.*,
        e.title,
        e.description,
        e.date_time,
        e.location,
        e.max_capacity,
        u.name as creator_name
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      JOIN users u ON e.created_by = u.id
      WHERE r.user_id = $1
      ORDER BY e.date_time ASC
    `, [userId]);

    res.json({
      registrations: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ message: 'Server error fetching registrations' });
  } finally {
    if (client) {
      client.release();
    }
  }
});

module.exports = router;
