import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin2024',
  database: 'femanicbd'
});

console.log('Conectado ao banco MySQL!');

export default connection;
