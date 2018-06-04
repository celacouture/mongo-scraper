//dependencies
const express=require('express');
const handlebars=require('express-handlebars');
// const mongoose=require('mongoose');
const mongojs=require('mongojs');
const cheerio=require('cheerio');
const bodyParser=require('body-parser');
const request=require('request');
const path=require('path');

//initialize express

var app=express();

//database configuration
let databaseURL='scraper';
let collections=['scrapedData'];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

app.get('/', function(req, res){
  res.send('hello world');
})

//retrieve data from the db

app.get("/all", function(req, res) {
  // Find all results from the scrapedData collection in the db
  db.scrapedData.find({}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.json(found);
    }
  });
});

//scrape data from nytimes and place it into mongo database
app.get('/scrape', function(req, res){
  request("https://www.nytimes.com/section/food", function(error, response, html){
    var $=cheerio.load(html);

    $('h2.headline').each(function(i, element){
      var 
    })
  })
})


app.listen(7000, function(){
  console.log('Server Started on Port 7000');
})
