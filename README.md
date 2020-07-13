# glisten (good listen)
I had this project idea in my mind before beginning the cohort: several of my close friends did social research in their undergraduate theses, some even were published in academic journals! I love making my friends' lives a little bit easier, and I noticed that their research involved recording conversations with subjects for qualitative analysis. This meant hours of effortful transcription, audio replay, and qualitative markup of the transcripts. What if, there was an app that could do some of that legwork?

At the moment, this app is functional in transcribing audio as long as it is delivered to the app in the specified format.. I can transcribe up to 480 minutes of audio a month for free (please be nice to me and my Google Cloud API account)! 

As a stretch goal or post-cohort, I intend to add more API calls to this application. The second part of this app is to help people analyze the transcriptions returned to them, and access these transcriptions/the corresponding audio in a database. Analysis is meant to involve the Google Natural Language API.

Below I will detail the steps I took to make this app (with much help from General Assembly staff members Sarah King, Anna Zocher, Milcah O., Nick Quandt, and Yashoma Boodhan.) Working with audio was extremely challenging and I hope this markdown can help someone else anticipate these challenges (or figure out what I could not).

## MVP
1. A user can create an account.
2. A user can input an audio file via a form and received a transcription.
3. A user can speak directly to their browswer and receive a transcription. 
4. A user can make and edit notes for specific transcriptions. 
5. A user can delete specific transcriptions and specific notes. 
6. A user cannot access the app to make transcriptions if they are not registered and logged in. 

## Stretch Goals
1. A user's audio files and recorded audio are saved and display like album tracks on the page. This would require more work with storing audio files/BLOBs in Sequelize.
2. A user can ask the app to peform sentiment analysis on their transcriptions and receive actionable results back. This would be done by passing the content of their transcription to the Google Natural Language API.

## Tech Used
* Node.js
* Express
* SQL
* Postgres
* Sequelize
* JavaScript
* Materialize
* HTML5/CSS3
* BCrypt
* EJS
* Google Speech-to-Text API
* Google Storage
* Web Speech API
* Multer

# How To Use This App
1.) Via uploading audio. You will need to convert the audio to this format with a different website first: FLAC file formatting, 16000 kHz, and mono. 

![](https://i.imgur.com/RlA5LRL.png)

2.) Via speaking directly into your device microphone. I recommend using a Chrome browser since it is most likely to be supported.

