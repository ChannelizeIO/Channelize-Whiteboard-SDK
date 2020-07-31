import PDFJSAnnotate from '../PDFJSAnnotate';
import appendChild from '../render/appendChild';

import {
  disableUserSelect,
  enableUserSelect,
  findSVGAtPoint,
  findAnnotationAtPointToErase,
  getMetadata,
  scaleDown
} from './utils';

let _enabled = false;
let _eraserSize = 4;
let _eraserColor = 'FFFFFF';
let path;
let lines;

let annotationIds = [];
let currentAnnotation;
let continueMove = 0;
let isEnablePointerEvents = false;
function checkForPointerEvents() {
  isEnablePointerEvents = true;
  document.removeEventListener('pointermove', checkForPointerEvents);
}

document.addEventListener('pointermove', checkForPointerEvents);

/**
 * Handle document.mousedown event
 */
function handleDocumentMousedown() {
  path = null;
  lines = [];
  if (isEnablePointerEvents) {
    document.addEventListener('pointermove', handleDocumentMousemove);
    document.addEventListener('pointerup', handleDocumentMouseup);
  } else {
    document.addEventListener('mousemove', handleDocumentMousemove);
    document.addEventListener('mouseup', handleDocumentMouseup);
  }

  //document.addEventListener('mousemove', handleDocumentMousemove);
  //document.addEventListener('mouseup', handleDocumentMouseup);
}

/**
 * Handle document.mouseup event
 *
 * @param {Event} e The DOM event to be handled
 */
function handleDocumentMouseup(e) {
  let svg;
  if (lines.length > 1 && (svg = findSVGAtPoint(e.clientX, e.clientY))) {
    let { documentId, pageNumber } = getMetadata(svg);
    if (path) {
      try {
        svg.removeChild(path);
      } catch (e) {

      }
    }
    /* PDFJSAnnotate.getStoreAdapter().addAnnotation(documentId, pageNumber, {
       type: 'drawing',
       width: _eraserSize,
       color: _eraserColor,
       lines
     }
     ).then((annotation) => {
      
 
       appendChild(svg, annotation);
     });*/
  }
  if (isEnablePointerEvents) {
    document.removeEventListener('pointermove', handleDocumentMousemove);
    document.removeEventListener('pointerup', handleDocumentMouseup);
  } else {
    document.removeEventListener('mousemove', handleDocumentMousemove);
    document.removeEventListener('mouseup', handleDocumentMouseup);
  }
  // document.removeEventListener('mousemove', handleDocumentMousemove);
  // document.removeEventListener('mouseup', handleDocumentMouseup);
}

/**
 * Handle document.mousemove event
 *
 * @param {Event} e The DOM event to be handled
 */
function handleDocumentMousemove(e) {
  const svg = findSVGAtPoint(e.clientX, e.clientY);
  if (!svg) {
    return;
  }

  let target = findAnnotationAtPointToErase(e.clientX, e.clientY);
  if (!target) {
    return;
  }

  const annotationId = target.getAttribute('data-pdf-annotate-id');
  //savePoint(e.clientX, e.clientY);
  if (currentAnnotation !== annotationId) {
    currentAnnotation = annotationId;
    continueMove = 0;
    return;
  }
  continueMove++;
  if (continueMove < 2) {
    return;
  }

  if (annotationIds.indexOf(annotationId) >= 0) {
    // return;
  }
  annotationIds.push(annotationId);
  let { documentId } = getMetadata(svg);
  deleteAnnotation(annotationId, documentId);
  // console.log(annotationIds);
}

/**
 * Delete currently selected annotation
 */
function deleteAnnotation(annotationId, documentId) {

  let nodes = document.querySelectorAll(`[data-pdf-annotate-id="${annotationId}"]`);
  [...nodes].forEach((n) => {
    n.parentNode.removeChild(n);
  });

  PDFJSAnnotate.getStoreAdapter().deleteAnnotation(documentId, annotationId);
}



/**
 * Handle document.keyup event
 *
 * @param {Event} e The DOM event to be handled
 */
function handleDocumentKeyup(e) {
  // Cancel rect if Esc is pressed
  if (e.keyCode === 27) {
    lines = null;
    try {
      path.parentNode.removeChild(path);
    } catch (e) {
    }
    if (isEnablePointerEvents) {
      document.removeEventListener('pointermove', handleDocumentMousemove);
      document.removeEventListener('pointerup', handleDocumentMouseup);
    } else {
      document.removeEventListener('mousemove', handleDocumentMousemove);
      document.removeEventListener('mouseup', handleDocumentMouseup);
    }
    //document.removeEventListener('mousemove', handleDocumentMousemove);
    //document.removeEventListener('mouseup', handleDocumentMouseup);
  }
}

/**
 * Save a point to the line being drawn.
 *
 * @param {Number} x The x coordinate of the point
 * @param {Number} y The y coordinate of the point
 */
function savePoint(x, y) {
  let svg = findSVGAtPoint(x, y);
  if (!svg) {
    return;
  }

  let rect = svg.getBoundingClientRect();
  let point = scaleDown(svg, {
    x: x - rect.left,
    y: y - rect.top
  });
  Object.keys(point).forEach((key) => {
    point[key] = (point[key]).toFixed(3);
  });
  lines.push(point);

  if (lines.length <= 1) {
    return;
  }

  if (path) {
    try {
      svg.removeChild(path);
    } catch (e) {
    }
  }

  path = appendChild(svg, {
    type: 'drawing',
    color: _eraserColor,
    width: _eraserSize,
    lines
  });
}

/**
 * Set the attributes of the eraser.
 *
 * @param {Number} eraserSize The size of the lines drawn by the eraser
 */
export function setEraser(eraserSize = 8) {
  _eraserSize = parseInt(eraserSize, 10);
}

/**
 * Enable the eraser behavior
 */
export function enableEraser() {
  if (_enabled) {
    return;
  }
  _enabled = true;
  if (isEnablePointerEvents) {
    document.addEventListener('pointerdown', handleDocumentMousedown);
    document.body && document.body.classList.add('touch-action-disable');
  } else {
    document.addEventListener('mousedown', handleDocumentMousedown);
  }
  //document.addEventListener('mousedown', handleDocumentMousedown);
  document.addEventListener('keyup', handleDocumentKeyup);
  disableUserSelect();
}

/**
 * Disable the eraser behavior
 */
export function disableEraser() {
  if (!_enabled) {
    return;
  }

  _enabled = false;
  if (isEnablePointerEvents) {
    document.removeEventListener('pointerdown', handleDocumentMousedown);
    document.body && document.body.classList.remove('touch-action-disable');
  } else {
    document.removeEventListener('mousedown', handleDocumentMousedown);
  }
  document.removeEventListener('keyup', handleDocumentKeyup);
  enableUserSelect();
}

