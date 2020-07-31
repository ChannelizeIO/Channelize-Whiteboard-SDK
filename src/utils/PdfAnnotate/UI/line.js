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
let _lineSize = 1;
let _lineColor = "#ff0000";
let point;
let line;
let originY;
let originX;

let isEnablePointerEvents = false;
function checkForPointerEvents() {
  isEnablePointerEvents = true;
  document.removeEventListener('pointermove', checkForPointerEvents);
}

document.addEventListener('pointermove', checkForPointerEvents);

/**
 * Handle document.mousedown event
 */
function handleDocumentMousedown(e) {
  let svg;
  if (!(svg = findSVGAtPoint(e.clientX, e.clientY))) {
    return;
  }
  originY = e.clientY;
  originX = e.clientX;
  point = {};
  line = null;
  if (isEnablePointerEvents) {
    document.addEventListener('pointermove', handleDocumentMousemove);
    document.addEventListener('pointerup', handleDocumentMouseup);
  } else {
    document.addEventListener('mousemove', handleDocumentMousemove);
    document.addEventListener('mouseup', handleDocumentMouseup);
  }
}

/**
 * Handle document.mouseup event
 *
 * @param {Event} e The DOM event to be handled
 */
function handleDocumentMouseup(e) {
  let svg;
  if (point && line && (svg = findSVGAtPoint(e.clientX, e.clientY))) {
    let {documentId, pageNumber} = getMetadata(svg);

    PDFJSAnnotate.getStoreAdapter().addAnnotation(documentId, pageNumber, {
      type: 'line',
      width: _lineSize,
      color: _lineColor,
      x1: point.x1,
      x2: point.x2,
      y1: point.y1,
      y2: point.y2
    }
    ).then((annotation) => {
      if (line) {
        try {
          svg.removeChild(line);
        } catch (e) {
        }
      }

      appendChild(svg, annotation);
    });
  }
  if (isEnablePointerEvents) {
    document.removeEventListener('pointermove', handleDocumentMousemove);
    document.removeEventListener('pointerup', handleDocumentMouseup);
  } else {
    document.removeEventListener('mousemove', handleDocumentMousemove);
    document.removeEventListener('mouseup', handleDocumentMouseup);
  }
}

/**
 * Handle document.mousemove event
 *
 * @param {Event} e The DOM event to be handled
 */
function handleDocumentMousemove(e) {
  let svg = findSVGAtPoint(e.clientX, e.clientY);

  let rect = svg.getBoundingClientRect();
  let targetX = e.clientX;
  let targetY = e.clientY;
  if (originX === targetX && targetY === originY) {
    return;
  }
  if (originX + (targetX - originX) > rect.right) {
    targetX = originX + (targetX - originX);
  }

  if (originY + (targetY - originY) > rect.bottom) {
    targetY = originY + (targetY - originY);
  }

  savePoint(targetX, targetY);
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
  point = scaleDown(svg, {
    x1: originX - rect.left,
    y1: originY - rect.top,
    x2: x - rect.left,
    y2: y - rect.top,
  });
  Object.keys(point).forEach((key) => {
    point[key] = (point[key]).toFixed(3);
  });



  if (line) {
    try {
      svg.removeChild(line);
    } catch (e) {

    }
  }

  line = appendChild(svg, {
    type: 'line',
    color: _lineColor,
    width: _lineSize,
    x1: point.x1,
    x2: point.x2,
    y1: point.y1,
    y2: point.y2
  });

}

/**
 * Set the attributes of the line.
 *
 * @param {Number} lineSize The size of the lines drawn by the line
 * @param {String} lineColor The color of the lines drawn by the line
 */
export function setLine(lineSize = 2, lineColor = '000000') {
  _lineSize = parseInt(lineSize, 10);
  _lineColor = lineColor;
}

/**
 * Enable the line behavior
 */
export function enableLine() {
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
  disableUserSelect();
}

/**
 * Disable the line behavior
 */
export function disableLine() {
  if (!_enabled) {
    return;
  }

  _enabled = false;
  point = {};
  line = null;
  if (isEnablePointerEvents) {
    document.removeEventListener('pointerdown', handleDocumentMousedown);
    document.body && document.body.classList.remove('touch-action-disable');
  } else {
    document.removeEventListener('mousedown', handleDocumentMousedown);
  }
  enableUserSelect();
}

