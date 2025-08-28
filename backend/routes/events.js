const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeEventCreator } = require('../middleware/auth');
const { validateEvent } = require('../middleware/validation');

const router = express.Router();

// Create a new event
router.post('/', authenticateToken, validateEvent, async (req, res) => {
  try {
    const { title, description, date_time, location, max_capacity } = req.body;
    const created_by = req.user.id;

    const result = await pool.query(
      'INSERT INTO events (title, description, date_time, location, max_capacity, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, date_time, location, max_capacity, created_by]
    );

    res.status(201).json({
      message: 'Event created successfully',
      event: result.rows[0]
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error creating event' });
  }
});

// Get all upcoming events with registration count
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.*,
        u.name as creator_name,
        COUNT(r.id) as current_registrations,
        (e.max_capacity - COUNT(r.id)) as available_spots
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'confirmed'
      WHERE e.date_time > NOW()
      GROUP BY e.id, u.name
      ORDER BY e.date_time ASC
    `);

    res.json({
      events: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error fetching events' });
  }
});

// Get event details with registration count
router.get('/:id', async (req, res) => {
  try {
    const eventId = req.params.id;

    const result = await pool.query(`
      SELECT 
        e.*,
        u.name as creator_name,
        COUNT(r.id) as current_registrations,
        (e.max_capacity - COUNT(r.id)) as available_spots
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'confirmed'
      WHERE e.id = $1
      GROUP BY e.id, u.name
    `, [eventId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({
      event: result.rows[0]
    });

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error fetching event' });
  }
});

// Get events by creator
router.get('/creator/:userId', authenticateToken, async (req, res) => {
  let client;
  try {
    const userId = req.params.userId;
    
    // Ensure user can only view their own events
    if (parseInt(userId) !== req.user.id) {
      return res.status(403).json({ message: 'You can only view your own events' });
    }

    // Get a client from the connection pool
    client = await pool.connect();

    const result = await client.query(`
      SELECT 
        e.*,
        COUNT(r.id) as current_registrations,
        (e.max_capacity - COUNT(r.id)) as available_spots,
        u.name as creator_name
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'confirmed'
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.created_by = $1
      GROUP BY e.id, u.name
      ORDER BY e.date_time ASC
    `, [userId]);

    res.json({
      events: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Get creator events error:', error);
    res.status(500).json({ message: 'Server error fetching creator events' });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Search events
router.get('/search', async (req, res) => {
  try {
    const { q, location, date_from, date_to } = req.query;
    
    let query = `
      SELECT 
        e.*,
        u.name as creator_name,
        COUNT(r.id) as current_registrations,
        (e.max_capacity - COUNT(r.id)) as available_spots
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'confirmed'
      WHERE e.date_time > NOW()
    `;
    
    const params = [];
    let paramCount = 1;

    if (q) {
      query += ` AND (e.title ILIKE $${paramCount} OR e.description ILIKE $${paramCount})`;
      params.push(`%${q}%`);
      paramCount++;
    }

    if (location) {
      query += ` AND e.location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
      paramCount++;
    }

    if (date_from) {
      query += ` AND e.date_time >= $${paramCount}`;
      params.push(date_from);
      paramCount++;
    }

    if (date_to) {
      query += ` AND e.date_time <= $${paramCount}`;
      params.push(date_to);
      paramCount++;
    }

    query += ` GROUP BY e.id, u.name ORDER BY e.date_time ASC`;

    const result = await pool.query(query, params);

    res.json({
      events: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Search events error:', error);
    res.status(500).json({ message: 'Server error searching events' });
  }
});

// Update event (only by creator)
router.put('/:id', authenticateToken, authorizeEventCreator, validateEvent, async (req, res) => {
  try {
    const eventId = req.params.id;
    const { title, description, date_time, location, max_capacity } = req.body;

    const result = await pool.query(
      'UPDATE events SET title = $1, description = $2, date_time = $3, location = $4, max_capacity = $5 WHERE id = $6 RETURNING *',
      [title, description, date_time, location, max_capacity, eventId]
    );

    res.json({
      message: 'Event updated successfully',
      event: result.rows[0]
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error updating event' });
  }
});

// Delete event (only by creator)
router.delete('/:id', authenticateToken, authorizeEventCreator, async (req, res) => {
  try {
    const eventId = req.params.id;

    await pool.query('DELETE FROM events WHERE id = $1', [eventId]);

    res.json({
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error deleting event' });
  }
});

module.exports = router;
