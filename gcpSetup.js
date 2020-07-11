const fs = require("fs");
require("dotenv").config();
fs.writeFile(process.env.GOOGLE_APPLICATION_CREDENTIALS, process.env.GCRED, err => {
    if (err) console.log(err); 
    console.log("Writing a file 💾");
})