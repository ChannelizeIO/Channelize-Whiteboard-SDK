import setAttributes from '../utils/setAttributes';
import normalizeColor from '../utils/normalizeColor';

/**
 * Create SVGTextElement from an annotation definition.
 * This is used for anntations of type `textbox`.
 *
 * @param {Object} a The annotation definition
 * @return {SVGTextElement} A text to be rendered
 */
export default function renderText(a) {
  var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

  setAttributes(text, {
    x: a.x,
    y: a.y + parseInt(a.size, 10),
    dy: 0,
    width: a.width,
    height: a.height,
    fill: normalizeColor(a.color || '#000'),
    fontSize: a.size
  });
  text.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space","preserve");
  let content = a.content;
  let htmlContent = '';
  let lines = content.split("\n");
  lines.forEach(function (value, index) {
    value = value ? value : " ";
    htmlContent = htmlContent + '<tspan x="' + a.x + '"  dy="' + (index ? (parseInt(a.size, 10) + 5) : 0) + 'px" xml:space="preserve">' + value + '</tspan>';
  });

  text.innerHTML = htmlContent;

  return text;
}
