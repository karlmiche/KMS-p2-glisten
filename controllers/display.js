//set up app libraries
'use strict'
const express = require("express");
const multer  = require('multer')
const path = require("path")
const mm = require('music-metadata');
const db = require('../models');

//set up our app
let router = express.Router();


/********All Transcriptions*******/
router.get("/transcriptions", (req, res) => {
    db.transcription.findAll().then(function(transcription) {
      res.render("all", {transcription : transcription})
    })
  })
  
  // /*******Displaying Individual Transcriptions*****/
  // router.get("/:title", (req, res) => {
  //   db.transcription.findOne({
  //     where: { id: req.params.id }
  //   }).then((transcription) => {
  //     if (!transcription) throw Error()
  //     res.render("show", { transcription : transcription})
  //   })
  //   .catch((error) => {
  //     console.log(error)
  //   })
  // })
  
  // //deleting a transcription
  // router.delete("/:id", (req, res) => {
  //   db.transcription.destroy({
  //     where: {id : req.params.id}
  //   }).then(function(){
  //     res.redirect("/transcriptions")
  //   })
  // })
  
  
  /********Adding Notes to a Transcription********/
  // //adding a note to a transcription
  // router.post("/:id/notes", (req, res) => {
  //   let id = req.params.id
  //   db.note.create({
  //     name: req.body.name,
  //     content: req.body.content
  //   })
  //   .then(comment => {
  //     res.redirect(`/transcriptions/${req.params.id}`)
  //   })
  // })
  
  module.exports = router;