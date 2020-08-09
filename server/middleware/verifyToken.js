const jwt  = require('jsonwebtoken');
const {config} = require('dotenv');

config();

const verifyToken = (req, res, next) => {
  //check if there is token
  const token = req.headers.auth;
  if(!token) return res.status(401).json({status: 401, message: 'You need to signin first'});
  //extract the data from token
  const data = jwt.verify(token, process.env.KEY);
  console.log('params', data);
  req.user = data;
  next();
}

module.exports ={
  verifyToken
}