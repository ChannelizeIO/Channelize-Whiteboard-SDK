import setAttributes from '../utils/setAttributes';
import normalizeColor from '../utils/normalizeColor';

/**
 * Create SVGLineElements from an annotation definition.
 * This is used for anntations of type `strikeout`.
 *
 * @param {Object} a The annotation definition
 * @return {SVGGElement} A group of all lines to be rendered
 */
export default function renderLine(a) {

  let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  setAttributes(line, {
    x1: a.x1,
    y1: a.y1,
    x2: a.x2,
    y2: a.y2,
    stroke: normalizeColor(a.color || '#000'),
    strokeWidth: a.width || 1
  });

  return line;
}
