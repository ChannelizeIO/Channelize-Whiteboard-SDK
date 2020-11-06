import React, { useEffect, useState, useContext } from "react";
import { getDocument } from "pdfjs-dist/build/pdf";
import PDFJSAnnotate from "../utils/PdfAnnotate/PDFJSAnnotate";
import 'pdfjs-dist/web/pdf_viewer.css';
import "./whiteboard.scss";
import { roomStore } from "../stores/room";
import { fileContext } from "./mediaboard";
import { toggleNext, togglePrev, toggleFirstLast } from "./whiteboard/control";
import FullscreenOutlinedIcon from '@material-ui/icons/FullscreenOutlined';
import FullscreenExitOutlinedIcon from '@material-ui/icons/FullscreenExitOutlined';
import { t } from '../i18n';

(typeof window !== "undefined"
  ? window
  : {}
).pdfjsWorker = require("pdfjs-dist/build/pdf.worker.js");

const rtmClient = roomStore.rtmClient;

export const sendToRemote = async (
  annotations,
  documentId,
  status,
  annotationId
) => {
  const rendering = {
    annotations: {
      annotations: annotations,
      documentId: documentId,
    },
    type: "annotation",
    status: status,
    annotationId: annotationId,
  };
  await rtmClient.sendChannelMessage(JSON.stringify(rendering));
  roomStore.sendAnnotation(rendering);
};

