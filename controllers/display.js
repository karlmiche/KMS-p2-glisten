//set up app libraries
'use strict'
const express = require("express");
const multer  = require('multer')
const path = require("path")
const mm = require('music-metadata');
const db = require('../models');
const isLoggedIn = require("../middleware/isLoggedIn");

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
      where: { id: req.params.id },
      include: [db.note]
    }).then((transcription) => {
      if (!transcription) throw Error()
      res.render("project/show", { transcription : transcription})
    })
    .catch((error) => {console.log(error)
    })
  })
  
  //deleting a transcription
  router.delete("/:id", (req, res) => {
    db.transcription.destroy({
      where: {id : req.params.id}
    }).then(function(){
      console.log("Your transcription was removed from the database. 💾")
      res.redirect("/display/transcriptions")
    }).catch(error => {console.log("😭", error)})
  })
  
  
/********Note Routes********/
//adding a note to a transcription
router.post("/:id/notes", isLoggedIn, (req, res) => {
  db.note.create({
    transcriptionId: req.params.id,
    userId: req.user.id,
    content: req.body.content,
    title: req.body.title
    })
  .then(note => {
    console.log(`Your note was added to this transcription ⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️`);
    // 3. moved redirect into database promise
    res.redirect(`/display/transcriptions/${req.params.id}`)
    })
    // 4. supplied catch with arrow function that has an argument of error
    .catch(error => console.log("😭😭😭😭😭😭😭😭", error));
})

//editing notes
router.put(`/:id/notes`, isLoggedIn, (req, res) => {
  db.note.update({
    where: {
      title: title
    }
  })
  .then(note => {
    console.log(`Your note was successfully updated! 🎺🎺🎺🎺🎺🎺🎺`);
    res.redirect(`/display/transcriptions/:id`)
  })
  .catch(error => console.log("☄️☄️☄️☄️☄️☄️", error));
})
  

//deleting notes from a transcription
router.delete(":/id/notes", isLoggedIn, (req, res) => {
  db.note.destroy({
    where: {
      id: req.params.id
    }
  })
  .then(note => {
    console.log(`Your note was destroyed! 🌪🌪🌪🌪🌪`);
    res.redirect(`/display/transcriptions/${req.params.id}`);
  })
  .catch(error => console.log("👁‍🗨👁‍🗨👁‍🗨👁‍🗨👁‍🗨👁‍🗨👁‍🗨👁‍🗨", error))
})

module.exports = router;