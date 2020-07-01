//import necessary libraries to make this run & our modules
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const db = require("../models");

//serialize our user
passport.serializeUser(function(user, cb){
    cb(null, user.id);
})

//deserialized version
passport.deserializeUser(function(id, callback){
    db.user.findByPk(id).then(function(user){
        callback(null, user);
    }).catch(callback);    
})

//password local config
passport.use(new LocalStrategy({
    usernameField: "email",
    passwordField: "password"
}, function(email, password, callback) {
    db.user.findOne({where: {email}}).then(function(user){
        if (!user || !user.validPassword(password)) {
            callback(null, false);
        } else {
            callback(null, user);
        }
    }).catch(callback);
}))


//importing our database

module.exports = passport;