const Whiteboard = () => {
  let arrayStoreAdapter = new PDFJSAnnotate.ArrayStoreAdapter();

  const fileState = useContext(fileContext);

  // full screen boolean
  const [fullScreen, setFullScreen] = useState(false);

  var elements = [];
  fileState.pdfFiles.forEach(function (value) {
    elements.push(
      <div
        id={`viewerContainer${value}`}
        className={"pdfViewer " + (value === 1 ? "active" : "")}
        key={`${value}`}
      ></div>
    );
  });
  const hideLoader = () => {
    let elem = document.querySelector(".room-container .bar2");
    try {
      elem.parentNode.removeChild(elem);
    } catch (e) { }
  };
  useEffect(() => {
    if (
      !document
        .getElementById(
          `viewerContainer${fileState.pdfFiles[fileState.pdfFiles.length - 1]}`
        )
        .getElementsByTagName("svg").length
    )
      renderPdf(fileState.pdfFiles[fileState.pdfFiles.length - 1]);
  }, [fileState.pdfFiles]);

  const renderPdf = (pages, custom = 0) => {
    const { UI } = PDFJSAnnotate;
    let VIEWER;
    let data;
    let elementId;
    let check = false;
    if (!custom) {
      if (parseInt(pages, 10)) {
        data = require(`../assets/whiteboard/whiteboard-${pages}.pdf`);
      } else {
        check = true;
        data = pages;
      }
      VIEWER = document.getElementById(`viewerContainer${pages}`);
      elementId = `viewerContainer${pages}`;
      document
        .getElementsByClassName("pdfViewer active")[0]
        .classList.remove("active");
      document.getElementById(elementId).classList.add("active");
    } else {
      PDFJSAnnotate.getStoreAdapter().resetAnnotation(
        document
          .querySelector("div.pdfViewer.active svg.customAnnotationLayer")
          .getAttribute("data-pdf-annotate-document")
      );
      document.getElementsByClassName("pdfViewer active")[0].innerHTML = "";
      data = pages;
      VIEWER = document.getElementsByClassName("pdfViewer active")[0];
      elementId = document.getElementsByClassName("pdfViewer active")[0].id;
    }
    const RENDER_OPTIONS = {
      documentId: data,
      pdfDocument: null,
      scale: 1,
      rotate: 0,
      count: elementId,
    };
    getDocument(RENDER_OPTIONS.documentId).promise
      .then((pdf) => {
        if (check) {
          alert(t('toast.upload_file'));
          hideLoader();
        }
        fileState.setTotalPages(pdf.numPages)
        RENDER_OPTIONS.pdfDocument = pdf;
        for (let i = 1; i <= pdf.numPages; i++) {
          VIEWER.appendChild(UI.createPage(i));
          UI.renderPage(i, RENDER_OPTIONS);
        }
      })
      .catch((error) => {
        // handle error
      });

    PDFJSAnnotate.setStoreAdapter(new PDFJSAnnotate.LocalStoreAdapter());
  };
  useEffect(() => {
    if (roomStore._state.me.role === "teacher") {
      PDFJSAnnotate.getStoreAdapter().addEvent(
        "annotation:added",
        (fingerprint, annotation) => {
          arrayStoreAdapter.addAnnotation(fingerprint, annotation);
          sendToRemote(annotation, fingerprint, "annotation-added", "");
        }
      );
      PDFJSAnnotate.getStoreAdapter().addEvent(
        "annotation:updated",
        (fingerprint, annotationId, annotation) => {
          arrayStoreAdapter.editAnnotation(
            fingerprint,
            annotationId,
            annotation
          );
          sendToRemote(
            annotation,
            fingerprint,
            "annotation-updated",
            annotationId
          );
        }
      );
      PDFJSAnnotate.getStoreAdapter().addEvent(
        "annotation:removed",
        (fingerprint, annotationId) => {
          arrayStoreAdapter.deleteAnnotation(fingerprint, annotationId).then((annotations) => {
            sendToRemote(annotations, fingerprint, "annotation-removed", "");
          });
        }
      );
      PDFJSAnnotate.getStoreAdapter().addEvent(
        "annotation:reset",
        (fingerprint) => {
          arrayStoreAdapter.resetAnnotation(fingerprint);
          sendToRemote("", fingerprint, "annotation-reset", "");
        }
      );
    }
  }, []);

  useEffect(() => {

    try {
      if (
        roomStore._state.annotatePdf.annotations &&
        roomStore._state.me.role != "teacher"
      ) {
        let annotate = roomStore._state.annotatePdf;
        let annotations = annotate.annotations;
        let pageNumber = annotate.annotations.annotations.page ? annotate.annotations.annotations.page : 1
        let svg;
        if (annotations.documentId != 1)
          svg = document.querySelector(
            `[data-pdf-annotate-document="${annotations.documentId}"][data-pdf-annotate-page="${pageNumber}"]`
          );
        if (roomStore._state.annotatePdf.status === "annotation-added") {
          arrayStoreAdapter
            .addAnnotation(annotations.documentId, annotations.annotations)
            .then(() => {
              arrayStoreAdapter
                .getAnnotations(annotations.documentId, pageNumber)
                .then((annotations) => {
                  return Promise.all([
                    PDFJSAnnotate.render(
                      svg,
                      JSON.parse(svg.getAttribute("data-pdf-annotate-viewport")),
                      annotations
                    ),
                  ]).then(() => {
                  });
                });
            });
        } else if (roomStore._state.annotatePdf.status === "annotation-updated") {
          arrayStoreAdapter
            .editAnnotation(
              annotations.documentId,
              roomStore._state.annotatePdf.annotationId,
              annotations.annotations
            )
            .then(() => {
              arrayStoreAdapter
                .getAnnotations(annotations.documentId, pageNumber)
                .then((annotations) => {
                  return Promise.all([
                    PDFJSAnnotate.render(
                      svg,
                      JSON.parse(svg.getAttribute("data-pdf-annotate-viewport")),
                      annotations
                    ),
                  ]).then(() => {
                  });
                });
            });
        } else if (roomStore._state.annotatePdf.status === "annotation-removed") {

          PDFJSAnnotate.getStoreAdapter().resetAnnotation(
            annotations.documentId,
            true
          );
          arrayStoreAdapter.resetAnnotation(annotations.documentId).then(() => {
            let annotationLayers = document.querySelectorAll(
              `[data-pdf-annotate-document="${annotations.documentId}"]`
            );
            annotationLayers.forEach(function (item) {
              item.innerHTML = "";
            });
          }).then(() => {
            annotations.annotations.forEach(element => {
              arrayStoreAdapter
                .addAnnotation(annotations.documentId, element)
                .then(() => {
                  arrayStoreAdapter
                    .getAnnotations(annotations.documentId, element.page)
                    .then((annotations) => {
                      svg = document.querySelector(
                        `[data-pdf-annotate-document="${annotations.documentId}"][data-pdf-annotate-page="${element.page}"]`)
                      return Promise.all([
                        PDFJSAnnotate.render(
                          svg,
                          JSON.parse(svg.getAttribute("data-pdf-annotate-viewport")),
                          annotations
                        ),
                      ]).then(() => {
                      });
                    });
                });
            });
          });
        } else if (roomStore._state.annotatePdf.status === "annotation-reset") {
          PDFJSAnnotate.getStoreAdapter().resetAnnotation(
            annotations.documentId,
            true
          );
          arrayStoreAdapter.resetAnnotation(annotations.documentId).then(() => {
            let annotationLayers = document.querySelectorAll(
              `[data-pdf-annotate-document="${annotations.documentId}"]`
            );
            annotationLayers.forEach(function (item) {
              item.innerHTML = "";
            });
          });
        } else if (roomStore._state.annotatePdf.status === "add-page") {
          fileState.fileDispatch({
            type: "remote-add-page",
            fileId: annotations.documentId,
          });
        } else if (roomStore._state.annotatePdf.status === "remove-page") {
          arrayStoreAdapter.resetAnnotation(
            roomStore._state.annotatePdf.annotationId
          );
          let annotationLayers = document.querySelectorAll(
            `[data-pdf-annotate-document="${roomStore._state.annotatePdf.annotationId}"]`
          );
          annotationLayers.forEach(function (item) {
            item.innerHTML = "";
          });
          fileState.fileDispatch({
            type: "remote-remove-page",
            fileId: annotations.documentId,
          });
        } else if (roomStore._state.annotatePdf.status === "next-page") {
          toggleNext();
        } else if (roomStore._state.annotatePdf.status === "prev-page") {
          togglePrev();
        } else if (roomStore._state.annotatePdf.status === "toggleFirstLast") {
          toggleFirstLast(roomStore._state.annotatePdf.annotationId);
        } else if (roomStore._state.annotatePdf.status === "sync-scroll") {
          document.querySelector(".media-board").scrollTop =
            roomStore._state.annotatePdf.annotationId;
        }
      }
    } catch (err) {
      // silent screen sharing error
    }
  }, [roomStore._state.annotatePdf.annotations]);


  function handleFullscreenChange(event) {
    if (!document.fullscreenElement) {
      setFullScreen(false)
    } else {
      setFullScreen(true)
    }
  }


  const handleFullScreen = () => {

    const board = document.getElementById('Board');

    // register listener to handle esc key and minimize
    board.onfullscreenchange = handleFullscreenChange;

    if (board.requestFullscreen && !fullScreen) {
      board.requestFullscreen();
    } else if (board.mozRequestFullScreen && !fullScreen) {
      /* Firefox */
      board.mozRequestFullScreen();
    } else if (board.webkitRequestFullscreen && !fullScreen) {
      /* Chrome, Safari and Opera */
      board.onwebkitfullscreenchange = handleFullscreenChange;
      board.webkitRequestFullscreen();
    } else if (board.msRequestFullscreen && !fullScreen) {
      /* IE/Edge */
      board.msRequestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  let currentPage = fileState.currentPage;
  let totalPage = fileState.totalPage;

  return (
    <>
      <div id="main-container">
        {elements}
      </div>
      {
        roomStore._state.me.role === "teacher" ?
          <span className='PageDetail'>
            <h3>Page {currentPage}/{totalPage}</h3>
          </span> : null
      }
      {
        !fullScreen ?
          <>
            <FullscreenOutlinedIcon onClick={handleFullScreen} className='FullScreen' />
            <span className="tooltiptext">Full Screen</span>
          </>
          :
          <>
            <FullscreenExitOutlinedIcon onClick={handleFullScreen} className='NormalScreen' />
            <span className="tooltiptext">Exit Full Screen</span>
          </>
      }
    </>
  );
};
export default Whiteboard;
