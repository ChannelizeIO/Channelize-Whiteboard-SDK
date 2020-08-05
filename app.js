var express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const unoconv = require("./dist");
const fs = require("fs");
var randomstring = require("randomstring");
var AWS = require("aws-sdk");

require("dotenv").config();

const bucketName = process.env.AWS_BUCKET_NAME;
const bucketRegion = process.env.AWS_BUCKET_REGION;
const IdentityPoolId = process.env.AWS_IdentityPoolId;

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
});
const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: bucketName }
});

var app = express();
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,OPTIONS,POST,PUT,DELETE"
  );
  next();
});
app.use(fileUpload());

app.post("/upload", function(req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }
  console.log("HIt");
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;
  if (sampleFile.size / 1024 / 1024 >= 5) {
    res.end(JSON.stringify({ error: "Filesize should not be more than 5 MB" }));
  }
  const randomStr = randomstring.generate(7);
  const filePath = randomStr + sampleFile.name;
  const inputPath = path.resolve("./test/" + filePath);
  const outputPath = path.resolve("./test/" + randomStr + ".pdf");
  // Use the mv() method to place the file somewhere on your server

  sampleFile.mv("./test/" + filePath, function(err) {
    if (err) return res.status(500).send(err);
    unoconv
      .convert(inputPath, outputPath)
      .then(result => {
        var fs = require("fs");
        var data = fs.readFileSync(outputPath);
        const name = Date.now();
        s3.upload(
          {
            Key: "my-first-bucket-path/" + name + ".pdf",
            Body: data,
            ACL: "public-read",
            ContentType: "application/pdf"
          },
          function(err, result) {
            if (err) {
              //   console.log(err);
            }
            console.log("Done");
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ url: result.Location }));
            deleteFile(filePath);
            deleteFile(randomStr + ".pdf");
          }
        );
      })
      .catch(err => {
        console.log(err);
      });
  });
});

const deleteFile = filepath => {
  fs.unlink("./test/" + filepath, function(err) {
    if (err) throw err;
    // if no error, file has been deleted successfully
    console.log("File deleted!");
  });
};
