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
  lastVacuateIndex = 0;
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
  if (lines.length > 1 && (svg = findSVGAtPoint(e.clientX, e.clientY))) {
    let { documentId, pageNumber } = getMetadata(svg);
    // lines = vacuatePoints(100000, lines, _penSize);
    PDFJSAnnotate.getStoreAdapter().addAnnotation(documentId, pageNumber, {
      type: 'drawing',
      width: _penSize,
      color: _penColor,
      lines
    }).then((annotation) => {
      if (path) {
        try {
          svg.removeChild(path);
        } catch (e) {

        }
      }

      appendChild(svg,  {
        type: 'drawing',
        color: _penColor,
        width: _penSize,
        lines
      });
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
    x: x - rect.left + 2,
    y: y - rect.top - 3
  });
  Object.keys(point).forEach((key) => {
    point[key] = (point[key]).toFixed(3);
  });
  lines.push(point);
  if (lines.length <= 1) {
    return;
  }
  // if ((lines.length % 60) === 0) {
    // lines = vacuatePoints(100000, lines, _penSize);
  // }
  if (path) {
    try {
      svg.removeChild(path);
    } catch (e) {

    }
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

