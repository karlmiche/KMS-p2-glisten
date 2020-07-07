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

// router.get("/", async (req, res) => {
//   try{
//     // let transcription = await main().catch(console.error);
//     // console.log(`🦉 The transcription I got was ${transcription}`)
//     // console.log(transcription);
//     //add transcription by sending object
//     //object needs to be called before it will render
//     let transcription = "testYYYYY";
//     res.render("form", {transcription})  
//   } catch(error){
//     console.error(error);
//   }
// })

router.post("/results", uploads.single("filename"),(req, res) => {
  console.log("post route hit");
  //get the input field from the user
  let filename = req.file.path;
  const bucketName = 'voiceappbucket';
  async function uploadFile() {
    // Uploads a local file to the bucket
  await storage.bucket(bucketName).upload(filename, {
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
    const gcsUri = `gs://voiceappbucket/${filename}`;
    const encoding = 'MP3';
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

       //what I am thinking for adding a transcription to the database
       let transcribed = transcription;
       db.transcription.findOrCreate({
         where: {content : transcribed}
       }).then(([transcription, created]) => {
         console.log(`Your transcription has been added to the database!`);
         res.redirect("/transcriptions")
       })
  }
  main().catch(console.error);
})


/*******Displaying Individual Transcriptions*****/
router.get("/:title", (req, res) => {
  db.transcription.findOne({
    where: { id: req.params.id }
  }).then((transcription) => {
    if (!transcription) throw Error()
    res.render("show", { transcription : transcribed})
  })
  .catch((error) => {
    console.log(error)
  })
})

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

//deleting a transcription
router.delete("/:id", (req, res) => {
  db.transcription.destroy({
    where: {id : req.params.id}
  }).then(function(){
    res.redirect("/transcriptions")
  })
})

//deleting a note LMAO HOW


//calling the natural language API??


module.exports = router;

