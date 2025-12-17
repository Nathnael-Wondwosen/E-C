// Test script to create a sample partner
const http = require('http');

const postData = JSON.stringify({
  name: 'Test Partner',
  logo: '/placeholder-logo.png',
  website: 'https://example.com',
  isActive: true,
  order: 1
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/partners',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`Body: ${chunk}`);
  });
  res.on('end', () => {
    console.log('Request completed');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();