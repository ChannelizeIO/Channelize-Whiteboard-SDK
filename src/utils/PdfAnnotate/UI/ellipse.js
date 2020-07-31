import PDFJSAnnotate from '../PDFJSAnnotate';
import appendChild from '../render/appendChild';
import {
BORDER_COLOR,
        disableUserSelect,
        enableUserSelect,
        findSVGAtPoint,
        getMetadata,
        getOffset,
        scaleDown,
        scaleUp
} from './utils';

let _enabled = false;
let _type;
let overlay;
let originY;
let originX;


/**
 * Handle document.mousedown event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMousedown(e) {
  let svg;
  if (!(svg = findSVGAtPoint(e.clientX, e.clientY))) {
    return;
  }

  let rect = svg.getBoundingClientRect();
  originY = e.clientY;
  originX = e.clientX;

  overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.top = `${originY - rect.top}px`;
  overlay.style.left = `${originX - rect.left}px`;
  overlay.style.border = `3px solid ${BORDER_COLOR}`;
  overlay.style.borderRadius = '5%';
  svg.parentNode.appendChild(overlay);

  document.addEventListener('mousemove', handleDocumentMousemove);
  disableUserSelect();
}

/**
 * Handle document.mousemove event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMousemove(e) {
  let svg = overlay.parentNode.querySelector('svg.customAnnotationLayer');
  let rect = svg.getBoundingClientRect();

  if (originX + (e.clientX - originX) < rect.right) {
    overlay.style.width = `${e.clientX - originX}px`;
  }

  if (originY + (e.clientY - originY) < rect.bottom) {
    overlay.style.height = `${e.clientY - originY}px`;
  }
  overlay.style.borderRadius = "50%";
}

/**
 * Handle document.mouseup event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMouseup(e) {
  let rects;
  if (overlay) {
    let svg = overlay.parentNode.querySelector('svg.customAnnotationLayer');
    let rect = svg.getBoundingClientRect();
    let rx = parseInt(overlay.style.width, 10) / 2;
    let ry = parseInt(overlay.style.height, 10) / 2;
    saveEllipse({
      type: 'ellipse',
      cX: (parseInt(overlay.style.left, 10) + (rx)),
      cY: (parseInt(overlay.style.top, 10) + (ry)),
      rX: rx,
      rY: ry
    });

    overlay.parentNode.removeChild(overlay);
    overlay = null;

    document.removeEventListener('mousemove', handleDocumentMousemove);
    enableUserSelect();
  }
}

/**
 * Handle document.keyup event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentKeyup(e) {
  // Cancel rect if Esc is pressed
  if (e.keyCode === 27) {
    let selection = window.getSelection();
    selection.removeAllRanges();
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
      overlay = null;
      document.removeEventListener('mousemove', handleDocumentMousemove);
    }
  }
}

/**
 * Save a rect annotation
 *
 * @param {String} type The type of rect (area, highlight, strikeout, underline)
 * @param {Array} rects The rects to use for annotation
 * @param {String} color The color of the rects
 */
function saveEllipse(ellipse, color) {
  let svg = findSVGAtPoint(ellipse.cX - ellipse.rX, ellipse.cY- ellipse.rY);
  let node;
  let annotation;

  if (!svg) {
    return;
  }

  let boundingRect = svg.getBoundingClientRect();


  // Initialize the annotation
  annotation = scaleDown(svg, ellipse);
  annotation = {...annotation, type:'ellipse'};
  // Short circuit if no rectangles exist
  if (!annotation) {
    return;
  }


  let {documentId, pageNumber} = getMetadata(svg);

  // Add the annotation
  PDFJSAnnotate.getStoreAdapter().addAnnotation(documentId, pageNumber, annotation)
          .then((annotation) => {
            appendChild(svg, annotation);
          });
}

/**
 * Enable rect behavior
 */
export function enableEllipse() {


  if (_enabled) {
    return;
  }

  _enabled = true;
  document.addEventListener('mouseup', handleDocumentMouseup);
  document.addEventListener('mousedown', handleDocumentMousedown);
  document.addEventListener('keyup', handleDocumentKeyup);
}

/**
 * Disable rect behavior
 */
export function disableEllipse() {
  if (!_enabled) {
    return;
  }

  _enabled = false;
  document.removeEventListener('mouseup', handleDocumentMouseup);
  document.removeEventListener('mousedown', handleDocumentMousedown);
  document.removeEventListener('keyup', handleDocumentKeyup);
}

