const mysql = require('mysql');

const db = mysql.createConnection({
  host : DB_HOST,
  user : DB_USERNAME,
  password : DB_PASSWORD,
  database : DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database.');
});

module.exports = db;
