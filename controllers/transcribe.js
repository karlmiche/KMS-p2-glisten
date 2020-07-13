//set up app libraries
'use strict'
const express = require("express");
const multer  = require('multer')
const path = require("path")
const mm = require('music-metadata');
const db = require('../models');
const isLoggedIn = require("../middleware/isLoggedIn");


//set the destination of the form uploads on "uploadaudio" to disk storage
let mStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads")
  },
  filename: function (req, file, cb) {
    //set the extension to the original extension from form input
    cb(null, file.fieldname + "file" + Date.now() + path.extname(file.originalname));
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

/********Upload a file to Google Buckets********/
router.post("/results", uploads.single("filename"),(req, res) => {
  console.log("post route hit");
  //get the input field from the user
  let filename = req.file.filename;
  console.log(filename);
  const bucketName = 'voiceappbucket';
  async function uploadFile() {
    // Uploads a local file to the bucket
  await storage.bucket(bucketName).upload(`./uploads/${filename}`, {
    //gzip NEEDS to be set to false or else your audio cannot be transcribed.
    gzip: false,
    metadata: {
      content_type : "audio/flac",
      originalMimeType: "audio/flac",
      cacheControl: 'public, max-age=31536000',
      uploadType: "multipart"      
    },
  });
  console.log(`${filename} uploaded to ${bucketName}.`);
  res.redirect(`/transcribe/${req.file.filename}`)
  }
  uploadFile().catch(console.error);
})

/********Select File from Google Bucket, then Transcribe It**********/
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
    const transcription = response.results.map(result => result.alternatives[0].transcript)
    .join('\n');
    console.log(`Transcription: ${transcription}`);
    //add a transcription to our database for a specific user
    let userId = req.user.id;
    //find that user in the database
    db.user.findOne({ where : {id: userId} })
    //use sequelize proprietary association functionality
    .then( user => {
      //for that user, create a transcription where:
      user.createTranscription({
        //the content is what we just grabbed
        content: transcription
    })
    //then to handle this with a redirect to all.ejs
    .then( (transcription) => {
      console.log(`Your trancscription has been added to the database! 🗒`)
    })
      res.redirect("/display/transcriptions")
    })
  }
  main().catch(console.error);
})

/******Web Speech API Post Route*******/
router.post("/dictation", isLoggedIn, (req, res) => {
  let transcription = req.body.dictateResults;
  let userId = req.user.dataValues.id;
  db.user.findOne({ where: { id: userId} })
    // 1. supplied an arrow function with an argument of the user that was found
    .then( user => {
    // 2. used create with association method 
      user.createTranscription({
        content: transcription
    })
    .then( (transcription) => {
        console.log(`Your trancscription has been added to the database! 🗒`);
        // 3. moved redirect into database promise
        res.redirect("/display/transcriptions")
    })
    // 4. supplied catch with arrow function that has an argument of error
    .catch(error => console.log(error))
  })
})


module.exports = router;



