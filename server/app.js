const express =  require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./config/connect');
const {verifyToken} = require('./middleware/verifyToken');
const routes = require('./routes');
const port = 3000

app.use(cors());
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static('public'))

// use res.render to load up an ejs view file
routes(app);

// APIs
app.get('/api/users', db.getAllUsers);
app.get('/api/news', db.getAllArticles);
app.get('/api/categories', db.getCategories);
app.get('/api/group-categories', db.getCategoriesByGroup);
app.post('/api/new-article', db.createArticle);
app.post('/api/new-category', db.createCategory);
app.post('/api/new-user', db.createUser);
app.get('/api/news/:newsId', db.getArticle);
app.post('/api/signin', db.signinUser);
app.patch('/api/user/user-role/:userId', verifyToken, db.changeRole);
app.patch('/api/edit-article/:articleId', verifyToken, db.editArticle);
app.patch('/api/user/settings', verifyToken, db.userSettings);
app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});
