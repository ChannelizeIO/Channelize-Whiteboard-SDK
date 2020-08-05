# NODE FILE CONVERT

Node.js wrapper for converting files to PDF

## Setup

- The whiteboard uses npm library awesome-unoconv  Node.js wrapper for converting Office files and images to PDF.

### Requirement

  ## 1. Unoconv is required, which requires LibreOffice (or OpenOffice).

      ```bash
      sudo add-apt-repository ppa:libreoffice/ppa

      sudo apt install libreoffice

      $ brew install unoconv (for MAC)
        or
      npm install unoconv

      ```
  ## 2. Any storage server can be used to upload the file , for this we use AWS S3.

      - Set up your AWS S3 bucket . For details, see [S3 setup](https://docs.aws.amazon.com/quickstarts/latest/s3backup/step-1-create-bucket.html).

      - Rename `.env.example` to `.env` and configure the following parameters

          ```bash
      # your AWS S3 bucket name
      AWS_BUCKET_NAME=your_aws_bucket_name
      # your AWS S3 bucket region
      AWS_BUCKET_REGION=your_bucket_region

      -- Can use one of them

      # your AWS S3 access key
      AWS_BUCKET_KEY=your_bucket_key

      # your AWS S3 access secret key
      AWS_BUCKET_SECRET=your_bucket_sk

      OR

      # your AWS S3 endpoint
      AWS_IdentityPoolId=IdentityPoolId
      ```

## Run the project

```bash
1. Install npm
   npm install

2. Locally run the node file converter
   npm run start

```

## Usage

### Convert document to pdf directly.

```js
const path = require('path');
const unoconv = require('awesome-unoconv');

const sourceFilePath = path.resolve('./myDoc.docx');
const outputFilePath = path.resolve('./myDoc.pdf');

unoconv
  .convert(sourceFilePath, outputFilePath)
  .then(result => {
    console.log(result); // return outputFilePath
  })
  .catch(err => {
    console.log(err);
  });
```

### Convert document to pdf or html with options.

```js
const path = require('path');
const unoconv = require('awesome-unoconv');

const sourceFilePath = path.resolve('./myDoc.docx');
const outputFilePath = path.resolve('./myDoc.pdf'); // or 'myDoc.html'

unoconv
  .convert(inputPath, { output: outputPath, format: 'pdf' })  // or format: 'html'
  .then(result => {
    console.log(result); // return outputFilePath
  })
  .catch(err => {
    console.log(err);
  });
```

### Convert document to Buffer.

```js
const fs = require('fs');
const path = require('path');
const unoconv = require('awesome-unoconv');

const sourceFilePath = path.resolve('./myDoc.docx');
const outputFilePath = path.resolve('./myDoc.pdf'); // or 'myDoc.html'

unoconv
  .convert(inputPath, { buffer: true, format: 'pdf' })  // or format: 'html'
  .then(buffer => {
    // return Buffer
    fs.writeFileSync(outputPath, buffer, { encoding: 'utf8' });
    console.log(`File save at ${outputPath}`);
  })
  .catch(err => {
    console.log(err);
  });
```
