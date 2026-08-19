const mysql = require('mysql2/promise');
const path = require('path');

require('dotenv').config({
    path: path.resolve(__dirname, '../../.env')
});

// =====================================================
// CONEXÃO COM MYSQL
// =====================================================

const pool = mysql.createPool(
    process.env.DATABASE_URL
);

module.exports = pool;