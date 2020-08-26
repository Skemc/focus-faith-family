const { Pool, Client } = require('pg');
var cloudinary = require('cloudinary').v2;
const {config} = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
config();

const pool = new Pool({connectionString: process.env.DATABASE_URL})
pool.on('connect', () => {
  console.log('connected');
}); 


const getArticles = (req, res) => {
  pool.query('SELECT * FROM news', (err, results) => {
    if (err) {
      throw err;
    }
    res.status(200).json(results.rows);
  })
}
const createArticle = async (req, res) => {
  const {title, subtitle, body, author, category, image} = req.body;
  console.log('here', req.body);
  try {
  const results = await pool.query(`INSERT INTO news(title,subtitle,body,author,category,image) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [title, subtitle, body, author, category, image]);
  return res.status(201).json(results.rows);
  } catch (error) {
    return res.status(500).json({message: error.message});
  }
  
}
const createUser = async (req, res) => {
  const {firstName, lastName, email, password, profileImage, role} = req.body;
  console.log('here', req.body);
  try {
    const hashPassword = bcrypt.hashSync(password, 10);
    const results = await pool.query(`INSERT INTO users(firstName, lastName, email, password, profileImage, role) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [firstName, lastName, email, hashPassword, profileImage, role]);
  
    return res.status(201).json(results.rows);
  } catch (error) {
    return res.status(500).json({message: error.message});
  }
  
}

const signinUser = async (req, res) => {
  const {email, password} = req.body;
  // console.log('------', req.body);
  try {
    const emailFound = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (!emailFound) return res.status(404).json({ message: 'This account is not created yet' });
    
    const isPassword = bcrypt.compareSync(password, emailFound.rows[0].password);
    if (!isPassword) return res.status(401).json({ message: 'Incorrect email or password' });
    
    const token = jwt.sign({payload: emailFound.rows[0]}, process.env.KEY);
    console.log('done------', token);
    const payload = jwt.verify(token, process.env.KEY);
    req.user = payload;
    return res.status(200).json({status: 200, data: token});


  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

const changeRole = async (req, res) => {
  const {user_id} = req.user.payload;
  const {userId} = req.params;
  const {role} = req.body;
  //check if is admin
  const {rows} = await pool.query('SELECT * FROM users WHERE user_id=$1', [user_id]);
  if (rows[0].role !== 'admin') return res.status(403).json({ status: 403, message: 'Forbidden action' });
  //check if email or user exists
  const user = await pool.query('SELECT * FROM users WHERE user_id=$1', [userId]);
  if (user.rowCount === 0) return res.status(404).json({ status: 404, message: 'User not found' });
  //change role
  const updateRole = await pool.query('UPDATE users SET role=$1 WHERE user_id=$2 RETURNING *', [role, userId]);
  console.log('whaaat', updateRole.rows[0]);
  return res.status(200).json({ status: 200, data: updateRole.rows[0] });
}

const getNews = async () => {
  const { rows } = await pool.query('SELECT * FROM news');
  return rows;
}

module.exports = {
  getArticles,
  createArticle,
  createUser,
  signinUser,
  changeRole,
  getNews
}