![](https://i.imgur.com/EB8cz4v.png)

Then you can view your saved transcriptions (they are saved in a database and you must be logged in to view them.) Click on the specific transcription to view it in full.

![](https://i.imgur.com/V6tvMYE.png)

Take notes on specific transcriptions.

![](https://i.imgur.com/1ahk0PQ.png)

## Wireframes

I had planned for the interface of this app to be pretty simple, and it turned out to work with pretty minimal styling.

![](https://i.imgur.com/ud6dmgc.jpg)

I wanted audio to be stored in HTML5 audio tags, which display as small audio players on the page, but this will have to be an adjustment made after cohort (I have a lot I'd like to fix up post cohort). 

![](https://i.imgur.com/fVJSXzU.jpg)

## Planning Routes

I ended with no analyses routes, but different routes than I planned for. I will be adding in Natural Language Analysis post cohort.

| CRUD | ROUTE | FUNCTIONALITY |
| ---- | ----- | ------------- |
| GET     | /register      | User is directed to a page where they can sign up for an account. Otherwise, they are given links to the register page.
POST   |/register|If a user has not yet been added to the user database, we call findOrCreate with Sequelize to create a new user. If a user already exists, they redirected to the login page.
| GET  | /login   | This renders a form to login.                                                                                                                      |    -- | --- | --- |
| GET  | /logout  | This route logs the user out.                                                                                                                      |     |     |     |
| POST | /results | This route uploads a file to Google Storage with RESTful routing. This route automatically triggers the next route.                                |     |         |          |                                                                                                                                                    |     |     |     |
| GET  | /:file   | This route selects a specific file to transcribe for the Google Speech-to-Text API. The transcription is also automatically saved to the database. |     |     |     |
|POST|/dictation|This route grabs the input from the script on the "dictate.ejs" page.|
|GET| /transcriptions| This route shows the user all of their specific transcriptions.
|GET|/transcriptions/:id|This shows the user the specific transcription they requested to view. This route also shows all associated notes.
|DELETE|/:id|This removes a specific transcription from the user's total transcriptions.|
|POST | /:id/notes| This route allows the user to post a note on their transcription if they want to mess around with the content. I had thought of this feature for people who are listening to someone talk and want to take notes afterwards.
|DELETE|/transcriptions/id:/:noteId|This route deletes a specific note on a specific transcriptions.

## The API Calls and Using Google Speech to Text

Making the API calls was the most difficult part of getting this app. I spent four or five days testing different APIs and attempting to get audio transcription to work. Sarah King gave me an immense amount of patient help! I brought my API calls to post-class Zoom rooms to pick other students' brains and crowdsource fixes I hadn't yet thought of. If I can make this READme clear, I hope it will save someone else the pain of working with some of these APIs. 

#### The IBM Speech to Text API 😭
I don't recommend digging too deep into the IBM speech-to-text API if you are new to audio and software development. The Google API documentation was challenging, but not as challenging as IBM's.

I attempted to perform streaming recognition through IBM and Google, server-side, but ultimately the Web Speech API and a combination of server and client was the easiest for this process. I will go more into detail on this later.

## Handling Files With Multer 💾

Also, I quickly learned I needed Multer to handle the form submission. Multer acts as an intermediary between the form submission and the file upload to Google Storage, so the Speech-to-Text API has a file to look for in GS.

* Multer in Action: 
![](https://i.imgur.com/geXDHRl.png)


### Getting Metadata Right/Encoding

By Wednesday of project week, I still did not have the ability to transcribe audio files that were saved to my Uploads folder with Multer. First, the issue was that a binary file was getting uploaded to Multer's "waiting room", not an audio file. After talking with Yosh and Sarah and doing some research I learned this would fix part of that problem for me: 

``` //set the extension to the original extension from form input
    cb(null, file.fieldname + "file" + Date.now() + path.extname(file.originalname));
```
After that, I noticed files were named in my Google Storage bucket as "x-flac" when I had uploaded them as FLAC files. They also couldn't be transcribed with any accuracy.

Sarah suggested setting `gzip:false`, which fixed the encoding to the point **where uploaded audio files could be accurately transcribed.** This encoding setting is NOT automatically given in the Google Speech-to-Text API documentation samples for Node.js; you WILL have to fiddle with the metadata header when working with audio files.

Encoding resources:
* https://en.wikipedia.org/wiki/Gzip
* https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding

![](https://i.imgur.com/rSyUHZS.png)

## Handling Files With Google Storage
An important component of my tech stack for transcribing long audio is Google Storage, which can be RESTfully queried. I think GS caused a lot of pain with the encoding and content-type issues. 

### Google Buckets 🧺

You must create a "bucket", which is a place for your files to live. Google calls them `objects`. Below is a good example of a file that stayed in binary and could not be transcribed. I also had to set permissions to the bucket to "All Users," so I believe objects in the bucket can only be deleted on the client side from a RESTful route. 

![](https://i.imgur.com/6wIt4pR.png)

## Making Models

This is the first draft of my ERD, and `Analyses` is not currently applicable to this project. 

![](https://i.imgur.com/pT2oeii.png)

This was my second draft of my ERD and is currently applicable to this project. 
![](https://i.imgur.com/FSE6NeA.png)


### Transcriptions ⌨️
#### Adding Transcriptions to the Database

Transcriptions occur in this app in two ways: 

1. A server-side route that selects the file from Google Storage and queries the Google Speech-to-Text API:

![](https://i.imgur.com/19KUVA7.png)

2. A combination of a div html tag, a <script></script> tag in an EJS page, and a route to gather the appended div into the same transcriptions database.

The script in the EJS page: 

![](https://i.imgur.com/IZbJNPt.png)

I used this resource for in-browser recognition: 

https://www.twilio.com/blog/speech-recognition-browser-web-speech-api

The database call:

![](https://i.imgur.com/nu5OFdQ.png)

## Styling

Styling was accomplished with Materialize, which I had been using in a couple homeworks prior to become more familiar with its utilities. My favorite thing about Materialize is that if you place something in a `div class="container"`, that will be centered on your page and will be responsive on mobile! I think it is cuter than Bootstrap, but I plan to learn both.

## Sources Used
- [https://www.twilio.com/blog/speech-recognition-browser-web-speech-api](https://www.twilio.com/blog/speech-recognition-browser-web-speech-api)
- [https://github.com/googleapis/nodejs-speech/tree/master/samples](https://github.com/googleapis/nodejs-speech/tree/master/samples)
*  Conversations with Yashoma Boodhan about the API functionality
* [https://cloud.google.com/speech-to-text/docs/streaming-recognize#speech-streaming-mic-recognize-nodejs](https://cloud.google.com/speech-to-text/docs/streaming-recognize#speech-streaming-mic-recognize-nodejs)
* - [https://www.twilio.com/blog/speech-recognition-browser-web-speech-api](https://www.twilio.com/blog/speech-recognition-browser-web-speech-api)
- [https://github.com/googleapis/nodejs-speech/tree/master/samples](https://github.com/googleapis/nodejs-speech/tree/master/samples)
- Conversations with Yashoma Boodhan about the API functionality
* Streaming Recognition (I ultimately went with Web Speech API for this)
    * https://wicg.github.io/speech-api/
    * [https://cloud.google.com/speech-to-text/docs/streaming-recognize#speech-streaming-mic-recognize-nodejs](https://cloud.google.com/speech-to-text/docs/streaming-recognize#speech-streaming-mic-recognize-nodejs)
* Google Speech-to-Text API Documentation (and resources)
            -[https://cloud.google.com/speech-to-text/docs/quickstart-client-libraries?hl=en_US](https://cloud.google.com/speech-to-text/docs/quickstart-client-libraries?hl=en_US)
            - Long audio requests: [https://towardsdatascience.com/how-to-use-google-speech-to-text-api-to-transcribe-long-audio-files-1c886f4eb3e9](https://towardsdatascience.com/how-to-use-google-speech-to-text-api-to-transcribe-long-audio-files-1c886f4eb3e9)
            - Streaming requests: [https://cloud.google.com/speech-to-text/docs/streaming-recognize](https://cloud.google.com/speech-to-text/docs/streaming-recognize)
            - [https://medium.com/kmakes/how-i-made-an-app-to-recognize-speech-c65c4be666fa](https://medium.com/kmakes/how-i-made-an-app-to-recognize-speech-c65c4be666fa)
- Google Natural Language API Documentation for stretch goals
    - [https://cloud.google.com/natural-language](https://cloud.google.com/natural-language)
- Resources on async functions
    - [https://zellwk.com/blog/async-await-express/](https://zellwk.com/blog/async-await-express/)

## Steps Post-Cohort

1. I felt more confused by the auth flow than I wanted to be. It was one of the last things I incorporated into my project when it needed to be one of the first things. I plan to revamp the auth flow and get success/validation messages to work (they do not, I had to make workarounds).
2. I wanted more features, like:
3. The Natural Language API call.
4. Getting uploaded audio to be displayed on the page in HTML5 `audio` tags. This would mean looking into BLOB storage and digging deeper into Sequelize.
5. An UPDATE route for my notes. I ended up commenting out my UPDATE route for notes since I could not figure it out.
6. To remember to plan out models and schemas *very thoroughly*. I wish I had not bothered with styling first but had MADE MODELS FIRST PRIORITY.