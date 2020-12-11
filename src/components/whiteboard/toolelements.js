/* eslint-disable default-case */
import React, { useState, useContext, useEffect, useRef, useMemo } from "react";
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
import { SketchPicker } from 'react-color';
import LineWeightIcon from '@material-ui/icons/LineWeight';
import PersonIcon from '@material-ui/icons/Person';
import { roomStore } from '../../stores/room';
import { useLocation } from 'react-router';
import { async } from "rxjs/internal/scheduler/async";
import { blue } from '@material-ui/core/colors';

const Toolelements = () => {
  const [value, setValue] = useState(1);
  const [isPdf, showHighLight] = useState(false);
  let [tooltype, setToolType] = useState('cursor');
  let [thickness, changeThickness] = useState(1);
  let [color, changeColor] = useState('#ff0000');
  let [colorPicker, setColorPicker] = useState(false);
  let [sizePicker, setSizePicker] = useState(false);

  const location = useLocation();

  var RENDER_OPTIONS = {
		documentId: 'default'
  };

  const showTool = useMemo(() => {
    if (roomStore._state.course.allowAnnotation 
      && roomStore._state.me.role === 'teacher' 
      && (location.pathname.match(/big-class/) || location.pathname.match(/small-class/))) {
      return true
    }
    return false;
  }, [location.pathname, roomStore._state.me.role,roomStore._state.course.allowAnnotation]);

  useEffect(() => {

    //set for pen
    UI.setPen(thickness, color);
    localStorage.setItem(RENDER_OPTIONS.documentId + '/pen/color', color);
    localStorage.setItem(RENDER_OPTIONS.documentId + '/pen/size', thickness);

    // set for Text
    UI.setText(thickness, color);
    localStorage.setItem(RENDER_OPTIONS.documentId + '/text/size', thickness);
    localStorage.setItem(RENDER_OPTIONS.documentId + '/text/color', color);

    // set for line
    UI.setLine(thickness, color);
    localStorage.setItem(RENDER_OPTIONS.documentId + '/line/size', thickness);
    localStorage.setItem(RENDER_OPTIONS.documentId + '/line/color', color);

    //set for ellipse
    UI.setEllipse(thickness, color)
    localStorage.setItem(RENDER_OPTIONS.documentId + '/ellipse/size', thickness);
    localStorage.setItem(RENDER_OPTIONS.documentId + '/ellipse/color', color);

    //set for Rectangle
    UI.setRect(thickness, color);
    localStorage.setItem(RENDER_OPTIONS.documentId + '/rect/size', thickness);
    localStorage.setItem(RENDER_OPTIONS.documentId + '/rect/color', color);

  },[color, thickness]);


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
          default:
            UI.disableEdit();
            UI.disablePen();
            UI.disableEraser();
            UI.disableText();
            UI.disableLine();
            UI.disableEllipse();
            UI.disableRect();      
          }
  },[tooltype])
  const handleToolbarClick  = (e) => {
      const type = e.currentTarget.getAttribute('data-annotation-type');
      if(colorPicker) {
        setColorPicker(false)
      }
      if(sizePicker) {
        setSizePicker(false)
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

    if(colorPicker) setColorPicker(false);
    else {
      setToolType('')
      setSizePicker(false);
      setColorPicker(true);
    }
 }

 const displaySizePicker = () =>  {
  if(sizePicker) setSizePicker(false);
  else {
    setToolType('')
    setColorPicker(false);
    setSizePicker(true);
  }
 }

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
    } catch (e) {
     }
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
          alert('Failed to upload !!!!', err);
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

  const ExitGrantWhiteboard =  async() => {
    try {
    const peeerId = roomStore._state.course.linkId;
    await roomStore.mute(`${peeerId}`, 'grantBoard');
    await roomStore.updateCourseLinkUid(0)
    } catch(err) {}
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
            <span className="tooltiptext">Pencil Color</span>
          <div
            className="sub-menu nav-colopiker nav-pen"
            style={ colorPicker ? { display: "block" } : {display: "none"}}
          >
            <SketchPicker
            color={ color }
            onChangeComplete={ (color) => {
              changeColor(color.hex)
            } }
            />
            </div>
          </div>
            <div onClick={displaySizePicker} className="menu-mat-icons">
            <LineWeightIcon
              data-annotation-type="size"
              className= {sizePicker ? 'icon items size_pick active' : 'icon items size_pick'}
            />
            <span className="tooltiptext">Thickness</span>
          <div
            className="sub-menu nav-colopiker-thickness nav-pen"
            style={ sizePicker ? { display: "block" } : {display: "none"}}
          >
          <div className="rangeslider-box">
              {" "}
              <label>Thickness</label>
              <div className="slider">
                {" "}
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={thickness}
                  className="slider-color"
                  id="penThicknessRange"
                  onChange={(e) => changeThickness(e.target.value)}
                />
              </div>{" "}
            </div>
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
            isPdf ?
            <div className='menu-mat-icons'>
            <FormatColorTextIcon
              data-annotation-type="highlight"
              className= { tooltype === 'highlight' ? 'icon items active' : 'icon items'}
              style = {{display: 'block'}}
              onClick = {handleToolbarClick}
            />
            <span className="tooltiptext">Highlight Text</span>
            </div> :
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
          {
            showTool ?
            <>
            <PersonIcon style={{ color: blue[300] }} onClick = {ExitGrantWhiteboard} className = 'icon items' />
            <span className="tooltiptext">cancel annotation</span>
            </>
            : null
          }
        </div>
      </div>
    </>
  );
};
export default Toolelements;
