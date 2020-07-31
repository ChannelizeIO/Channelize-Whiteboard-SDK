import $ from 'jquery';
function init(PDFJSAnnotate) {
	let { UI } = PDFJSAnnotate;

	var RENDER_OPTIONS = {
		documentId: 'default'
	};
	$('body').on('click', function(e) {
		var el = $(e.target);
		var hasInMenu = false;
		if (el) {
			hasInMenu = el.hasClass('sub');
			var parEl = el.parents();
			for (var i = 0; i < parEl.length; i++) {
				var elm = $(parEl[i]);
				if (elm.hasClass('sub')) {
					hasInMenu = true;
					break;
				}
			}
		}
		if (!hasInMenu) {
			setTimeout(function() {
				$('.text-tools .sub.open').removeClass('open');
			}, 50);
		}
	});

	var triggerCustomClickEvent = function(delay) {
		setTimeout(function() {
			//  $("body").trigger("click");
		}, delay || 500);
	};
	var submenu = function(x) {
		if (!$(x).parent().hasClass('open')) {
			$('.text-tools .sub.open').removeClass('open');
		}
		if ($(x).parent().hasClass('open')) {
			$(x).parent().removeClass('open');
		} else {
			if ($(x).closest('.sub') && $(x).closest('.sub').children('i:first-child').length > 0) {
				if ($(x).closest('.sub').children('i:first-child').data('annotation-type')) {
					$(x).closest('.sub').children('i:first-child')[0].click();
				}
			}
			$(x).parent().addClass('open');
		}
	};

	$('.text-tools .sub').on('click', '.sub-nav', function(event) {
		event.stopPropagation();
		submenu(this);
	});
	$('.text-tools .sub.dblclick').on('click', 'i', function(event) {
		if ($(this).hasClass('active')) {
			submenu(this);
		} else {
			$('.text-tools .sub.open').removeClass('open');
		}
	});
	$('.text-tools .sub.singleclick').on('click', 'i', function(event) {
		event.stopPropagation();
		submenu(this);
	});
	// Text stuff
	(function() {
		var textSize = void 0;
		var textColor = void 0;

		function setText(size, color, asDefault) {
			var modified = false;
			if (textSize !== size) {
				modified = true;
				textSize = size;
				localStorage.setItem(RENDER_OPTIONS.documentId + '/text/size', textSize);
				// document.querySelector('.annotation-toolbar .text-size').value = textSize;
			}

			if (textColor !== color) {
				modified = true;
				textColor = color;
				localStorage.setItem(RENDER_OPTIONS.documentId + '/text/color', textColor);
			}

			if (modified) {
				UI.setText(textSize, textColor);
			}
			if (!asDefault) {
				//setTimeout(function () {$(".text-tools .text-icon")[0].click()}, 200);
			}
		}

		let defalutTextSize = /*localStorage.getItem(RENDER_OPTIONS.documentId + '/text/size') ||*/ 10;

		let defaultColor = '#ff0000'; //localStorage.getItem(RENDER_OPTIONS.documentId + '/text/color') || '#ff0000';

		var textSizeRange = document.getElementById('textSizeRange');
		var textSizeSpan = document.getElementById('textSize');

		document.querySelectorAll('.nav-text input[name="text-color"]').forEach((el) => {
			el.addEventListener('click', function() {
				setText(textSize, this.value);
				var radioValue = $(this).data('value');
				$('.text-icon').removeClass('black grey white red pink purple blue green yellow orange');
				$('.text-icon').addClass(radioValue);
				triggerCustomClickEvent();
			});
			el.removeAttribute('checked');
			if (el.value === defaultColor) {
				el.setAttribute('checked', 'checked');
				el = $(el);
				var radioValue = el.data('value');
				$('.text-icon').removeClass('black grey white red pink purple blue green yellow orange');
				$('.text-icon').addClass(radioValue);
			}
		});

		setText(defalutTextSize, defaultColor, true);
	})();
	//  // Highlight stuff
	(function() {
		let setHighlightColor = function(value, color) {
			$('.texttools-icon').removeClass('red yellow blue');
			$('.texttools-icon').addClass(value);
			UI.setHighlightColor(color);
			localStorage.setItem(RENDER_OPTIONS.documentId + '/highlight/color', color);
		};
		$('.nav-texttools').on('click', 'img.texttools', function() {
			setHighlightColor($(this).data('id'), $(this).data('value'));
		});
		let color = /*localStorage.getItem(RENDER_OPTIONS.documentId + '/highlight/color') ||*/ '#FFF000';
		$('.nav-texttools img.texttools').each(function() {
			if (color == $(this).data('value')) {
				setHighlightColor($(this).data('id'), $(this).data('value'));
			}
		});
	})();
	//  // Pen stuff
	(function() {
		var penThickness = void 0;
		var penColor = void 0;
		function setPen(size, color, asDefault) {
			var modified = false;
			if (penThickness !== size) {
				modified = true;
				penThickness = size;
				localStorage.setItem(RENDER_OPTIONS.documentId + '/pen/size', penThickness);
			}

			if (penColor !== color) {
				modified = true;
				penColor = color;
				localStorage.setItem(RENDER_OPTIONS.documentId + '/pen/color', penColor);
			}

			if (modified) {
				UI.setPen(penThickness, penColor);
			}
			if (!asDefault) {
				//setTimeout(function () {$('.text-tools .pen-select')[0].click()}, 200);
			}
		}

		let defalutPenSize = /*localStorage.getItem(RENDER_OPTIONS.documentId + '/pen/size') || */ 1;
		let defaultColor = '#ff0000'; //localStorage.getItem(RENDER_OPTIONS.documentId + '/pen/color') || '#ff0000';

		var penThicknessRange = document.getElementById('penThicknessRange');
		var penThicknessSpan = document.getElementById('penThickness');
		if (penThicknessSpan) {
			penThicknessRange.value = defalutPenSize;
			penThicknessSpan.innerHTML = penThicknessRange.value;
		}
		if (penThicknessRange) {
			penThicknessRange.oninput = function() {
				penThicknessSpan.innerHTML = this.value;
				setPen(this.value, penColor);
			};
		}

		document.querySelectorAll('.nav-pen input[name="pen-color"]').forEach((el) => {
			el.addEventListener('click', function() {
				setPen(penThickness, this.value);
				var radioValue = $(this).data('value');
				$('.pen-icon').removeClass('black grey white red pink purple blue green yellow orange');
				$('.pen-icon').addClass(radioValue);
				triggerCustomClickEvent();
			});
			el.removeAttribute('checked');
			if (el.value === defaultColor) {
				el.setAttribute('checked', 'checked');
				el = $(el);
				var radioValue = el.data('value');
				$('.pen-icon').removeClass('black grey white red pink purple blue green yellow orange');
				$('.pen-icon').addClass(radioValue);
			}
		});
		setPen(defalutPenSize, defaultColor, true);
	})();

	// Toolbar b1uttons

	(function() {
		var tooltype = /*localStorage.getItem(RENDER_OPTIONS.documentId + '/tooltype') ||*/ 'cursor';
		if (tooltype) {
			setActiveToolbarItem(
				tooltype,
				document.querySelector('.annotation-toolbar [data-annotation-type=' + tooltype + ']')
			);
		}

		function setActiveToolbarItem(type, button) {
			var active = document.querySelector('.annotation-toolbar [data-annotation-type].active');
			if (active && tooltype === type) {
				return;
			}
			if (active) {
				document
					.querySelectorAll('.annotation-toolbar [data-annotation-type="' + tooltype + '"]')
					.forEach(function(el) {
						el.classList.remove('active');
						let liEl = el;
						let i = 0;
						while (liEl.parentNode && !liEl.parentNode.classList.contains('annotation-toolbar') && i < 20) {
							liEl = liEl.parentNode;
							i++;
						}
						if (liEl.parentNode && liEl.parentNode.classList.contains('annotation-toolbar')) {
							liEl.classList.remove('active-tool');
							liEl.setAttribute(`data-tool`, '');
						}
					});
				switch (tooltype) {
					case 'cursor':
						UI.disableEdit();
						break;
					case 'draw':
						UI.disablePen();
						break;
					case 'eraser':
						UI.disableEraser();
						break;
					case 'text':
						UI.disableText();
						break;
					case 'line':
						UI.disableLine();
						break;
					case 'point':
						UI.disablePoint();
						break;
					case 'ellipse':
						UI.disableEllipse();
						break;
					case 'area':
					case 'highlight':
					case 'strikeout':
					case 'underline':
						UI.disableRect();
						break;
					case 'color':
						$('.nav-colopiker').hide();
				}
			}
			switch (type) {
				case 'color':
					toggleSelection();
				case 'cursor':
					UI.enableEdit();
					break;
				case 'draw':
					toggleSelection();
					UI.disableEdit();
					UI.enablePen();
					break;
				case 'eraser':
					toggleSelection();
					UI.disableEdit();
					UI.enableEraser();
					break;
				case 'text':
					toggleSelection();
					UI.disableEdit();
					UI.enableText();
					break;
				case 'line':
					toggleSelection();
					UI.disableEdit();
					UI.enableLine();
					break;
				case 'point':
					toggleSelection();
					UI.disableEdit();
					UI.enablePoint();
					break;
				case 'ellipse':
					toggleSelection();
					UI.disableEdit();
					UI.enableEllipse();
					break;
				case 'area':
				case 'highlight':
				case 'underline':
				case 'strikeout':
					toggleSelection("allow");
					UI.disableEdit();
					UI.enableRect(type);
					break;
			}
			toggleColorPicker(type);

			$('#viewerContainer').removeClass(`pdf-annotations-active-${tooltype}`);
			$('#viewerContainer').addClass(`pdf-annotations-active-${type}`);
			tooltype = type;
			if (button) {
				setTimeout(() => {
					button.classList.add('active');
					document
						.querySelectorAll('.annotation-toolbar [data-annotation-type=' + type + ']')
						.forEach(function(el) {
							el.classList.add('active');
							let liEl = el;
							let i = 0;

							while (
								liEl.parentNode &&
								!liEl.parentNode.classList.contains('annotation-toolbar') &&
								i < 20
							) {
								liEl = liEl.parentNode;
								i++;
							}
							if (liEl.parentNode && liEl.parentNode.classList.contains('annotation-toolbar')) {
								liEl.classList.add('active-tool');
								liEl.setAttribute(`data-tool`, tooltype);
								document.querySelector('.color_pick').classList.remove('active');
							}
						});
				}, 100);
			}
		}

		function handleToolbarClick(e) {
			var button = e.target,
				i = 1;
			while (button && button.nodeName !== 'I' && i < 20) {
				button = button.parentNode;
				i++;
			}
			if (button && button.getAttribute('data-annotation-type')) {
				setActiveToolbarItem(button.getAttribute('data-annotation-type'), button);
			}
		}
		function toggleColorPicker(type) {
			console.log(document.querySelector('.nav-colopiker'))
			if (
				document.querySelector('.nav-colopiker')&&document.querySelector('.nav-colopiker').style &&
				document.querySelector('.nav-colopiker').style.display == 'block' &&
				type != 'color'
			) {
				document.querySelector('.nav-colopiker').style.display = 'none';
			}
		}

		function toggleSelection(action) {
			let divs = document.querySelectorAll('.textLayer');
			if(action === "allow") {
				for (let i = 0; i < divs.length; i++) {
					divs[i].classList.remove('noselect');
				}
			} else {
				for (let i = 0; i < divs.length; i++) {
					divs[i].classList.add('noselect');
				}
			}
		}
		document.querySelectorAll('.annotation-toolbar [data-annotation-type]').forEach(function(el) {
			el.addEventListener('click', handleToolbarClick);
		});
	})();
}

export default init;
