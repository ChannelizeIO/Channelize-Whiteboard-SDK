import PDFJSAnnotate from '../PDFJSAnnotate';
import appendChild from '../render/appendChild';
import {
BORDER_COLOR,
  findSVGAtPoint,
  disableUserSelect,
  enableUserSelect,
  getMetadata,
  scaleDown,
  getAnnotationRect,
  findAnnotationAtPoint
  } from './utils';

import uuid from '../utils/uuid';
let _enabled = false;
let input;
let _textSize;
let _textColor;
let _tickSize;
let _orgTextSize;
let _orgTextColor;
let _orgTickSize;
let annotationId;
let startClientX = 0;
let startClientY = 0;
let clientY = 0;
let clientX = 0;
let syncString = '';
let textElement;
let perLineHeight;
let textDivElement = document.createElement('div');
textDivElement.style.position = 'absolute';
textDivElement.style.top = `-111px`;
textDivElement.style.left = `-111spx`;
textDivElement.style.opacity = 0;
textDivElement.style.whiteSpace = 'nowrap';
document.body.appendChild(textDivElement);
let isEnablePressEvents = false;
function checkForPressEvents() {
  isEnablePressEvents = true;
  document.removeEventListener('pointermove', checkForPressEvents);
}
document.addEventListener('pointermove', checkForPressEvents);
/**
 * Handle document.mouseup event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMouseup(e) {
  if (input || !findSVGAtPoint(e.clientX, e.clientY)) {
    return;
  }

  var getCompareParentNode = (node, compareNode) => {
    let parentNode = node;
    while ((parentNode = parentNode.parentNode) &&
      parentNode !== document) {
      if (parentNode === compareNode) {
        return parentNode;
      }
    }
    return null;
  };
  let svg = findSVGAtPoint(e.clientX, e.clientY);
  if (!getCompareParentNode(e.target, svg.parentNode)) {
    return;
  }
  let target = findAnnotationAtPoint(e.clientX, e.clientY);
  let {viewport, documentId} = getMetadata(svg);
  let rect = svg.getBoundingClientRect();
  input = document.createElement('textarea');
  const setTextBox = () => {
    input = document.createElement('textarea');
    input.setAttribute('id', 'pdf-annotate-text-input');
    input.setAttribute('placeholder', 'Enter text');
    input.style.borderWidth = 0;
    input.style.padding = '0 5px';
    input.style.borderBottom = `2px solid ${BORDER_COLOR}`;
    input.style.borderRadius = '3px';
    input.style.position = 'absolute';
    input.style.outline = '1px solid transparent';
    clientY = e.clientY;
    clientX = e.clientX;
    input.addEventListener('blur', handleInputBlur);
    input.addEventListener('keyup', handleInputKeyup);
  }
  const setNewTextBox = () => {
    setTextBox();
    startClientY = e.clientY - rect.top;
    startClientX = e.clientX - rect.left;
    input.style.top = `${startClientY}px`;
    input.style.left = `${startClientX}px`;
    input.style.color = _textColor;
    input.style.fontSize = `${(_textSize * viewport.scale)}px`;
    input.style.lineHeight = `${(_textSize * viewport.scale) + 10}px`;
    input.style.width = ((rect.width * 0.9) - (startClientX)) + 'px';
    perLineHeight = ((_textSize + 5) * viewport.scale);
    input.style.height = `${(perLineHeight * 2)}px`;
    svg.parentNode.appendChild(input);
    input.focus();
  }

  if (target && target.getAttribute('data-pdf-annotate-type') === 'textbox') {
    annotationId = target.getAttribute('data-pdf-annotate-id');
    PDFJSAnnotate.getStoreAdapter().getAnnotation(documentId, annotationId).then((annotation) => {
      if (!annotation) {
        input = null;
        return;
      }
      textElement = target;
      setTextBox();
      startClientY = annotation.y * viewport.scale;
      startClientX = annotation.x * viewport.scale;
      _orgTextSize = _textSize;
      _orgTextColor = _textColor;
      setText(annotation.size, annotation.color);
      input.style.top = `${startClientY}px`;
      input.style.left = `${startClientX}px`;
      input.style.color = _textColor;
      input.style.fontSize = `${(_textSize * viewport.scale)}px`;
      input.style.lineHeight = `${(_textSize * viewport.scale) + 10}px`;
      input.style.width = ((rect.width * 0.9) - (startClientX)) + 'px';
      perLineHeight = ((_textSize + 5) * viewport.scale);
      input.style.height = `${perLineHeight * 2}px`;
      input.value = annotation.content;
      svg.parentNode.appendChild(input);
      input.focus();
      resetHeight();
    });
  } else {
    setNewTextBox();
  }
}

/**
 * Handle input.blur event
 */
function handleInputBlur() {
  saveText();
}

/**
 * Handle input.keyup event
 *
 * @param {Event} e The DOM event to handle
 */
function handleInputKeyup(e) {
  resetHeight();
  if (e.keyCode === 27) {
    closeInput();
  } else if (e.keyCode === 13) {
    saveText(false);
  } else if (e.keyCode === 32) {
    saveText(false);
  } else {
    saveText(false);
  }
}

