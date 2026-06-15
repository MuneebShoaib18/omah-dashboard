// Simple test to verify the server can start
console.log('Testing server startup...');
console.log('Required dependencies check:');

try {
  const express = require('express');
  console.log('✓ Express loaded');
  
  const cors = require('cors');
  console.log('✓ CORS loaded');
  
  const cookieParser = require('cookie-parser');
  console.log('✓ Cookie Parser loaded');
  
  const jwt = require('jsonwebtoken');
  console.log('✓ JWT loaded');
  
  const db = require('./db');
  console.log('✓ Database module loaded');
  
  console.log('\n✓ All dependencies available!');
  console.log('\nTesting database...');
  
  db.getUserById('admin-1').then(user => {
    if (user) {
      console.log('✓ Admin user found:', user.name);
      console.log('\n✓ Database is working!');
      process.exit(0);
    } else {
      console.log('✗ Admin user not found');
      process.exit(1);
    }
  }).catch(err => {
    console.log('✗ Database error:', err.message);
    process.exit(1);
  });
  
} catch (error) {
  console.error('✗ Error:', error.message);
  process.exit(1);
}
