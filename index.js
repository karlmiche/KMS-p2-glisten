//set up app libraries
'use strict'

const express = require("express");
const ejsLayouts = require('express-ejs-layouts');
const multer  = require('multer');
// const flash = require("flash");
const flash =require ("connect-flash");



//set up our app
let app = express()

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(ejsLayouts)
app.use(express.static(__dirname + '/public/'))
app.use(flash());

//set up our controllers
app.use("/transcribe", require("./controllers/transcribe"))
app.use("/auth", require("./controllers/auth"))

//all the cute views
app.get("/home", (req, res) => {
  res.render("project/home");  
})

app.get("/uploadaudio", (req, res) => {
res.render("project/form");
})

app.get("/transcriptions", (req, res) => {
res.render("project/all");
})

app.get("/dictation", (req, res) => {
res.render("project/dictate");
})

//set up our app to listen
app.listen(3001, () => {
    "We are listening!"
  })