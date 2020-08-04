import React, { useState, useContext } from "react";
import AWS from "aws-sdk";
import { PDFDocument } from "pdf-lib";
import { fileContext } from "../mediaboard";
import PDFJSAnnotate from "../../utils/PdfAnnotate/PDFJSAnnotate";

const Toolelements = () => {
  const [value, setValue] = useState(1);

  const handleClearClick = (e) => {
    if (
      window.confirm(
        "Are you sure you want to clear all the annotations? The cleared annotations will not be recovered."
      )
    ) {
      let annotationLayers = document.querySelectorAll(
        "div.pdfViewer.active svg.customAnnotationLayer"
      );
      annotationLayers.forEach(function (item) {
        item.innerHTML = "";
      });
      PDFJSAnnotate.getStoreAdapter().resetAnnotation(
        document
          .querySelector("div.pdfViewer.active svg.customAnnotationLayer")
          .getAttribute("data-pdf-annotate-document")
      );
    }
  };
  const displayColorPicker = () => {
    if (
      document.querySelector(".nav-colopiker").style &&
      document.querySelector(".nav-colopiker").style.display == "none"
    ) {
      document.querySelector(".nav-colopiker").style.display = "block";
    } else {
      document.querySelector(".nav-colopiker").style.display = "none";
      document.querySelector(".color_pick").classList.remove("active");
    }
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };
  const showLoader = () => {
    let tag = document.createElement("div");
    tag.innerHTML = `<div class="bar2"></div>`;
    let element = document.querySelector(".room-container");
    element && element.prepend(tag);
  };
  const hideLoader = () => {
    let elem = document.querySelector(".room-container .bar2");
    try {
      elem.parentNode.removeChild(elem);
    } catch (e) { }
  };

  const fileState = useContext(fileContext);
  const bucketName = process.env.REACT_APP_AWS_BUCKET_NAME;
  const bucketRegion = process.env.REACT_APP_AWS_BUCKET_REGION;
  const IdentityPoolId = process.env.REACT_APP_AWS_IdentityPoolId;

  AWS.config.update({
    region: bucketRegion,
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: IdentityPoolId,
    }),
  });
  const s3 = new AWS.S3({
    apiVersion: "2006-03-01",
    params: { Bucket: bucketName },
  });

  const handleUpload = () => {
    try {
      showLoader();
      let files = document.getElementById("fileUpload").files;
      if (files) {
        let file = files[0];
        if (file) {
          let fileName = file.name;
          let size = file.size / 1024 / 1024;
          if (checkFileSize(size)) {
            let filePath = "my-first-bucket-path/" + fileName;
            let fileType = file.type;

            fileType == "application/pdf"
              ? uploadToAws(file, filePath)
              : convertToPdf(file, fileType);
            document.getElementById("fileUpload").value = null;
          } else {
            alert("File size should not be more than 5MB");
            hideLoader();
            return;
          }
        } else {
          alert("File was not selected");
          hideLoader();
        }
      }
    } catch (e) { }
  };

  const checkFileSize = (size) => {
    if (size >= 5) {
      return 0;
    }
    return 1;
  };
  const checkMimeType = (mime) => {
    if (
      mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mime === "application/msword" ||
      mime === "application/vnd.ms-powerpoint" ||
      mime ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      return 1;
    }
    return 0;
  };
  const uploadToAws = (file, filepath) => {
    const name = Date.now();
    s3.upload(
      {
        Key: filepath ? filepath : "my-first-bucket-path/" + name + ".pdf",
        Body: file,
        ACL: "public-read",
        ContentType: "application/pdf",
      },
      function (err, data) {
        if (err) {
          alert('Failed to upload !!!!');
        }
        hideLoader();
        fileState.fileDispatch({ type: "upload-file", fileId: data.Location });
      }
    ).on("httpUploadProgress", function (progress) {
      var uploaded = parseInt((progress.loaded * 100) / progress.total);

    });
  };
  const convertToPdf = async (file, fileType) => {
    try {
      if (
        fileType != "image/jpeg" &&
        fileType != "image/jpg" &&
        fileType != "image/png"
      ) {
        if (checkMimeType(fileType)) {
          callApiCovertorForPPTDocx(file);
        } else {
          alert("File format is not valid");
          hideLoader();
          return;
        }
      }
      file.arrayBuffer().then((buffer) => buffer);
      var buffer = await file.arrayBuffer();
      const imageBytes = buffer;
      if (fileType == "image/png") {
        convertPngToPdf(imageBytes);
      }

      if (fileType == "image/jpg" || fileType == "image/jpeg") {
        convertJpgToPdf(imageBytes);
      }
    }catch(err) {
      alert("Something went wrong !!");
      hideLoader();
      return;
    }
  };

  async function callApiCovertorForPPTDocx(file) {
    const formData = new FormData();
    formData.append("sampleFile", file);
    fetch('https://agoraapi.primemessenger.com/upload', {
      method: "POST",
      body: formData,
    })
      .then((resp) => resp.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          hideLoader();
          return;
        }
        fileState.fileDispatch({ type: "upload-file", fileId: data.url });
        hideLoader();
      })
      .catch((error) => {
        alert("Oops, We got an error while uploading the file");
        hideLoader();
      });
  }

  async function convertJpgToPdf(imageBytes) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const jpgImage = await pdfDoc.embedJpg(imageBytes);
    const jpgDims = jpgImage.scale(0.6);
    page.drawImage(jpgImage, {
      x: page.getWidth() / 2 - jpgDims.width / 2,
      y: page.getHeight() / 2 - jpgDims.height / 2,
      width: jpgDims.width,
      height: jpgDims.height,
    });
    const pdfBytes = await pdfDoc.save();
    saveByteArray(pdfBytes);
  }
  async function convertPngToPdf(imageBytes) {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const pngImage = await pdfDoc.embedPng(imageBytes);
      const pngDims = pngImage.scale(0.6);
      page.drawImage(pngImage, {
        x: page.getWidth() / 2 - pngDims.width / 2,
        y: page.getHeight() / 2 - pngDims.height,
        width: pngDims.width,
        height: pngDims.height,
      });
      const pdfBytes = await pdfDoc.save();
      saveByteArray(pdfBytes);
    } catch (e) {
      convertJpgToPdf(imageBytes);
    }
  }

  function saveByteArray(byte) {
    var blob = new Blob([byte], { type: "application/pdf" });
    
    uploadToAws(blob);
  }
  return (
    <>
      <div className="menu">
        <div className="nav annotation-toolbar">
          <div>
            <i
              title="Cursor"
              data-annotation-type="cursor"
              className="icon items selector"
            />
          </div>
          <div>
            <i
              title="Pencil"
              data-annotation-type="draw"
              className="icon items pencil"
            />
          </div>
          <div>
            <i
              title="Rectangle"
              data-annotation-type="area"
              className="icon items rectangle"
            />
          </div>
          <div>
            <i
              title="Ellipse"
              data-annotation-type="ellipse"
              className="icon items ellipse"
            />
          </div>
          <div>
            <i
              title="Text"
              data-annotation-type="text"
              className="icon items text"
            />
          </div>
          <div>
            <i
              title="Eraser"
              data-annotation-type="eraser"
              className="icon items eraser"
            />
          </div>
          <div>
            <i
              title="Line"
              data-annotation-type="line"
              className="icon items line"
            />
          </div>

          <div onClick={handleClearClick}>
            <i
              title="Clear All"
              data-annotation-type="clear"
              className="icon items clear-icon"
            />
          </div>
          <div>
            <i
              title="Highlight"
              data-annotation-type="highlight"
              className="icon items highlight"
            />
          </div>

          <div>
            <i title="Upload" className="icon items upload">
              <input type="file" id="fileUpload" onChange={handleUpload} />
            </i>
          </div>
          <div onClick={displayColorPicker}>
            <i
              title="Pen Color & Thickness"
              data-annotation-type="color"
              className="icon items color_pick"
            />
          </div>
          <div
            className="sub-menu nav-colopiker nav-pen"
            style={{ display: "none" }}
          >
            <ul>
              <li>
                <label className="piker-container black">
                  {" "}
                  <input
                    type="radio"
                    name="pen-color"
                    value="#000000"
                    data-value="black"
                  />
                  <span
                    className="checkmark"
                    style={{ backgroundColor: "#000" }}
                  ></span>
                </label>{" "}
              </li>
              <li>
                <label className="piker-container grey">
                  {" "}
                  <input
                    type="radio"
                    name="pen-color"
                    value="#9c9c9c"
                    data-value="grey"
                  />
                  <span
                    className="checkmark"
                    style={{ backgroundColor: "#9c9c9c" }}
                  ></span>
                </label>
              </li>
              <li>
                <label className="piker-container white">
                  {" "}
                  <input
                    type="radio"
                    name="pen-color"
                    value="#f2edfd"
                    data-value="white"
                  />
                  <span
                    className="checkmark"
                    style={{
                      backgroundColor: "#fff",
                      border: "1px solid #eee",
                    }}
                  ></span>
                </label>{" "}
              </li>
              <li>
                <label className="piker-container red">
                  {" "}
                  <input
                    type="radio"
                    name="pen-color"
                    value="#ff0000"
                    data-value="red"
                  />
                  <span
                    className="checkmark"
                    style={{ backgroundColor: "red" }}
                  ></span>
                </label>{" "}
              </li>
              <li>
                <label className="piker-container pink">
                  {" "}
                  <input
                    type="radio"
                    name="pen-color"
                    value="#f06291"
                    data-value="pink"
                  />
                  <span
                    className="checkmark"
                    style={{ backgroundColor: "#f06291" }}
                  ></span>
                </label>
              </li>
              <li>
                <label className="piker-container purple">
                  {" "}
                  <input
                    type="radio"
                    name="pen-color"
                    value="#8f3e97"
                    data-value="purple"
                  />
                  <span
                    className="checkmark"
                    style={{ backgroundColor: "#8f3e97" }}
                  ></span>
                </label>
              </li>
              <li>
                <label className="piker-container blue">
                  {" "}
                  <input
                    type="radio"
                    name="pen-color"
                    value="#2083c5"
                    data-value="blue"
                  />
                  <span
                    className="checkmark"
                    style={{ backgroundColor: "#2083c5" }}
                  ></span>
                </label>
              </li>
              <li>
                <label className="piker-container green">
                  {" "}
                  <input
                    type="radio"
                    name="pen-color"
                    value="#007a3b"
                    data-value="green"
                  />
                  <span
                    className="checkmark"
                    style={{ backgroundColor: "#007a3b" }}
                  ></span>
                </label>
              </li>
              <li>
                <label className="piker-container yellow">
                  {" "}
                  <input
                    type="radio"
                    name="pen-color"
                    value="#ffcd45"
                    data-value="yellow"
                  />{" "}
                  <span
                    className="checkmark"
                    style={{ backgroundColor: "#ffcd45" }}
                  ></span>{" "}
                </label>
              </li>
              <li>
                <label className="piker-container orange">
                  {" "}
                  <input
                    type="radio"
                    name="pen-color"
                    value="#ff8d00"
                    data-value="orange"
                  />
                  <span
                    className="checkmark"
                    style={{ backgroundColor: "#ff8d00" }}
                  ></span>
                </label>
              </li>
            </ul>
            <div className="rangeslider-box">
              {" "}
              <label>Thickness</label>
              <div className="slider">
                {" "}
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={value}
                  className="slider-color"
                  id="penThicknessRange"
                  onChange={handleChange}
                />
              </div>{" "}
              <span id="penThickness" className="text-size slider-val"></span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Toolelements;
