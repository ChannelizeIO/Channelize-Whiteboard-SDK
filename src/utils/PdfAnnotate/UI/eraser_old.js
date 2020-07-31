import PDFJSAnnotate from '../PDFJSAnnotate';
import appendChild from '../render/appendChild';
import {
disableUserSelect,
        enableUserSelect,
        findSVGAtPoint,
        getMetadata,
        scaleDown
        } from './utils';

let _enabled = false;
let _eraserSize;
let _eraserColor = 'FFFFFF';
let path;
let lines;

/**
 * Handle document.mousedown event
 */
function handleDocumentMousedown() {
  path = null;
  lines = [];

  document.addEventListener('mousemove', handleDocumentMousemove);
  document.addEventListener('mouseup', handleDocumentMouseup);
}

/**
 * Handle document.mouseup event
 *
 * @param {Event} e The DOM event to be handled
 */
function handleDocumentMouseup(e) {
  let svg;
  if (lines.length > 1 && (svg = findSVGAtPoint(e.clientX, e.clientY))) {
    let {documentId, pageNumber} = getMetadata(svg);

    PDFJSAnnotate.getStoreAdapter().addAnnotation(documentId, pageNumber, {
      type: 'drawing',
      width: _eraserSize,
      color: _eraserColor,
      lines
    }
    ).then((annotation) => {
      if (path) {
        try {
          svg.removeChild(path);
        } catch (e) {

        }
      }

      appendChild(svg, annotation);
    });
  }

  document.removeEventListener('mousemove', handleDocumentMousemove);
  document.removeEventListener('mouseup', handleDocumentMouseup);
}

/**
 * Handle document.mousemove event
 *
 * @param {Event} e The DOM event to be handled
 */
function handleDocumentMousemove(e) {
  savePoint(e.clientX, e.clientY);
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
    document.removeEventListener('mousemove', handleDocumentMousemove);
    document.removeEventListener('mouseup', handleDocumentMouseup);
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
  lines.push([point.x, point.y]);

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
  document.addEventListener('mousedown', handleDocumentMousedown);
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
  document.removeEventListener('mousedown', handleDocumentMousedown);
  document.removeEventListener('keyup', handleDocumentKeyup);
  enableUserSelect();
}

