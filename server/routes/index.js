'use strict';

const db = require('../config/connect');

module.exports = function(app) {
    app.get('/', async (req, res) => {
        try {
          const news = await db.getNews();
          console.log(news);
          res.render('pages/index', { data: news, error: null });
        } catch (error) {
          console.log(error);
          res.render('pages/index', { data: null, error });
        }
        
        
        // res.render('pages/index');
      });
      app.get('/tv', (req, res) => {
        res.render('pages/tvShow');
      });
      app.get('/radio', (req, res) => {
        res.render('pages/selected-radio');
      });
      app.get('/music', (req, res) => {
        res.render('pages/music');
      });
      app.get('/contact', (req, res) => {
        res.render('pages/contactus');
      });
      app.get('/about', (req, res) => {
        res.render('pages/aboutus');
      });
};