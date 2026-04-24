const knex = require('knex');
require('dotenv').config();

// ✅ Use DATABASE_URL (Supabase + Render fix)
const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: './seeds'
  },
  ssl: {
    rejectUnauthorized: false
  }
});

// Test DB connection
async function testConnection() {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connection OK');
  } catch (error) {
    console.error('❌ FULL DB ERROR:', error);
    throw error;
  }
}

// Initialize database
async function initializeDatabase() {
  try {
    console.log('🗄️ Initializing database...');

    await testConnection();

    try {
      await db.raw('CREATE EXTENSION IF NOT EXISTS postgis;');
      console.log('✅ PostGIS extension enabled');
    } catch (err) {
      console.warn('⚠️ PostGIS skipped:', err.message);
    }

    await db.migrate.latest();
    console.log('✅ Migrations completed');

    console.log('🎉 Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

module.exports = { db, initializeDatabase };