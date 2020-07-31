import PDFJSAnnotate from '../PDFJSAnnotate';
import initColorPicker from '../utils/ColorPicker';
import appendChild from '../render/appendChild';
import normalizeColor from '../utils/normalizeColor';
import {
  addEventListener,
  removeEventListener
} from './event';
import {
  BORDER_COLOR,
  disableUserSelect,
  enableUserSelect,
  findSVGContainer,
  findSVGAtPoint,
  getAnnotationRect,
  getMetadata,
  scaleDown,
  scaleUp
} from './utils';

let _enabled = false;
let isDragging = false, overlay;
let dragOffsetX, dragOffsetY, dragStartX, dragStartY;
const OVERLAY_BORDER_SIZE = 3;

/**
 * Create an overlay for editing an annotation.
 *
 * @param {Element} target The annotation element to apply overlay for
 */
function createEditOverlay(target) {
  destroyEditOverlay();
  let id = target.getAttribute('data-pdf-annotate-id');
  let annotationId = id;
  let { documentId } = getMetadata(findSVGContainer(target));
  PDFJSAnnotate.getStoreAdapter().getAnnotation(documentId, annotationId).then((annotation) => {
    if (!annotation) {
      return;
    }
    overlay = document.createElement('div');
    let anchor = document.createElement('a');
    let svg = findSVGContainer(target);
    let parentNode = svg.parentNode;

    let rect = getAnnotationRect(target);
    let styleLeft = rect.left - OVERLAY_BORDER_SIZE;
    let styleTop = rect.top - OVERLAY_BORDER_SIZE;

    overlay.setAttribute('id', 'pdf-annotate-edit-overlay');
    overlay.setAttribute('data-target-id', id);
    overlay.style.boxSizing = 'content-box';
    overlay.style.position = 'absolute';
    overlay.style.top = `${styleTop}px`;
    overlay.style.left = `${styleLeft}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.border = `${OVERLAY_BORDER_SIZE}px dashed ${BORDER_COLOR}`;
    overlay.style.borderRadius = `${OVERLAY_BORDER_SIZE}px`;

    anchor.innerHTML = '×';
    anchor.setAttribute('href', 'javascript://');
    anchor.style.background = '#fff';
    anchor.style.borderRadius = '20px';
    anchor.style.border = '1px solid #bbb';
    anchor.style.color = '#bbb';
    anchor.style.fontSize = '16px';
    anchor.style.padding = '2px';
    anchor.style.textAlign = 'center';
    anchor.style.textDecoration = 'none';
    anchor.style.position = 'absolute';
    anchor.style.top = '-13px';
    anchor.style.right = '-13px';
    anchor.style.width = '25px';
    anchor.style.height = '25px';

    if (annotation.type === 'textbox' || annotation.type === 'drawing') {
      let textboxEdiTool = document.createElement('div');
      textboxEdiTool.style.position = 'absolute';
      textboxEdiTool.style.top = '-23px';
      textboxEdiTool.style.left = '10px';
      textboxEdiTool.style.padding = '5px';
      textboxEdiTool.style.background = '#fff';
      textboxEdiTool.style.borderRadius = '10px';
      textboxEdiTool.style.padding = '5px';
      textboxEdiTool.style.border = '1px solid #bbb';
      let selectFontSize = document.createElement('select');
      selectFontSize.style.padding = '0 5px';
      let sizeRange = [], defaultSize = 1;
      if (annotation.type === 'drawing') {
        for (var i = 1; i <= 20; i++) {
          sizeRange.push(i);
        }
        defaultSize = annotation.width;
      } else {
        sizeRange = [8, 9, 10, 11, 12, 14, 18, 24, 30, 36, 48, 60, 72, 96];
        defaultSize = annotation.size;
      }
      sizeRange.forEach(function(s) {
        selectFontSize.appendChild(new Option(s, s));
      });
      selectFontSize.value = defaultSize;
      selectFontSize.addEventListener('click', function(event) {
        event.stopPropagation();
      });
      selectFontSize.addEventListener('change', (event) => {
        event.stopPropagation();
        if (annotation.type === 'drawing') {
          let rect = parentNode.getBoundingClientRect();
          let minX = 10000000000, minY = 10000000000;
          annotation.lines.forEach((point) => {
            if (minX > point[0]) {
              minX = parseInt(point[0], 10);
            }
            if (minY > point[1]) {
              minY = parseInt(point[1], 10);
            }
          });
          let deltaSize = selectFontSize.value / annotation.width;
          annotation.lines.forEach((point, index) => {
            annotation.lines[index][0] = (minX + ((point[0] - minX) * deltaSize)).toFixed(3);
            annotation.lines[index][1] = (minY + ((point[1] - minY) * deltaSize)).toFixed(3);
          });
          annotation.width = selectFontSize.value;
        } else {
          annotation.height = annotation.height * (selectFontSize.value / annotation.size);
          annotation.width = annotation.width * (selectFontSize.value / annotation.size);
          annotation.size = selectFontSize.value;
        }
        PDFJSAnnotate.getStoreAdapter().editAnnotation(documentId, annotationId, annotation);
        target.parentNode.removeChild(target);
        target = appendChild(svg, annotation);
        let rect = getAnnotationRect(target);
        overlay.style.width = `${rect.width}px`;
        overlay.style.height = `${rect.height}px`;
        let styleLeft = rect.left - OVERLAY_BORDER_SIZE;
        let styleTop = rect.top - OVERLAY_BORDER_SIZE;
        overlay.style.top = `${styleTop}px`;;
        overlay.style.left = `${styleLeft}px`;
      });
      textboxEdiTool.appendChild(selectFontSize);
      let textColorPicker = document.createElement('div');
      textColorPicker.setAttribute('class', 'text-color');
      textColorPicker.style.padding = '0 5px';
      textboxEdiTool.appendChild(textColorPicker);
      overlay.appendChild(textboxEdiTool);
      initColorPicker(textColorPicker, annotation.color, function(value) {
        annotation.color = value;
        PDFJSAnnotate.getStoreAdapter().editAnnotation(documentId, annotationId, annotation);
        if (annotation.type === 'drawing') {
          target.setAttribute('stroke', normalizeColor(value));
        } else {
          target.setAttribute('fill', normalizeColor(value));
        }
      });
      overlay.addEventListener('mouseover', () => {
        if (!isDragging) {
          textboxEdiTool.style.display = '';
        }
      });
      overlay.addEventListener('mouseout', () => {
        textboxEdiTool.style.display = 'none';
      });
    }

    overlay.appendChild(anchor);
    parentNode.appendChild(overlay);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keyup', handleDocumentKeyup);
    document.addEventListener('mousedown', handleDocumentMousedown);
    anchor.addEventListener('click', deleteAnnotation);
    anchor.addEventListener('mouseover', () => {
      anchor.style.color = '#35A4DC';
      anchor.style.borderColor = '#999';
      anchor.style.boxShadow = '0 1px 1px #ccc';
    });
    anchor.addEventListener('mouseout', () => {
      anchor.style.color = '#bbb';
      anchor.style.borderColor = '#bbb';
      anchor.style.boxShadow = '';
    });
    overlay.addEventListener('mouseover', () => {
      if (!isDragging) {
        anchor.style.display = '';
      }
    });
    overlay.addEventListener('mouseout', () => {
      anchor.style.display = 'none';
    });
  });
}

/**
 * Destroy the edit overlay if it exists.
 */
function destroyEditOverlay() {
  if (overlay && overlay.parentNode) {
    overlay.parentNode.removeChild(overlay);
    overlay = null;
  }

  document.removeEventListener('click', handleDocumentClick);
  document.removeEventListener('keyup', handleDocumentKeyup);
  document.removeEventListener('mousedown', handleDocumentMousedown);
  document.removeEventListener('mousemove', handleDocumentMousemove);
  document.removeEventListener('mouseup', handleDocumentMouseup);
  enableUserSelect();
}

/**
 * Delete currently selected annotation
 */
function deleteAnnotation() {
  if (!overlay) {
    return;
  }

  let annotationId = overlay.getAttribute('data-target-id');
  let nodes = document.querySelectorAll(`[data-pdf-annotate-id="${annotationId}"]`);
  let svg = overlay.parentNode.querySelector('svg.customAnnotationLayer');
  let { documentId } = getMetadata(svg);

  [...nodes].forEach((n) => {
    n.parentNode.removeChild(n);
  });

  PDFJSAnnotate.getStoreAdapter().deleteAnnotation(documentId, annotationId);

  destroyEditOverlay();
}

/**
 * Handle document.click event
 *
 * @param {Event} e The DOM event that needs to be handled
 */
function handleDocumentClick(e) {
  if (!findSVGAtPoint(e.clientX, e.clientY)) {
    return;
  }

  // Remove current overlay
  let overlay = document.getElementById('pdf-annotate-edit-overlay');
  if (overlay) {
    if (isDragging || e.target === overlay) {
      return;
    }

    destroyEditOverlay();
  }
}

/**
 * Handle document.keyup event
 *
 * @param {Event} e The DOM event that needs to be handled
 */
function handleDocumentKeyup(e) {
  if (overlay && e.keyCode === 46 &&
    e.target.nodeName.toLowerCase() !== 'textarea' &&
    e.target.nodeName.toLowerCase() !== 'input') {
    deleteAnnotation();
  }
}

/**
 * Handle document.mousedown event
 *
 * @param {Event} e The DOM event that needs to be handled
 */
function handleDocumentMousedown(e) {
  if (e.target !== overlay) {
    return;
  }

  // Highlight and strikeout annotations are bound to text within the document.
  // It doesn't make sense to allow repositioning these types of annotations.
  let annotationId = overlay.getAttribute('data-target-id');
  let target = document.querySelector(`[data-pdf-annotate-id="${annotationId}"]`);
  let type = target.getAttribute('data-pdf-annotate-type');

  if (type === 'highlight' || type === 'strikeout' || type === 'underline') {
    return;
  }

  isDragging = true;
  dragOffsetX = e.clientX;
  dragOffsetY = e.clientY;
  dragStartX = overlay.offsetLeft;
  dragStartY = overlay.offsetTop;

  overlay.style.background = 'rgba(255, 255, 255, 0.7)';
  overlay.style.cursor = 'move';
  overlay.querySelector('a').style.display = 'none';

  document.addEventListener('mousemove', handleDocumentMousemove);
  document.addEventListener('mouseup', handleDocumentMouseup);
  disableUserSelect();
}

/**
 * Handle document.mousemove event
 *
 * @param {Event} e The DOM event that needs to be handled
 */
function handleDocumentMousemove(e) {
  let annotationId = overlay.getAttribute('data-target-id');
  let parentNode = overlay.parentNode;
  let rect = parentNode.getBoundingClientRect();
  let y = (dragStartY + (e.clientY - dragOffsetY));
  let x = (dragStartX + (e.clientX - dragOffsetX));
  let minY = 0;
  let maxY = rect.height;
  let minX = 0;
  let maxX = rect.width;

  if (y > minY && y + overlay.offsetHeight < maxY) {
    overlay.style.top = `${y}px`;
  }

  if (x > minX && x + overlay.offsetWidth < maxX) {
    overlay.style.left = `${x}px`;
  }
}

/**
 * Handle document.mouseup event
 *
 * @param {Event} e The DOM event that needs to be handled
 */
function handleDocumentMouseup(e) {
  let annotationId = overlay.getAttribute('data-target-id');
  let target = document.querySelectorAll(`[data-pdf-annotate-id="${annotationId}"]`);
  let type = target[0].getAttribute('data-pdf-annotate-type');
  let svg = overlay.parentNode.querySelector('svg.customAnnotationLayer');
  let { documentId } = getMetadata(svg);

  overlay.querySelector('a').style.display = '';

  function getDelta(propX, propY) {
    return calcDelta(parseInt(target[0].getAttribute(propX), 10), parseInt(target[0].getAttribute(propY), 10));
  }

  function calcDelta(x, y) {
    return {
      deltaX: OVERLAY_BORDER_SIZE + scaleDown(svg, { x: overlay.offsetLeft }).x - x,
      deltaY: OVERLAY_BORDER_SIZE + scaleDown(svg, { y: overlay.offsetTop }).y - y
    };
  }

  PDFJSAnnotate.getStoreAdapter().getAnnotation(documentId, annotationId).then((annotation) => {
    if (['area', 'highlight', 'point', 'textbox'].indexOf(type) > -1) {
      let { deltaX, deltaY } = getDelta('x', 'y');
      [...target].forEach((t, i) => {
        if (deltaY !== 0) {
          let modelY = parseInt(t.getAttribute('y'), 10) + deltaY;
          let viewY = modelY;

          if (type === 'textbox') {
            viewY += annotation.size;
          }

          if (type === 'point') {
            viewY = scaleUp(svg, { viewY }).viewY;
          }

          t.setAttribute('y', viewY);
          if (annotation.rectangles) {
            annotation.rectangles[i].y = modelY;
          } else if (annotation.y) {
            annotation.y = modelY;
          }
        }
        if (deltaX !== 0) {
          let modelX = parseInt(t.getAttribute('x'), 10) + deltaX;
          let viewX = modelX;

          if (type === 'point') {
            viewX = scaleUp(svg, { viewX }).viewX;
          }

          t.setAttribute('x', viewX);
          if (annotation.rectangles) {
            annotation.rectangles[i].x = modelX;
          } else if (annotation.x) {
            annotation.x = modelX;
          }
          if (type === 'textbox' && t.parentNode) {
            t.parentNode.removeChild(t);
            appendChild(svg, annotation);
          }
        }
      });
      // } else if (type === 'strikeout') {
      //   let { deltaX, deltaY } = getDelta('x1', 'y1');
      //   [...target].forEach(target, (t, i) => {
      //     if (deltaY !== 0) {
      //       t.setAttribute('y1', parseInt(t.getAttribute('y1'), 10) + deltaY);
      //       t.setAttribute('y2', parseInt(t.getAttribute('y2'), 10) + deltaY);
      //       annotation.rectangles[i].y = parseInt(t.getAttribute('y1'), 10);
      //     }
      //     if (deltaX !== 0) {
      //       t.setAttribute('x1', parseInt(t.getAttribute('x1'), 10) + deltaX);
      //       t.setAttribute('x2', parseInt(t.getAttribute('x2'), 10) + deltaX);
      //       annotation.rectangles[i].x = parseInt(t.getAttribute('x1'), 10);
      //     }
      //   });
    } else if (type === 'drawing') {
      let rect = scaleDown(svg, getAnnotationRect(target[0]));
      let [originX, originY] = annotation.lines[0];
      let { deltaX, deltaY } = calcDelta(originX, originY);

      // origin isn't necessarily at 0/0 in relation to overlay x/y
      // adjust the difference between overlay and drawing coords
      deltaY += (originY - rect.top);
      deltaX += (originX - rect.left);
      annotation.lines.forEach((line, i) => {
        let [x, y] = annotation.lines[i];
        annotation.lines[i][0] = parseInt(x, 10) + deltaX;
        annotation.lines[i][1] = parseInt(y, 10) + deltaY;
      });

      target[0].parentNode.removeChild(target[0]);
      appendChild(svg, annotation);
    }

    PDFJSAnnotate.getStoreAdapter().editAnnotation(documentId, annotationId, annotation);
  });

  setTimeout(() => {
    isDragging = false;
  }, 0);

  overlay.style.background = '';
  overlay.style.cursor = '';

  document.removeEventListener('mousemove', handleDocumentMousemove);
  document.removeEventListener('mouseup', handleDocumentMouseup);
  enableUserSelect();
}

/**
 * Handle annotation.click event
 *
 * @param {Element} e The annotation element that was clicked
 */
function handleAnnotationClick(target) {
  createEditOverlay(target);
}

/**
 * Enable edit mode behavior.
 */
export function enableEdit() {
  if (_enabled) {
    return;
  }

  _enabled = true;
  addEventListener('annotation:click', handleAnnotationClick);
}
;

/**
 * Disable edit mode behavior.
 */
export function disableEdit() {
  destroyEditOverlay();

  if (!_enabled) {
    return;
  }

  _enabled = false;
  removeEventListener('annotation:click', handleAnnotationClick);
}
;

