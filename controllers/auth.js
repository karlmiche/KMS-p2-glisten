const express = require("express");
const router = express.Router();
const db = require("../models");
const flash = require("flash");
const passport = require("../config/ppConfig");

//register get route
router.get("/register", function(req, res) {
    res.render("auth/register");
})

//register post route
router.post("/register", function(req, res) {
    db.user.findOrCreate({
        where: {
            email: req.body.email
        }, defaults: {
            name: req.body.name,
            password: req.body.password
        }
    }).then(function(user, created) {
        //if user was created
        if (created){
            //authenticate user and start authorization process
            console.log("User created 🥥");
            passport.authenticate("local", {
                successRedirect: "/",
                successFlash: "Thanks for signing up!"
            })(req, res);
            res.redirect("/"); 
        } else {
            console.log("User email already exists. 🏴‍☠️");
            req.flash("error", "Error: email already exists for user. Try again.");
            res.redirect("/auth/register");
        }
    }).catch(function(error){
        console.log(`Error found. \nMessage: ${error.message}. Please review - ${error}`);
        req.flash("error", error.message);
        res.redirect("auth/register");
    })
})

//login get route
router.get("/login", function(req, res) {
    res.render("auth/login")
})

//login post route
router.post("/login", function(req, res, next){
    passport.authenticate("local", function(error, user, info){
        //if no user authenticated
        if (!user) {
            req.flash("error", "Invalid username or password");
                return res.redirect("/auth/login");
            }
        if (error) {
            return next(error);
        }
        req.login(user, function(error){
            if (error) next(error);
            //if success, flash success message
            req.flash("success", "You are validated and logged in.");
            //if success save session and redirect user
            req.session.save(function(){
                return res.redirect("/profile");
            })
        })
    })(req, res, next);
});

router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/")
})

//export router
module.exports = router;