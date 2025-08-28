require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const createTables = async () => {
  try {
    // Create Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Events table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date_time TIMESTAMP NOT NULL,
        location VARCHAR(255),
        max_capacity INTEGER NOT NULL,
        created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Registrations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'confirmed',
        UNIQUE(user_id, event_id)
      );
    `);

    console.log('Database tables created successfully!');
    
    await pool.query('CREATE INDEX IF NOT EXISTS idx_events_date_time ON events(date_time);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);');
    
    console.log('Database indexes created successfully!');
    
  } catch (error) {
    console.error(' Error creating tables:', error);
  } finally {
    await pool.end();
  }
};

createTables();
