
<div align="center">
<img src='src/assets/Channelize-logo.png' height="400"/>
<h1>Channelize Whiteboard Demo</h1>
<p><b>Modern JavaScript based Whiteboard for Collaboration in Online Education.</b></p>
<sub>Channelize Whiteboard is a leading open source whiteboard solution that powers innovation in Tele-education by adding engagement in online learning. It is rich in features, compatible with diverse frameworks, and easy to integrate and extend. </sub>
</div>

### This Whiteboard Solution has been co-developed by Channelize.io & Agora.io

<table align="center" border="0" cellpadding="0" cellspacing="0">
<td align="center" >
 <a href='https://channelize.io/' target="_blank" rel="noopener noreferrer">
    <img src='src/assets/Logo-Channelize.png' width="300"/>
</td>
<td align="center" >
 <a href='https://www.agora.io/' target="_blank" rel="noopener noreferrer" >
    <img src='src/assets/agoralightblue-1.png' width="300"/>
</td>
</table>


# About the project

Channelize Whiteboard is a project to provide developers building solutions for the online education and collaboration space, an interactive open-source whiteboard with real-time annotations.


### Applicable scenarios


Channelize Whiteboard supports the following scenarios:


- One-to-one Classroom: An online teacher gives an exclusive lesson using whiteboard annotation to only one student in real-time.
- Small Classroom: A teacher gives an online lesson to multiple students, and both the teacher and students can interact with each other in real time. The number of students in a small classroom should not exceed 16.
- Lecture Hall: Thousands of students can watch an online lecture together. Students can "raise their hands" to interact with the teacher, and their responses are viewed by all the other students at the same time.


In Small Classroom and Large Hall:
- Teacher can do the announcements in text and image form. 
- Teacher can raise a poll (Question) with four options and students can choose one of the four options.

### Demo
   - To check demo, [Click here](https://whiteboard-demo.channelize.io/).

### Functions (Only works in Web)

- Interactive Whiteboard: Using PDF.js For Whiteboard annotations and Agora RTM SDK to reflect white board annotations changes to students. Whiteboard currently provides the following tools:
    1. Pencil
    2. Shapes: Circle, Square, Rectangle, Oval, Line
    3. Text Annotations
    4. Eraser
    5. Clear all
    6. Settings for Annotations: Thickness, Color
    7. Highlighter (Teacher can highlight text in uploaded .pdf file)

- Full Screen mode: Both teacher and students can use full screen mode independently.
- Uploading file: Teachers can upload PPT,WORD,PDF,JPG,PNG files which will be broadcasted to   the attendees / Students. Teachers can then annotate these files.
- Bonus features:
    1. Announcements: Teacher can do announcements in text and image forms.
    2. Polls: Teachers can raise a poll (question) with four options and students can choose one of the four options as an answer.


### Some Upcoming Features

  1. Multiple annotators.
  2. Downloading annotated files.
  3. Support for other pub/sub services.
  4. Improvement in annotations in Mobile & Tablet browsers.


### Compatibility

Channelize Whiteboard will work on all Desktop & Laptop browsers. On Mobile & Tablet browsers, currently the UI of annotations is not coming fine.



# Get started


   ## Prerequisites

   Make sure you make the following preparations before compiling and running the sample project.

   #### Get an Agora App ID
   Follow these steps to get an Agora App ID:
   1. Create an account in [Agora Console](https://sso.agora.io/v2/signup).
   2. Log in to Agora Console and create a project. Select **"App ID only"** as your authentication mechanism when creating the project. Make  sure that you disable the [App Certificate](https://docs.agora.io/en/Agora%20Platform/token?platform=All%20Platforms#appcertificate) of  this project or can use security according to your needs.
   3. Get the App ID of this project in **Project Management** page.


   #### Set up File Converter API 
   For File uploading, we need to setup back-end API server which converts the WORD,PDF,JPG,PNG to PDF format using Unoconv and LibreOffice and upload it to AWS S3.
   for File-Convert Setup  [Click here](https://github.com/ChannelizeIO/Channelize-Whiteboard-SDK/tree/Node-File-Convertor-API) .

   ## Preparations
   - Set up your AWS S3 bucket . For details, see [S3 setup](https://docs.aws.amazon.com/quickstarts/latest/s3backup/step-1-create-bucket.html).


   - Rename `.env.example` to `.env.local` and configure the following parameters:

   - **(Required) Agora App ID** 
   ```bash
   # Agora App ID
   REACT_APP_AGORA_APP_ID=agora appId
   REACT_APP_AGORA_LOG=true
   ```
   - **File converter API URL**
   ```bash
   REACT_APP_LIBRE_BACKEND_URL=file_converter_api_url
   ```

   - **AWS S3 configurations for Whiteboard.**
   - Please make changes in the toolelements.js file at:&nbsp; src/components/whiteboard/toolelements.js

   ```bash
   # your AWS S3 bucket name
   REACT_APP_AWS_BUCKET_NAME=your_aws_bucket_name
   # your AWS S3 bucket region
   REACT_APP_AWS_BUCKET_REGION=your_bucket_region

   -- Can use one of them

   # your AWS S3 access key
   REACT_APP_AWS_BUCKET_KEY=your_bucket_key

   # your AWS S3 access secret key
   REACT_APP_AWS_BUCKET_SECRET=your_bucket_sk

      OR

   # your AWS S3 endpoint
   REACT_APP_AWS_IdentityPoolId=IdentityPoolId
   ```

   ## Tech Stack
   * [npm][node],&nbsp; [JavaScript][js] — core platform and dev tools
   * Install Node.js LTS

   ### Core SDKs
   - agora-rtm-sdk (agora rtm web sdk)
   - aws-sdk (amazon web services - S3)


   ### Frontend tech utilities
   - Typescript
   - React
   - Javascript


   ### for Whiteboard annotation 
   - pdfJs


   ## Run the project
   ```bash
   1. Install npm
      npm install

   2. Locally run the Web demo
      npm run dev

   3. To build the project
      npm run build
   ```
