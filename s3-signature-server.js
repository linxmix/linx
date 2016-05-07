// Basic node server for signing S3 requests

//
// S3 LOGIC
//
const aws = require('aws-sdk');

const s3Options = {
  accessKeyId: process.env.S3_KEY,
  secretAccessKey: process.env.S3_SECRET,
  region: process.env.S3_REGION || 'us-west-1',
  bucket: process.env.S3_BUCKET
};

aws.config.update(s3Options);
const client = new aws.S3();

function getSignedS3Url(fileName, fileType, cb) {
  const bucket = s3Options.bucket
  const params = {
    Bucket: bucket,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read'
  }

  client.getSignedUrl('putObject', params, function(err, data) {
    const url = 'https://' + bucket + '.s3.amazonaws.com/' + fileName;
    cb(err, {
      signedRequest: data,
      url: url
    });
  });
}

//
// SERVER LOGIC
//
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// allow cors on all routes
app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const PORT = 4005;

app.post('/signed-request', function(req, res) {
  console.log('POST /signed-request: ', req.body.file);
  const body = req.body;
  const file = body.file;
  const type = body.type;

  getSignedS3Url(file, type, function(err, signedData) {
    if (err) { console.log('ERROR', err); }

    res.send(signedData);
  });
});

app.listen(PORT, function() {
  console.log('Server listening on: http://localhost:%s', PORT);
});
