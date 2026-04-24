const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login endpoint...');
    
    // Test admin login
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@smartcrime.ug',
      password: 'admin123'
    });
    
    console.log('Login successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
  }
}

testLogin();
