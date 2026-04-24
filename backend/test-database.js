const { db } = require('./database');

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');

    const result = await db.raw('SELECT NOW()');

    console.log('✅ DATABASE CONNECTED SUCCESSFULLY');
    console.log('🕒 Server Time:', result.rows[0]);

    process.exit(0);
  } catch (error) {
    console.error('❌ DATABASE CONNECTION FAILED');
    console.error(error.message);

    process.exit(1);
  }
}

testConnection();