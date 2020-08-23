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


const createArticle = async (req, res) => {
  const {title, subtitle, body, author, category, image, bodyhtml} = req.body;
  console.log('here', req.body);
  try {
  const results = await pool.query(`INSERT INTO news(title,subtitle,body,author,category,image, bodyhtml) VALUES ($1,$2,$3,$4,$5,$6, $7) RETURNING *`, [title, subtitle, body, author, category, image, bodyhtml]);
  return res.status(201).json(results.rows);
  } catch (error) {
    return res.status(500).json({message: error.message});
  }
  
}
const createUser = async (req, res) => {
  const {firstName, lastName, email, phone, password, profileImage, role} = req.body;
  console.log('here', req.bo);
  try {
    const isUser = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if(isUser.rowCount > 0) return res.status(409).json({status: 409, message: 'User already exists'})
    const hashPassword = bcrypt.hashSync(password, 10);
    const results = await pool.query(`INSERT INTO users(firstName, lastName, email, phone, password, profileImage, role) VALUES ($1,$2,$3,$4,$5,$6, $7) RETURNING *`, [firstName, lastName, email, phone, hashPassword, profileImage, role]);
    console.log('yoooo', results.rows);
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

const editArticle = async (req, res) => {
  //check if the user exists 
  const {user_id} = req.user.payload;
  const {articleId} = req.params;
  const {title, subtitle, category, body, status} = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE user_id=$1', [user_id]);
    console.log('savage', user_id);
    if (rows.length < 0) return res.status(404).json({ status: 404, message: 'User not found' });
    
    // check if the user is an admin or editor
    if (rows[0].role !== 'admin' && rows[0].role !== 'editor') return res.status(403).json({ status: 403, message: 'Forbidden action' });
   
    // check if the article exists
    const isArticle = await pool.query('SELECT * FROM news WHERE news_id=$1', [articleId]);
    if (isArticle.rowCount < 0) res.status(404).json({ status: 404, message: 'Article not found' });

    // edit the article
    // change the status of the article to posted
    const updatedArticle = await pool.query(`UPDATE news SET title=$1, subtitle=$2, body=$3, category=$4, status='edited' WHERE news_id=$5 RETURNING *`, [title, subtitle, body, category, articleId]);
    console.log('savage', updatedArticle.rows[0]);

    // if (updatedArticle.rows[0].news_id === articleId && updatedArticle.rows[0].status === 'posted') return res.status(400).json({ status: 400, message: 'The article was not edited successfully' });
    
    return res.status(200).json({ status: 200, message: 'Article edited successfully', data: updatedArticle.rows[0] });
  } catch (error) {
    return res.status(500).json({status: 500, message: error.message})
  }  
};

const getAllArticles = async (req, res) => {
  //get all articles 
  try {    
    const articles = await pool.query('SELECT * FROM news');
    return res.status(200).json({status: 200, data: articles.rows})
  } catch (error) {
    return res.status(500).json({ status: 500,message: error.message })
  }
}

const getAllUsers = async (req, res) => {
  //get all users
  try {    
    const users = await pool.query('SELECT * FROM users');
    return res.status(200).json({status: 200, data: users.rows})
  } catch (error) {
    return res.status(500).json({ status: 500,message: error.message })
  }
}
const getArticle = async (req, res) => {
  // get from params
  const {newsId} = req.params;
  console.log('ari');
  try {
    const isArticle = await pool.query('SELECT * FROM news WHERE news_id=$1', [newsId]);
    // check if the article exists
    console.log('ari', isArticle.rowCount <= 0);
    if (isArticle.rowCount <= 0) return res.status(404).json({ status: 404, message: 'Article not found' });
    // return article
    return res.status(200).json({ status: 200, data: isArticle.rows[0] });
  } catch (error) {
    return res.status(500).json({status: 500, data: error.message});
  }
}

module.exports = {
  createArticle,
  createUser,
  signinUser,
  changeRole,
  editArticle,
  getAllArticles,
  getAllUsers, 
  getArticle
}
