//dependencies
const express=require('express');
const exphbs=require('express-handlebars');
const mongoose=require('mongoose');
// const mongojs=require('mongojs');

const cheerio=require('cheerio');
const bodyParser=require('body-parser');
const request=require('request');
const path=require('path');
const axios=require('axios');
const logger=require('morgan');

let Note = require("./models/Note.js");
let Article = require("./models/Article.js");

//initialize express
// let db=require("./models");

var PORT=process.env.PORT || 7000;
var app=express();

//database configuration
// let databaseURL='scraper';
// let collections=['scrapedData'];

// Hook mongojs configuration to the db variable
// var db = mongojs(databaseUrl, collections);
// db.on("error", function(error) {
//   console.log("Database Error:", error);
// });
app.use(logger("dev"));
//setting up body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//setting up handlebars middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//setting up the static directory
app.use(express.static('public'));
// app.get('/', function(req, res){
//   res.render('index');
// })
//
// //retrieve data from the db
//
// app.get("/all", function(req, res) {
//   // Find all results from the scrapedData collection in the db
//   db.scrapedData.find({}, function(error, found) {
//     // Throw any errors to the console
//     if (error) {
//       console.log(error);
//     }
//     // If there are no errors, send the data to the browser as json
//     else {
//       res.json(found);
//     }
//   });
// });
//
// //scrape data from nytimes and place it into mongo database
// app.get('/scrape', function(req, res){
//   request("https://www.nytimes.com/section/food", function(error, response, html){
//     var $=cheerio.load(html);
//
//     $('h2.headline').each(function(i, element){
//       var
//     })
//   })
// })

// Import routes and give the server access to them.
var routes = require("./controllers/scraper.js");


app.use("/", routes);
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);
// mongoose.connect("mongodb://localhost/mongo-scraper");
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

app.listen(PORT, function(){
  console.log('Server Started on Port 7000');
})
