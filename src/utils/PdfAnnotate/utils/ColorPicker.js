// Color picker component
var COLORS = [
  {hex: '#000000', name: 'Black'}, {'hex': '#373737', 'name': 'Light Black'}, {'hex': '#696969', name: 'Dark Gray'}, {'hex': '#9C9C9C', 'name': 'Gray'}, {hex: '#DDDDDD', name: 'Light Gray'}, {hex: '#FFFFFF', name: 'White'}, {hex: '#FF0000', name: 'Red'}, {hex: '#E71F63', name: 'Pink'}, {hex: '#F06291', name: 'Light Pink'}, {hex: '#8F3E97', name: 'Purple'}, {hex: '#65499D', name: 'Deep Purple'}, {hex: '#4554A4', name: 'Indigo'}, {hex: '#2083C5', name: 'Blue'}, {hex: '#35A4DC', name: 'Light Blue'}, {hex: '#09BCD3', name: 'Cyan'}, {'hex': '#25d2d1', 'name': 'Light Cyan'}, {hex: '#009688', name: 'Teal'}, {hex: '#007a3b', name: 'Green'}, {hex: '#00cc63', name: 'Light Green'}, {hex: '#ffcd45', name: 'Yellow'}, {'hex': '#f69a00', 'name': 'Dark Yellow'}, {hex: '#ff8d00', name: 'Orange'}, {hex: '#F0592B', name: 'Deep Orange'}, {'hex': '#b54800', 'name': 'Brown'}, {'hex': '#88271f', 'name': 'Dark Brown'}
];

function initColorPicker(el, value, onChange) {
  function setColor(value, name) {
    var fireOnChange = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
    a.setAttribute('data-color', value);
    a.style.background = value;
    a.setAttribute('title', name);
    if (fireOnChange && typeof onChange === 'function') {
      onChange(value);
    }
    closePicker();
  }

  function togglePicker(event) {
    event.stopPropagation();
    if (isPickerOpen) {
      closePicker();
    } else {
      openPicker();
    }
  }

  function closePicker() {
    document.removeEventListener('keyup', handleDocumentKeyup);
    if (picker && picker.parentNode) {
      picker.parentNode.removeChild(picker);
    }
    isPickerOpen = false;
    a.focus();
  }

  function openPicker() {
    if (!picker) {
      picker = document.createElement('div');
      picker.style.background = '#fff';
      picker.style.border = '1px solid #ccc';
      picker.style.padding = '2px';
      picker.style.position = 'absolute';
      picker.style.width = '180px';
      el.style.position = 'relative';
      COLORS.map(createColorOption).forEach(function (c) {
        c.style.margin = '2px';
        c.onclick = function () {
          setColor(c.getAttribute('data-color'), c.getAttribute('title'));
        };
        picker.appendChild(c);
      });
    }
    document.addEventListener('keyup', handleDocumentKeyup);
    el.appendChild(picker);
    isPickerOpen = true;
  }

  function createColorOption(color) {
    var e = document.createElement('a');
    e.className = 'color';
    e.setAttribute('href', 'javascript://');
    e.setAttribute('title', color.name);
    e.setAttribute('data-color', color.hex);
    e.style.background = color.hex;
    return e;
  }

  function handleDocumentKeyup(e) {
    if (e.keyCode === 27) {
      closePicker();
    }
  }

  var picker = void 0;
  var isPickerOpen = false;
  var colorName = '';
  COLORS.filter((color) => {
    if (color.hex === value) {
      colorName = color.name;
    }
  });
  var a = createColorOption({hex: value, name: colorName});
  a.onclick = togglePicker;
  el.appendChild(a);
  setColor(value, colorName);
}
export default initColorPicker;
