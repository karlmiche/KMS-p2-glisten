//set up app libraries
'use strict'

const express = require("express");
const ejsLayouts = require('express-ejs-layouts')
const multer  = require('multer')

//set up our app
let app = express()

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(ejsLayouts)
app.use(express.static(__dirname + '/public/'))

// app.get("/", (req, res) => {
//   res.render("testCall");
// })

app.use("/", require("./testGoogle"))
/********
 * Test Call for Streaming Audio/Speaking Straight into the Microphone
 */
// app.get("/", function(req, res) {
//   const recorder = require('node-record-lpcm16');
//   const fs = require('fs');
//   // Imports the Google Cloud client library
//   const speech = require('@google-cloud/speech');
//   // Creates a client
//   const client = new speech.SpeechClient();
//   const encoding = 'LINEAR16';
//   const sampleRateHertz = 16000;
//   const languageCode = 'en-US';

// 'use strict'

//   //setting up our request
//   const request = {
//     config: {
//       encoding: encoding,
//       sampleRateHertz: sampleRateHertz,
//       languageCode: languageCode,
//     },
//     // single_utterance: true,
//     interimResults: true,
//   };
// // Create a recognize stream
//   // Start recording and send the microphone input to the Speech API
//   //declaring variable in scope of the function
//   const recognizeStream = client
//   .streamingRecognize(request)
//   .on('error', console.error) 
//   .on('data', data => {
//     process.stdout.write(
//       data.results[0] && data.results[0].alternatives[0]
//         ? console.log(`Transcription: ${data.results[0].alternatives[0].transcript}\n`)
//         : `\n\nReached transcription time limit, press Ctrl+C\n`
//     )
//     });

//   recorder
//   .record({
//       sampleRateHertz: sampleRateHertz,
//       threshold: 0,
//       verbose: false,
//       recordProgram: 'sox', // Try also "arecord" or "sox"
//       silence: '10.0',
//     })
//   .stream()
//   .on('error', console.error)
//   .pipe(recognizeStream);
//     console.log("hello!!");
//     console.log('Listening, press Ctrl+C to stop.');
//     console.log()


//   res.render("testCall")
// })


//set up our app to listen
app.listen(3001, () => {
    "We are listening!"
  })