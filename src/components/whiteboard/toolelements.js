/* eslint-disable default-case */
import React, { useState, useContext, useEffect, useRef } from "react";
import AWS from "aws-sdk";
import { fileContext } from "../mediaboard";
import PDFJSAnnotate from "../../utils/PdfAnnotate/PDFJSAnnotate";
import NearMeIcon from '@material-ui/icons/NearMe';
import CreateIcon from '@material-ui/icons/Create';
import ColorizeIcon from '@material-ui/icons/Colorize';
import CropDinIcon from '@material-ui/icons/CropDin';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import TextFieldsIcon from '@material-ui/icons/TextFields';
import DeleteIcon from '@material-ui/icons/Delete';
import FormatColorTextIcon from '@material-ui/icons/FormatColorText';
import PublishIcon from '@material-ui/icons/Publish';
import UI from "../../utils/PdfAnnotate/UI";

const Toolelements = () => {
  const [value, setValue] = useState(1);
  const [isPdf, showHighLight] = useState(false);
  let [tooltype, setToolType] = useState('cursor');
  let [textSize, setTextSize] = useState(10);
  let [textColor, setTextColor] = useState('#fffb00');
  let [penThickness, setPenThickness] = useState(1);
  let [penColor, setPenColor] = useState('#ff0000');
  let [colorPicker, setColorPicker] = useState(false);

  var RENDER_OPTIONS = {
		documentId: 'default'
  };

  useEffect(() => {
    UI.setPen(penThickness, penColor);
    localStorage.setItem(RENDER_OPTIONS.documentId + '/pen/color', penColor);
  },[penColor]);

  useEffect(() => {
    UI.setPen(penThickness, penColor);
    localStorage.setItem(RENDER_OPTIONS.documentId + '/pen/size', penThickness);
  },[penThickness]);


  useEffect(() => {

    UI.setText(textSize, textColor);
    localStorage.setItem(RENDER_OPTIONS.documentId + '/text/size', textSize);
    localStorage.setItem(RENDER_OPTIONS.documentId + '/text/color', textColor);

  },[]);

  useEffect(() => {
 
    switch (tooltype) {
        case 'color':
          break;
        case 'cursor':
          UI.enableEdit();
          break;
        case 'draw':
          UI.disableEdit();
          UI.enablePen();
          break;
        case 'eraser':
          UI.disableEdit();
          UI.enableEraser();
          break;
        case 'text':
          UI.disableEdit();
          UI.enableText();
          break;
        case 'line':
          UI.disableEdit();
          UI.enableLine();
          break;
        case 'point':
          UI.disableEdit();
          UI.enablePoint();
          break;
        case 'ellipse':
          UI.disableEdit();
          UI.enableEllipse();
          break;
        case 'area':
        case 'highlight':
        case 'underline':
        case 'strikeout':
          UI.disableEdit();
          UI.enableRect(tooltype);
          break;
      }
  },[tooltype])
  const handleToolbarClick  = (e) => {
      const type = e.currentTarget.getAttribute('data-annotation-type');
      if(colorPicker) {
        setColorPicker(false)
      }
    if(type === tooltype) {
      return;
    } else {
      switch (tooltype) {
            case 'cursor':
              UI.disableEdit();
              break;
            case 'draw':
              UI.disablePen();
              break;
            case 'eraser':
              UI.disableEraser();
              break;
            case 'text':
              UI.disableText();
              break;
            case 'line':
              UI.disableLine();
              break;
            case 'point':
              UI.disablePoint();
              break;
            case 'ellipse':
              UI.disableEllipse();
              break;
            case 'area':
            case 'highlight':
            case 'strikeout':
            case 'underline':
              UI.disableRect();
              break;
            case 'color':
             document.getElementsByClassName('.nav-colopiker').style.display = 'none'
          }
          setToolType(type);
    }

  }


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
    if(colorPicker) {
      setColorPicker(false);
    } else {
      setColorPicker(true);
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

  useEffect(() => {
    const element = document.getElementsByClassName("pdfViewer active")[0].id
    if(element.length > 17) {
      showHighLight(true);
    } else {
      showHighLight(false);
    }
  },[fileState]);

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
      callApiCovertorForPPTDocx(file);
    }catch(err) {
      alert("Something went wrong !!");
      hideLoader();
      return;
    }
  };

  async function callApiCovertorForPPTDocx(file) {
    const formData = new FormData();
    formData.append("sampleFile", file);
    fetch(process.env.REACT_APP_LIBRE_BACKEND_URL, {
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

  const inputFileRef = useRef(null);

  const handleFileUpload = () => {
    /*Collecting node-element and performing click*/
    inputFileRef.current.click();
  }
  return (
    <>
      <div className="menu">
        <div className="nav annotation-toolbar">
        <div className="menu-mat-icons">
            <NearMeIcon
            data-annotation-type="cursor"
            className= { tooltype === 'cursor' ? 'icon items active' : 'icon items'}
            onClick = {handleToolbarClick}
            />
            <span className="tooltiptext">Cursor</span>
          </div>
          <div className="menu-mat-icons">
              <CreateIcon
              data-annotation-type="draw"
              className= { tooltype === 'draw' ? 'icon items active' : 'icon items'}
              onClick = {handleToolbarClick}
              />
              <span className="tooltiptext">Pencil</span>
          </div>
          <div onClick={displayColorPicker} className="menu-mat-icons">
            <ColorizeIcon
              data-annotation-type="color"
              className= {colorPicker ? 'icon items color_pick active' : 'icon items color_pick'}
            />
            <span className="tooltiptext">Pencil Color & Thickness</span>
          </div>
          <div
            className="sub-menu nav-colopiker nav-pen"
            style={ colorPicker ? { display: "block" } : {display: "none"}}
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
                    onClick={(e) => setPenColor(e.target.value)}
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
                    onClick={(e) => setPenColor(e.target.value)}
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
                    onClick={(e) => setPenColor(e.target.value)}
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
                    onClick={(e) => setPenColor(e.target.value)}

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
                    onClick={(e) => setPenColor(e.target.value)}
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
                    onClick={(e) => setPenColor(e.target.value)}
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
                    onClick={(e) => setPenColor(e.target.value)}
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
                    onClick={(e) => setPenColor(e.target.value)}
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
                    onClick={(e) => setPenColor(e.target.value)}
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
                    onClick={(e) => setPenColor(e.target.value)}
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
                  value={penThickness}
                  className="slider-color"
                  id="penThicknessRange"
                  onChange={(e) => setPenThickness(e.target.value)}
                />
              </div>{" "}
              <span id="penThickness" className="text-size slider-val"></span>
            </div>
          </div>

          <div className="menu-mat-icons">
            <i
              data-annotation-type="line"
              className= { tooltype === 'line' ? 'icon items line active' : 'icon items line'}
              onClick = {handleToolbarClick}
            />
            <span className="tooltiptext">Line</span>
          </div>
          <div className="menu-mat-icons">
              <CropDinIcon
               data-annotation-type="area"
               className= { tooltype === 'area' ? 'icon items active' : 'icon items'}
               onClick = {handleToolbarClick}
              />
              <span className="tooltiptext">Rectangle</span>
          </div>
          <div className="menu-mat-icons">
              <RadioButtonUncheckedIcon 
               data-annotation-type="ellipse"
               className= { tooltype === 'ellipse' ? 'icon items active' : 'icon items'}
               onClick = {handleToolbarClick}
              />
              <span className="tooltiptext">Ellipse</span>
          </div>
          <div className="menu-mat-icons">
              <TextFieldsIcon
               data-annotation-type="text"
               className= { tooltype === 'text' ? 'icon items active' : 'icon items'}
               onClick = {handleToolbarClick}
              />
              <span className="tooltiptext">Text</span>
          </div>
          <div className="menu-mat-icons">
              <i
                data-annotation-type="eraser"
                className= { tooltype === 'eraser' ? 'icon items eraser active' : 'icon items eraser'}
                title="Eraser"
                onClick = {handleToolbarClick}
              />
              <span className="tooltiptext">Eraser</span>
          </div>
          <div onClick={handleClearClick} className="menu-mat-icons">
              <DeleteIcon
               data-annotation-type="clear"
               className= { tooltype === 'clear' ? 'icon items active' : 'icon items'}
              />
              <span className="tooltiptext">Clear All</span>
          </div>
          {
            isPdf ?<>
            <FormatColorTextIcon
              data-annotation-type="highlight"
              className= { tooltype === 'highlight' ? 'icon items active' : 'icon items'}
              style = {{display: 'block'}}
              onClick = {handleToolbarClick}
            />
            <span className="tooltiptext">Highlight Text</span>
            </> :
           <>
           <FormatColorTextIcon
             data-annotation-type="highlight"
             className= { tooltype === 'highlight' ? 'icon items active' : 'icon items'}
               style = {{display: 'none'}}
               onClick = {handleToolbarClick}
           />
           <span className="tooltiptext">Highlight Text</span>
          </>
          }
          <div className="menu-mat-icons">
              <PublishIcon onClick = {handleFileUpload} className="icon items upload"
               />
               <span className="tooltiptext">Upload</span>
            <input type="file" id="fileUpload" ref={inputFileRef} onChange={handleUpload}
            style={{display: 'none'}}
            />
          </div>
        </div>
      </div>
    </>
  );
};
export default Toolelements;
