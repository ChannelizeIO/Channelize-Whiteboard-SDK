/* eslint-disable no-unused-expressions */
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
let _penSize;
let _penColor;
let path;
let lines;
let isEnablePointerEvents = false;
let lastVacuateIndex = 0;

let bufferSize;
var svgElement;
var rectNew;
let pathNew = null;
let strPath;
let buffer = [];


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
  lastVacuateIndex = 0;
  if (isEnablePointerEvents) {
    document.addEventListener('pointermove', handleDocumentMousemove);
    document.addEventListener('pointerup', handleDocumentMouseup);
  } else {
    document.addEventListener('mousemove', handleDocumentMousemove);
    document.addEventListener('mouseup', handleDocumentMouseup);
  }
    svgElement = document.getElementsByClassName('customAnnotationLayer')[0];
    rectNew = svgElement.getBoundingClientRect();

    bufferSize = 6;
    pathNew = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathNew.setAttribute("fill", "none");
    pathNew.setAttribute("stroke", _penColor);
    pathNew.setAttribute("stroke-width", _penSize);
    buffer = [];
    var pt = getMousePosition(e);
    appendToBuffer(pt);
    strPath = "M" + pt.x + " " + pt.y;
    pathNew.setAttribute("d", strPath);
    pathNew.setAttribute('data-pdf-annotate-type', 'drawing');
    pathNew.setAttribute('aria-hidden', true);
    svgElement.appendChild(pathNew);
}
 
var getMousePosition = function (e) {
    return {
        x: e.pageX - rectNew.left,
        y: e.pageY - rectNew.top
    }
};

var appendToBuffer = function (pt) {
    buffer.push(pt);
    // lines.push(pt)
    while (buffer.length > bufferSize) {
        buffer.shift();
    }
};

/**
 * Handle document.mouseup event
 *
 * @param {Event} e The DOM event to be handled
 */
function handleDocumentMouseup(e) {
  let svg;
  if (lines.length > 1 && (svg = findSVGAtPoint(e.clientX, e.clientY))) {
    let { documentId, pageNumber } = getMetadata(svg);
    console.log(documentId);
    console.log(pageNumber);
    lines = vacuatePoints(0, lines, _penSize);
    PDFJSAnnotate.getStoreAdapter().addAnnotation(documentId, pageNumber, {
      type: 'drawing',
      width: _penSize,
      color: _penColor,
      lines
    }).then((annotation) => {
      // if (path) {
      //   try {
      //     svg.removeChild(path);
      //   } catch (e) {

      //   }
      // }

      // appendChild(svg,  {
      //   type: 'drawing',
      //   color: _penColor,
      //   width: _penSize,
      //   lines
      // });
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
  // e.stopPropagation();
  if (pathNew) {
    appendToBuffer(getMousePosition(e));
    updateSvgPath();
  }
  savePoint(e.clientX, e.clientY);
}

// Calculate the average point, starting at offset in the buffer
var getAveragePoint = function (offset) {
    var len = buffer.length;
    if (len % 2 === 1 || len >= bufferSize) {
        var totalX = 0;
        var totalY = 0;
        var pt, i;
        var count = 0;
        for (i = offset; i < len; i++) {
            count++;
            pt = buffer[i];
            totalX += pt.x;
            totalY += pt.y;
        }
        return {
            x: totalX / count,
            y: totalY / count
        }
    }
    return null;
};

var updateSvgPath = function () {
    var pt = getAveragePoint(0);

    if (pt) {
        // Get the smoothed part of the path that will not change
        strPath += " L" + pt.x + " " + pt.y;

        // Get the last part of the path (close to the current mouse position)
        // This part will change if the mouse moves again
        var tmpPath = "";
        for (var offset = 2; offset < buffer.length; offset += 2) {
            pt = getAveragePoint(offset);
            tmpPath += " L" + pt.x + " " + pt.y;
        }

        // Set the complete current path coordinates
        pathNew.setAttribute("d", strPath);
    }
};

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
  // Object.keys(point).forEach((key) => {
  //   point[key] = (point[key]).toFixed(3);
  // });
  lines.push(point);
  if (lines.length <= 1) {
    return;
  }
  // if ((lines.length % 60) === 0) {
  //   lines = vacuatePoints(0, lines, _penSize);
  // }
  // if (path) {
  //   try {
  //     svg.removeChild(path);
  //   } catch (e) {

  //   }
  // }

  // path = appendChild(svg, {
  //   type: 'drawing',
  //   color: _penColor,
  //   width: _penSize,
  //   lines
  // });
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

const pointsWithDouglasPeucker = ({ points, threshold, beginIndex, endIndex }) => {
  let t = points;
  let r = threshold;
  let i = beginIndex;
  const l = endIndex;
  let h = [];
  let p = [];
  for (let f = i; f <= l; ++f) {
    p[f] = false;
  }

  function u(e, t, r) {
    return (r["x"] - e["x"]) * t["x"] + (r["y"] - e["y"]) * t["y"]
  }

  for (var z = function e(t, r, n, i, l) {
    var h = l - i + 1;
    if (h > 2) {
      for (var p = t[i], f = t[l], d = function(e, t) {
        var r = {
          x: -t,
          y: e
        },
          n = Math.sqrt(r["x"] * r["x"] + r["y"] * r["y"]);

        return {
          x: r["x"] / n,
          y: r["y"] / n
        }
      }(f["x"] - p["x"], f["y"] - p["y"]), A = -1, m = Number.NEGATIVE_INFINITY, y = i + 1; y < l; ++y) {
        var g = t[y],
          v = u(p, d, g),
          b = Math.abs(v);
        b > m && (A = y, m = b)
      }
      if (m > n) e(t, r, n, i, A), e(t, r, n, A, l);
      else
        for (var y = i + 1; y < l; ++y)
          r[y] = !0;
    }
  }(t, p, r, i, l), f = i; f <= l; ++f) {
    p[f] || h.push(t[f]);
  }
  return h
}


const vacuatePoints = (e = 0, points, stockWidth) => {

  let t = 1.2396694214876034; //3 / stockWidth;
  let r = Math.max(0, lastVacuateIndex - 30);
  let n = Math.max(0, points.length - e - 1);
  if (n >= r + 2) {
    let i = pointsWithDouglasPeucker({
      threshold: t,
      beginIndex: r,
      endIndex: n,
      points: points
    });
    let u = n - r + 1;
    if (i.length !== u) {
      Array.prototype.splice.apply(points, [r, u].concat(i));
    }

  }
  lastVacuateIndex = Math.max(lastVacuateIndex, n);
  return points;
};

