var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");
var router = express();

// Require all models
var db = require("../models");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;



//renders the index.handlebars page
router.get("/", function(req, res) {
  res.render("index");
});


//SCRAPE
router.post("/scrape", function(req, res) {

  // First, we grab the body of the html with request
  axios.get("https://www.nytimes.com/section/food").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    // Make emptry array for temporarily saving and showing scraped Articles.
    var scrapedArticles = {};

    $("div.story-body").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(element).find('h2.headline').text().trim();

      result.summary=$(element).find('p.summary').text().trim();

      console.log("What's the result title? " + result.title);

      result.link=$(element).find('a').attr('href').trim();

      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });

      // result.link = $(this).children("a").attr("href");

      scrapedArticles[i] = result;

    });

    console.log("Scraped Articles object built nicely: " + scrapedArticles);

    var hbsArticleObject = {
        articles: scrapedArticles
    };

    res.render("index", hbsArticleObject);

  });
});

//SAVE ARTICLES TO DB
router.get("/", (req, res) => {
  db.Article.find({})
    .then(dbArticle => {
      res.json(dbArticle)
    })
    .catch(err => res.json(err))
})

//view saved ARTICLES
router.get('/savedarticles', (req,res) => {
  db.Article
    .find({})
    .then(articles => res.render('savedarticles', {articles}))
    .catch(err=> res.json(err));
});
///////////////////////////////////////
///////////////////////////////////////
//ADD NOTES

router.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// / Route for saving/updating an Article's associated Note
router.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

module.exports=router;
