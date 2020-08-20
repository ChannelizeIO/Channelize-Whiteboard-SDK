import setAttributes from '../utils/setAttributes';
import normalizeColor from '../utils/normalizeColor';

/**
 * Create SVGRectElements from an annotation definition.
 * This is used for anntations of type `area` and `highlight`.
 *
 * @param {Object} a The annotation definition
 * @return {SVGGElement|SVGRectElement} A group of all rects to be rendered
 */
export default function renderEllipse(a) {

  let rect = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');

  setAttributes(rect, {
    cx: a.cX,
    cy: a.cY,
    rx: a.rX,
    ry: a.rY
  });


  setAttributes(rect, {
    stroke: normalizeColor(a.color || '#f00'),
    strokeWidth: a.width || 1 ,
    fill: 'none'
  });

  return rect;

}


