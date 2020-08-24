const { Pool } = require('pg');
const { config } = require('dotenv');

config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
pool.on('connect', () => {
  console.log('connected');
});

const createTable = async () => {
  const usersTable = `CREATE TABLE IF NOT EXISTS users(
    user_id SERIAL NOT NULL PRIMARY KEY,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password VARCHAR(500) NOT NULL,
    role TEXT NOT NULL,
    profileImage TEXT NOT NULL
  )`;

  const categoriesTable = `CREATE TABLE IF NOT EXISTS categories(
    category_name VARCHAR(100) PRIMARY KEY
  )`;
  const newsTable = `CREATE TABLE IF NOT EXISTS news(
    news_id SERIAL NOT NULL PRIMARY KEY,
    title VARCHAR(1000) NOT NULL,
    subtitle VARCHAR(1000) NOT NULL,
    body VARCHAR(1000000) NOT NULL UNIQUE,
    category VARCHAR(100) REFERENCES categories(category_name) NOT NULL,
    image VARCHAR(2000) NOT NULL,
    status VARCHAR(50) NOT NULL,
    bodyHtml VARCHAR(10100000) NOT NULL
  )`;


  const dummy = `INSERT INTO users(firstname, lastname, email, password, role, profileImage) VALUES('jordan','kayinamura', 'jordankayinamura@gmail.com','$2y$10$UhsXeM5Mq9.2g0BXEzCow.yiVULfr6ftkcd/elyzBaA4N/G0LqnQW', 'admin', '')`
  await pool.query(usersTable);
  await pool.query(categoriesTable);
  await pool.query(newsTable);

  await pool.query(dummy);
}
createTable();