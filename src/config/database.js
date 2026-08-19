const mysql = require('mysql2/promise');
const path = require('path');

require('dotenv').config({
    path: path.resolve(__dirname, '../../.env')
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('DATABASE_URL não está definida.');
}

const pool = mysql.createPool(databaseUrl);

module.exports = pool;