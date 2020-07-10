//set up app libraries
'use strict'

require("dotenv").config();
const express = require('express');
const ejsLayouts = require("express-ejs-layouts");
const helmet = require('helmet');
const session = require("express-session");
const flash = require("connect-flash");
const passport = require('./config/ppConfig');
const db = require('./models');
const isLoggedIn = require('./middleware/isLoggedIn');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const methodOverride = require('method-override')



//set up our app
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public/'));
app.use(methodOverride("_method"));
app.set('view engine', 'ejs')
app.use(ejsLayouts);
app.use(flash());
app.use(require('morgan')('dev'));
app.use(helmet());

// create new instance of class Sequelize Store
const sessionStore = new SequelizeStore({
  db: db.sequelize,
  expiration: 1000 * 60 * 30
})

app.use(session({
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: true
}))

sessionStore.sync();

// initialize passport and session info
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function(req, res, next) {
  res.locals.alerts  = req.flash();
  res.locals.currentUser = req.user;

  next();
});

//set up our controllers
app.use("/transcribe", require("./controllers/transcribe"));
app.use("/auth", require("./controllers/auth"));
app.use("/display", require("./controllers/display"));

//ROUTES
app.get('/', function(req, res) {
  // check to see if user logged in
  res.render('index');
})

app.get('/profile', isLoggedIn, function(req, res) {
  res.render('profile');
})

app.get("/home", (req, res) => {
  res.render("project/home");  
})

app.get("/uploadaudio", (req, res) => {
res.render("project/form");
})

// app.get("/transcriptions", (req, res) => {
// res.render("project/all");
// })

app.get("/dictation", (req, res) => {
res.render("project/dictate");
})

//set up our app to listen
app.listen(process.env.PORT || 3000, () => {
    "We are listening!"
  })