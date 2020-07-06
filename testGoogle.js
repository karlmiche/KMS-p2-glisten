//set up app libraries
'use strict'

const express = require("express");
const multer  = require('multer')
let uploads = multer({ dest: 'uploads/' })
// // Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();



//set up our app
let router = express.Router();


/*********
 * Test Call for Long Audio
 */
// async function main() {
//     // Imports the Google Cloud client library
//     const speech = require('@google-cloud/speech');
  
//   //   // Creates a client
//     const client = new speech.SpeechClient();
  
//     /**
//      * TODO(developer): Uncomment the following lines before running the sample.
//      */
//     const gcsUri = `gs://voiceappbucket/${filename}`;
//     const encoding = 'FLAC';
//     const sampleRateHertz = 16000;
//     const languageCode = 'en-US';
  
//     const config = {
//       encoding: encoding,
//       sampleRateHertz: sampleRateHertz,
//       languageCode: languageCode,
//     };
  
//     const audio = {
//       uri: gcsUri,
//     };
  
//     const request = {
//       config: config,
//       audio: audio,
//     };


//THIS ONE WORKS DO NOT MESS WITH IT
// //SHORT AUDIO CALL ROUTE
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
      // By setting the option `destination`, you can change the name of the
      // object you are uploading to a bucket.
      metadata: {
        // Enable long-lived HTTP caching headers
        // Use only if the contents of the file will never change
        // (If the contents will change, use cacheControl: 'no-cache')
        cacheControl: 'public, max-age=31536000',
      },
    });
    console.log(`${filename} uploaded to ${bucketName}.`);
  }

  uploadFile().catch(console.error);
   
    //transcription is performed on my specific submitted file "filename"
    //I see the results of the transcription in the results div
    //I can save the results to my database with a save button
    //I can see the transcription in "My Transcriptions"

    res.render("form", {transcription})
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

//   // Detects speech in the audio file
//   const [response] = await client.recognize(request).catch(console.error);
//   const transcription = response.results
//     .map(result => result.alternatives[0].transcript)
//     .join('\n');
//   console.log(`Transcription: ${transcription}`);
//     return transcription;
// }
// main().catch(console.error);

// //set up our app to listen
// app.listen(3001, () => {
//     "We are listening!"
//   })

// /*******
//  * Where do we store files?
//BUCKETS WORK NOW FOR ME, AT LEAST




module.exports = router;