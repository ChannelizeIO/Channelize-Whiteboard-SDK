import PDFJSAnnotate from '../PDFJSAnnotate';
import appendChild from '../render/appendChild';
import {
  disableUserSelect,
  enableUserSelect,
  findSVGAtPoint,
  getMetadata,
  scaleDown,
  pointIntersectsRect
} from './utils';

let _enabled = false;
let _penSize;
let _penColor;
let path;
let currentSVG;
let currentGetMetadata;
let pathD;
let lines;
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
  path = null;
  lines = [];
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
  let svg = currentSVG;
  currentSVG = null;
  if (lines.length > 1 && svg) {
    let { documentId, pageNumber } = getMetadata(svg);
    PDFJSAnnotate.getStoreAdapter().addAnnotation(documentId, pageNumber, {
      type: 'drawing',
      width: _penSize,
      color: _penColor,
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
  e.stopPropagation();
  savePoint(e.clientX, e.clientY);
}

/**
 * Handle document.keyup event
 *
 * @param {Event} e The DOM event to be handled
 */
function handleDocumentKeyup(e) {
  e.stopPropagation();
  // Cancel rect if Esc is pressed
  if (e.keyCode === 27) {
    lines = null;
    currentSVG = null;
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
  }
}

let currentSVGBoundingClientRect;
/**
 * Save a point to the line being drawn.
 *
 * @param {Number} x The x coordinate of the point
 * @param {Number} y The y coordinate of the point
 */
function savePoint(x, y) {

  if (!currentSVG) {
    currentSVG = findSVGAtPoint(x, y);
    currentSVGBoundingClientRect = currentSVG.getBoundingClientRect();
  }
  let svg = currentSVG;
  if (!svg) {
    return;
  }
  let rect = currentSVGBoundingClientRect;
  if (!pointIntersectsRect(x, y, rect)) {
    return;
  }
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
    let d = [];
    for (let i = 0, l = lines.length; i < l; i++) {
      var p1 = lines[i];
      var p2 = lines[i + 1];
      if (p2) {
        d.push(`M ${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]}`);
      }
    }
    path.setAttribute('d', `${d.join(' ')} Z`);
    return;
  }

  path = appendChild(svg, {
    type: 'drawing',
    color: _penColor,
    width: _penSize,
    lines
  });
}

/**
 * Set the attributes of the pen.
 *
 * @param {Number} penSize The size of the lines drawn by the pen
 * @param {String} penColor The color of the lines drawn by the pen
 */
export function setPen(penSize = 1, penColor = '000000') {
  _penSize = parseInt(penSize, 10);
  _penColor = penColor;
}

/**
 * Enable the pen behavior
 */
export function enablePen() {
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
  document.addEventListener('keyup', handleDocumentKeyup);
  disableUserSelect();
}

/**
 * Disable the pen behavior
 */
export function disablePen() {
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
