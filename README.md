## About the project


 Channelize Whiteboard is a project to provide developers in the education industry, to build  
Whiteboard annotation with the help of Agora services. It demonstrates how to use  **Agora RTM SDK** and third party pdfJs and pdfAnnotateJs for Whiteboard solution in web platforms .


### Applicable scenarios


Channelize Whiteboard supports the following scenarios:


- One-to-one Classroom: An online teacher gives an exclusive lesson using whiteboard annotation to only one student in real-time.
- Small Classroom: A teacher gives an online lesson to multiple students, and both the teacher and students can interact with each other in real time. The number of students in a small classroom should not exceed 16.
- Lecture Hall: Thousands of students can watch an online lecture together. Students can "raise their hands" to interact with the teacher, and their responses are viewed by all the other students at the same time.


In Small Classroom and Large Hall:
- Teacher can do the announcements in text and image form. 
- Teacher can raise a poll (Question) with four options and students can choose one of the four options.


### Functions (Only works in Web)


- Interactive Whiteboard 
        * Using pfdJs for whiteboard annotations and Agora RTM SDK to reflect white board annotations changes to students end.
- Full Screen mode
        * Both teacher and student can use full screen mode independently.
- Uploading file
        * Teachers can upload PPT,WORD,PDF,JPG,PNG files which will be broadcasted to the attendees / Students. 
- Students raising hands
        * In a lecture hall, students can "raise their hands" to apply for interacting  with the teacher. The teacher can approve or decline the application.


### Compatibility


Channelize Whiteboard supports the following platforms and versions:
- It will work on all Web browsers but not on Mobile/Tablet browsers.


## Get started


### Prerequisites 


 Make sure you make the following preparations before compiling and running the sample project.


 #### Get an Agora App ID
 Follow these steps to get an Agora App ID:
  1. Create an account in [Agora Console](https://sso.agora.io/v2/signup).
  2. Log in to Agora Console and create a project. Select **"App ID only"** as your authentication mechanism when creating the project. Make  sure that you disable the [App Certificate](https://docs.agora.io/en/Agora%20Platform/token?platform=All%20Platforms#appcertificate) of  this project or can use security according to your needs.
  3. Get the App ID of this project in **Project Management** page.


 ## Tech Stack
 *[npm][node],[JavaScript][js] — core platform and dev tools


### Core SDKs
 - agora-rtm-sdk (agora rtm web sdk)
 - aws-sdk (amazon web services - S3)


### Frontend tech utilities
 - typescript
 - react 
 - Javascript


### for Whiteboard annotation 
 - pdfJs


## Preparations
 - Set up your AWS S3 bucket . For details, see [S3 setup](https://docs.aws.amazon.com/quickstarts/latest/s3backup/step-1-create-bucket.html).


 - Rename `.env.example` to `.env.local` and configure the following parameters:


  - **(Required) Agora App ID** 
  ```bash
  # Agora App ID
  REACT_APP_AGORA_APP_ID=agora appId
  REACT_APP_AGORA_LOG=true
  ```


 - **AWS S3 configurations for whiteboard   courseware.
You can look and change according to your requirements into toolelements.js file in location src/components/whiteboard/toolelements.js 
**
  ```bash
  # your AWS S3 bucket name
  REACT_APP_AWS_BUCKET_NAME=your_aws_bucket_name
  # your AWS S3 bucket region
  REACT_APP_AWS_BUCKET_REGION=your_bucket_region
 
  -- Can use one of them 
 # your AWS S3 access key
REACT_APP_AWS_BUCKET_KEY=your_bucket_key


# your AWS S3 access secret key  REACT_APP_AWS_BUCKET_SECRET=your_bucket_sk


   OR 


  # your AWS S3 endpoint
 REACT_APP_AWS_IdentityPoolId=IdentityPoolId


- Install Node.js LTS


## Run the project
1. Install npm
   npm install

2. Locally run the Web demo
   npm run dev

3. to build the project
   npm run build
   ```
