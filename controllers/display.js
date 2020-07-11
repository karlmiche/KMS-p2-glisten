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
    db.transcription.findAll({
      where: {
        userId : req.user.id
      }
    }).then(function(transcriptions) {
      res.render("project/all", {transcriptions})
    }).catch(error => console.log(error));
  })
  
  /*******Displaying Individual Transcriptions*****/
  router.get("/transcriptions/:id", (req, res) => {
    db.transcription.findOne({
      where: { id: req.params.id }
    }).then((transcription) => {
      if (!transcription) throw Error()
      res.render("project/show", { transcription : transcription})
    })
    .catch((error) => {
      console.log(error)
    })
  })
  
  //deleting a transcription
  router.delete("/:id", (req, res) => {
    db.transcription.destroy({
      where: {id : req.params.id}
    }).then(function(){
      console.log("Your transcription was removed from the database. 💾")
      res.redirect("/display/transcriptions")
    })
  })
  
  
  /********Adding Notes to a Transcription********/
  //adding a note to a transcription
  router.post("/:id/notes", (req, res) => {
    let id = req.params.id
    db.note.create({
      name: req.body.name,
      content: req.body.content
    })
    .then(comment => {
      res.redirect(`/transcriptions/${req.params.id}`)
    })
  })

  //editing notes

  //deleting notes from a transcription

  //wes's suggested debug
//   db.user.findAll().then( users => {
//     users.forEach( user => {
//       user.getTranscriptions().then( transcriptions => {
//         transcriptions.forEach( transcription => {
//           console.log(transcription.content);
//         })
//       })
//       .catch( error => {
//         console.log('user.getTranscriptions', error);
//       })
//     })
//   })
//   .catch( error => {
//     console.log('db.user.findAll', error);
//   })

  module.exports = router;