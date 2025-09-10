// db.js
const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'ventasdb',
  connectionLimit: 5
});

module.exports = pool;
