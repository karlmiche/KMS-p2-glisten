//Required NPM libraries
require("dotenv").config();
const Express = require("express");
const ejsLayouts = require("express-ejs-layouts");
const helmet = require("helmet");
const session = require("express-session");
const flash = (require("flash"));
const passport = require("./config/ppConfig");
const db = require("./models");
const isLoggedIn = require("./middleware/isLoggedIn");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

//App setup
const app = Express();
app.use(Express.urlencoded({ extended: false}));
app.use(Express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(ejsLayouts);
app.use(require("morgan")("dev"));
app.use(helmet());

//create new instance of class SequelizeStore
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

//TODO: initialize and link flash messages and passport and session
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function(req, res, next){
    res.locals.alert = req.flash();
    res.locals.currentUser = req.user;
    //find the next route that was supposed to be called
    next();
});



//Routes
app.get("/", function(req, res) {
    //longterm check to see if user is logged in
    res.render("index");
})

app.get("/profile", isLoggedIn, function(req, res) {
    res.render("profile", {test: "another test"});
})

//include auth controller 
app.use("/auth", require("./controllers/auth"));

//initialize app on port
app.listen(process.env.PORT || 3000, function() {
    console.log(`Listening to the smooth, sweet sounds of port ${process.env.PORT} in the morning! 🥞`)
});