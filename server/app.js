const express =  require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./config/connect');
const {verifyToken} = require('./middleware/verifyToken');
const app = express()
const port = 3000

app.use(cors());
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.get('/', (req, res) => {
    res.json({ info: 'Welcome to focus faith family'})
  });
  app.get('/api/news', db.getArticles);
  app.post('/api/new-article', db.createArticle);
  app.post('/api/new-user', db.createUser);
  app.post('/api/signin', db.signinUser);
  app.patch('/api/user/:userId', verifyToken, db.changeRole);
  app.listen(port, () => {
    console.log(`App running on port ${port}.`)
  })