function resetHeight() {
  syncString = input.value;
  let rawString = input.value;
  textDivElement.style.fontSize = input.style.fontSize;
  let lines = syncString.split("\n");
  let lastLine = lines[lines.length - 1];
  textDivElement.innerHTML = lastLine;
  let widthDiff = textDivElement.scrollWidth - (input.clientWidth - 10);
  if (widthDiff > 2) {
    let splitStr = syncString.split(" ");
    if (splitStr.length > 1) {
      var diffIndex = rawString.length === syncString.length ? 3 : 2;
      splitStr[splitStr.length - diffIndex] += "[NewLINE]";
      syncString = splitStr.join(" ").replace('[NewLINE] ', "\n");
      if (rawString.length > syncString.length) {
        syncString += " ";
      }
      input.value = syncString;
    }
    let lsplitStr = lastLine.split(" ");
    let diff = (input.clientWidth) / textDivElement.scrollWidth;
    if (lsplitStr.length === 1 && diff < 1.1) {
      let lastchar = lastLine.length - parseInt(lastLine.length * diff, 10);
      lastchar = lastchar > 3 ? lastchar : 3;
      syncString = input.value;
      syncString = syncString.substring(0, syncString.length - lastchar) + "\n" + syncString.substring(syncString.length - lastchar, syncString.length);
      input.value = syncString;
    }

  }

  let height;
  height = (textElement ? (textElement.querySelectorAll('tspan').length + 1) * perLineHeight : perLineHeight * 2) + 10;
  input.style.height = `${height}px`;
}

function reset() {
  annotationId = false;
  textElement = null;
  syncString = '';
  startClientY = 0;
  startClientX = 0;
  clientY = 0;
  clientX = 0;
  perLineHeight = 0;

}
/**
 * Save a text annotation from input
 */
function saveText(hasClose = true) {
  let svg = findSVGAtPoint(clientX, clientY);
  if (!svg) {
    return;
  }

  let {viewport, documentId, pageNumber} = getMetadata(svg);
  if (input.value.trim().length > 0) {
    let annotation = Object.assign({
      type: 'textbox',
      size: _textSize,
      color: _textColor,
      tick: _tickSize,
      content: input.value
    }, scaleDown(svg, {
      x: startClientX,
      y: startClientY,
      width: input.offsetWidth,
      height: input.offsetHeight * viewport.scale
    }));

    if (annotationId) {
      PDFJSAnnotate.getStoreAdapter().getAnnotation(documentId, annotationId).then((saveAnnotation) => {
        annotation = Object.assign(saveAnnotation, annotation);
        PDFJSAnnotate.getStoreAdapter().editAnnotation(documentId, annotationId, annotation).then((annotation) => {
          if (textElement && textElement.parentNode) {
            textElement.parentNode.removeChild(textElement);
          }
          if (hasClose) {
            setTimeout(() => {
              let nodes = document.querySelectorAll(`[data-pdf-annotate-id="${annotation.uuid}"]`);
              [...nodes].forEach((n) => {
                n.parentNode.removeChild(n);
              });
              textElement = appendChild(svg, annotation);
            }, 200);
          }
          textElement = appendChild(svg, annotation);
        });
      });
    } else {
      annotationId = uuid();
      annotation.uuid = annotationId;
      PDFJSAnnotate.getStoreAdapter().addAnnotation(documentId, pageNumber, annotation).then((annotation) => {
        textElement = appendChild(svg, annotation);
        if (hasClose) {
          setTimeout(() => {
            let nodes = document.querySelectorAll(`[data-pdf-annotate-id="${annotation.uuid}"]`);
            [...nodes].forEach((n) => {
              n.parentNode.removeChild(n);
            });
            textElement = appendChild(svg, annotation);
          }, 200);
        }
        textElement = appendChild(svg, annotation);
      });
    }
  } else if (annotationId) {
    (function (deleteAnnotationId) {
      let annotationId = deleteAnnotationId;
      PDFJSAnnotate.getStoreAdapter().deleteAnnotation(documentId, annotationId).then(() => {
        setTimeout(() => {
          let nodes = document.querySelectorAll(`[data-pdf-annotate-id="${annotationId}"]`);
          [...nodes].forEach((n) => {
            n.parentNode.removeChild(n);
          });
        }, 200);
      });
    })(annotationId);
    annotationId = false;
  }
  if (hasClose) {
    closeInput();
}
}

/**
 * Close the input
 */
function closeInput() {
  if (input) {
    input.removeEventListener('blur', handleInputBlur);
    input.removeEventListener('keyup', handleInputKeyup);
    input.parentNode.removeChild(input);
    input = null;
  }
  if (_orgTextSize && _orgTextColor) {
    setText(_orgTextSize, _orgTextColor);
    _orgTextSize = null;
    _orgTextColor = null;
  }

  reset();
}

/**
 * Set the text attributes
 *
 * @param {Number} textSize The size of the text
 * @param {String} textColor The color of the text
 */
export function setText(textSize = 12, textColor = '000000', tickSize = 0) {
  _textSize = parseInt(18);
  _textColor = textColor;
  _tickSize = tickSize;
}


/**
 * Enable text behavior
 */
export function enableText() {
  if (_enabled) {
    return;
  }

  _enabled = true;
  if (isEnablePressEvents) {
    document.addEventListener('pointerup', handleDocumentMouseup);
    document.body && document.body.classList.add('touch-action-disable');
  } else {
    document.addEventListener('mouseup', handleDocumentMouseup);
  }
  disableUserSelect();
}


/**
 * Disable text behavior
 */
export function disableText() {
  if (!_enabled) {
    return;
  }

  _enabled = false;
  if (isEnablePressEvents) {
    document.removeEventListener('pointerup', handleDocumentMouseup);
    document.body && document.body.classList.remove('touch-action-disable');
  } else {
    document.removeEventListener('mouseup', handleDocumentMouseup);
  }
  enableUserSelect();
}

