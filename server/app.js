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
app.get('/api/users', db.getAllUsers);
app.get('/api/news', db.getAllArticles);
app.post('/api/new-article', db.createArticle);
app.get('/api/news/:newsId', db.getArticle);
app.post('/api/new-user', db.createUser);
app.post('/api/signin', db.signinUser);
app.patch('/api/user/:userId', verifyToken, db.changeRole);
app.patch('/api/edit-article/:articleId', verifyToken, db.editArticle);
app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});