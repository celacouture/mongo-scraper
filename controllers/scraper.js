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

//grabs the saved articles

router.get("/savedarticles", function(req, res) {

  // Grab every doc in the Articles array
  db.Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      var hbsArticleObject = {
        articles: doc
      };

      res.render("savedarticles", hbsArticleObject);
    }
  });
});
//gets and post the articles scraped from the nytimes food section
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

router.post("/save", function(req, res) {

  console.log("This is the title: " + req.body.title);

  var newArticleObject = {};

  newArticleObject.title = req.body.title;
  newArticleObject.summary = req.body.summary;
  newArticleObject.link = req.body.link;

  var entry = new Article(newArticleObject);

  console.log("We can save the article: " + entry);

  // Now, save that entry to the db
  entry.save(function(err, doc) {
    // Log any errors
    if (err) {
      console.log(err);
    }
    // Or log the doc
    else {
      console.log(doc);
    }
  });

  res.redirect("/savedarticles");

});

router.get("/delete/:id", function(req, res) {

  console.log("ID is getting read for delete" + req.params.id);

  console.log("Able to activate delete function.");

  Article.findOneAndRemove({"_id": req.params.id}, function (err, offer) {
    if (err) {
      console.log("Not able to delete:" + err);
    } else {
      console.log("Able to delete, Yay");
    }
    res.redirect("/savedarticles");
  });
});

module.exports=router;
