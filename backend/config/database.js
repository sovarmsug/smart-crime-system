const knex = require('knex');
require('dotenv').config();

// Supabase + Render production-safe configuration
const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  },
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
  }
});

// Test DB connection
async function testConnection() {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connection OK');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

// Initialize database
async function initializeDatabase() {
  try {
    console.log('🗄️ Initializing database...');

    await testConnection();

    // Optional PostGIS (safe in Supabase)
    try {
      await db.raw('CREATE EXTENSION IF NOT EXISTS postgis;');
      console.log('✅ PostGIS extension enabled');
    } catch (err) {
      console.warn('⚠️ PostGIS skipped:', err.message);
    }

    await db.migrate.latest();
    console.log('✅ Migrations completed');

    if (process.env.NODE_ENV === 'development') {
      await db.seed.run();
      console.log('✅ Seeds completed');
    }

    console.log('🎉 Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
}

module.exports = { db, initializeDatabase };