//set up app libraries
'use strict'

const express = require("express");
const multer  = require('multer')
const path = require("path")
const mm = require('music-metadata');



//set the destination of the form uploads to disk storage
let mStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads")
  },
  filename: function (req, file, cb) {
    //set the extension to the original extension from form input
    cb(null, file.fieldname + "butts" + Date.now() + path.extname(file.originalname));
    // cb(null, file.buffer)
  }
})

//initialize the upload variable
let uploads = multer({storage: mStorage})

//Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();


//set up our app
let router = express.Router();

//all the cute views
router.get("/home", (req, res) => {
    res.render("project/home");  
})

router.get("/uploadaudio", (req, res) => {
  res.render("project/form");
})

router.get("/transcriptions", (req, res) => {
  res.render("project/all");
})

router.get("/dictation", (req, res) => {
  res.render("project/dictate");
})

router.post("/results", uploads.single("filename"),(req, res) => {
  console.log("post route hit");
  //get the input field from the user
  // console.log(req.file);
  let filename = req.file.filename;
  console.log(filename);
  const bucketName = 'voiceappbucket';
  async function uploadFile() {
    // Uploads a local file to the bucket
  await storage.bucket(bucketName).upload(`./uploads/${filename}`, {
    gzip: true,
    metadata: {
      content_type : "audio/flac",
      originalMimeType: "audio/flac",
      cacheControl: 'public, max-age=31536000',
      uploadType: "multipart"      
    },
  });
  console.log(`${filename} uploaded to ${bucketName}.`);
  res.redirect(`/${req.file.filename}`)
  }
  uploadFile().catch(console.error);
})

router.get("/:file", (req, res) => {
  async function main() {
    // Imports the Google Cloud client library
    const gcsUri = `gs://voiceappbucket/${req.params.file}`;
    const encoding = 'FLAC';
    const sampleRateHertz = 16000;
    const languageCode = 'en-US';
  
    const config = {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode,
    };
  
    const audio = {
      uri: gcsUri,
    };
    
    const request = {
      config: config,
      audio: audio,
    };

    // Detects speech in the audio file
    const [operation] = await client.longRunningRecognize(request)
    const [response] = await operation.promise()
    // console.log("🌽 This is our response:", response);
    const transcription = response.results.map(result => result.alternatives[0].transcript)
    .join('\n');
    console.log(`Transcription: ${transcription}`);
    //  //what I am thinking for adding a transcription to the database
    //  let transcribed = transcription;
    //  db.transcription.findOrCreate({
    //    where: {content : transcribed}
    //  }).then(([transcription, created]) => {
    //    console.log(`Your transcription has been added to the database!`);
    //    res.redirect("/transcriptions")
    //  })
    res.render("project/results", {transcription})

     
  }
  main().catch(console.error);
})


// /*******Displaying Individual Transcriptions*****/
// router.get("/:title", (req, res) => {
//   db.transcription.findOne({
//     where: { id: req.params.id }
//   }).then((transcription) => {
//     if (!transcription) throw Error()
//     res.render("show", { transcription : transcribed})
//   })
//   .catch((error) => {
//     console.log(error)
//   })
// })

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

// //deleting a transcription
// router.delete("/:id", (req, res) => {
//   db.transcription.destroy({
//     where: {id : req.params.id}
//   }).then(function(){
//     res.redirect("/transcriptions")
//   })
// })

//deleting a note LMAO HOW

/**********Web Speech API Calls******/


module.exports = router;

