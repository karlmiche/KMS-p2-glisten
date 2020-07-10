//set up app libraries
'use strict'
const express = require("express");
const multer  = require('multer')
const path = require("path")
const mm = require('music-metadata');
const db = require('../models');

//set the destination of the form uploads on "uploadaudio" to disk storage
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
    //add a transcription to our database; how do we do this for a specific user?
     db.transcription.create({
       content : transcription
     }).then((transcription) => {
       console.log(`Your transcription has been added to the database!`);
     })
    res.render("project/results", {transcription})     
  }
  main().catch(console.error);
})

/******Web Speech API Post Route*******/
router.post("/dictation", (req, res) => {
  let transcription = req.body.dictateResults;
  db.transcription.create({
    content : transcription
  }).then((transcription) => {
      console.log(`Your transcription has been added to the database!`);
  }).catch(console.error)
  res.redirect("/display/transcriptions")
})

module.exports = router;

