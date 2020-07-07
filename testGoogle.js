//set up app libraries
'use strict'

const express = require("express");
const multer  = require('multer')
let uploads = multer({ dest: 'uploads/' })
// // Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();



//set up our app
let router = express.Router();

router.get("/", async (req, res) => {
  try{
    // let transcription = await main().catch(console.error);
    // console.log(`🦉 The transcription I got was ${transcription}`)
    // console.log(transcription);
    //add transcription by sending object
    //object needs to be called before it will render
    let transcription = "testYYYYY";
    res.render("form", {transcription})  
  } catch(error){
    console.error(error);
  }
})

router.post("/", uploads.single("filename"),(req, res) => {
  console.log("biggbutts - post route hit");
  //get the input field from the user
  let filename = req.file.path;
  // console.log(file);
  let transcription = "testyYY";
  const bucketName = 'voiceappbucket';
  async function uploadFile() {
    // Uploads a local file to the bucket
    await storage.bucket(bucketName).upload(filename, {
      // Support for HTTP requests made with `Accept-Encoding: gzip`
      gzip: true,
      metadata: {
        cacheControl: 'public, max-age=31536000',
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
    const gcsUri = `gs://voiceappbucket/Record-_online-voice-recorder.com_.flac`;
    const encoding = 'FLAC';
    const sampleRateHertz = 48000;
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
    console.log(response);
    const transcription = response.results.map(result => result.alternatives[0].transcript)
    .join('\n');
    console.log(`Transcription: ${transcription}`);
    res.render("results", {transcription})
  }
  main().catch(console.error);
})


// /**********
//  * Test Call to Transcribe Short Audio Files
//  */
// async function main() {
//   // Imports the Google Cloud client library
//   const speech = require('@google-cloud/speech');
//   const fs = require('fs');
//   const record = require('node-record-lpcm16');


//   // Creates a client
//   const client = new speech.SpeechClient();

//   // The name of the audio file to transcribe
//   const fileName = 'Record-_online-voice-recorder.com_.flac';

//   // Reads a local audio file and converts it to base64
//   const file = fs.readFileSync(fileName);
//   const audioBytes = file.toString('base64');

//   // The audio file's encoding, sample rate in hertz, and BCP-47 language code
//   const audio = {
//     content: audioBytes,
//   };
//   const config = {
//     encoding: 'FLAC',
//     sampleRateHertz: 48000,
//     languageCode: 'en-US',
//   };

//   const request = {
//     audio: audio,
//     config: config,
//   };


// //set up our app to listen
// app.listen(3001, () => {
//     "We are listening!"
//   })

// /*******
//  * Where do we store files?
//BUCKETS WORK NOW FOR ME, AT LEAST




module.exports = router;