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
  app.get('/api/news', db.getArticles);
  app.post('/api/new-article', db.createArticle);
  app.post('/api/new-user', db.createUser);
  app.post('/api/signin', db.signinUser);
  app.patch('/api/user/:userId', verifyToken, db.changeRole);
  app.listen(port, () => {
    console.log(`App running on port ${port}.`)
  })