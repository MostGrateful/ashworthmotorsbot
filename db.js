// db.js
require('dotenv').config();
const mysql = require('mysql2');

console.log('Connecting to the database with the following config:');
console.log({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? '(set)' : '(not set)',
  database: process.env.DB_NAME,
});

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected successfully.');
  }
});

module.exports = {
  db, // export the connection for raw queries if needed

  setBusinessStatus: (status) => {
    return new Promise((resolve, reject) => {
      db.query('UPDATE settings SET business_status = ? WHERE id = 1', [status], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },

  saveWaitTime: (newWaitTime) => {
    return new Promise((resolve, reject) => {
      db.query('UPDATE settings SET wait_time = ? WHERE id = 1', [newWaitTime], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },

  getBusinessStatus: () => {
    return new Promise((resolve, reject) => {
      db.query('SELECT business_status FROM settings WHERE id = 1', (err, results) => {
        if (err) reject(err);
        else resolve(results[0]?.business_status || 'Closed');
      });
    });
  },

  getWaitTime: () => {
    return new Promise((resolve, reject) => {
      db.query('SELECT wait_time FROM settings WHERE id = 1', (err, results) => {
        if (err) reject(err);
        else resolve(results[0]?.wait_time || 'No wait time set');
      });
    });
  }
};
