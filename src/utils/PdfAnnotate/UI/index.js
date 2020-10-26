import { addEventListener, removeEventListener, fireEvent } from './event';
import { disableEdit, enableEdit } from './edit';
import { disablePen, enablePen, setPen } from './pen';
import { disableLine, enableLine, setLine } from './line';
import { disableEllipse, enableEllipse, setEllipse } from './ellipse';
import { disableEraser, enableEraser, setEraser } from './eraser';
import { disablePoint, enablePoint } from './point';
import { disableRect, enableRect, setHighlightColor, setRect } from './rect';
import { disableText, enableText, setText, closeInput } from './text';
import { createPage, renderPage } from './page';

export default {
  addEventListener, removeEventListener, fireEvent,
  disableEdit, enableEdit,
  disablePen, enablePen, setPen,
  disableLine, enableLine, setLine,
  disableEraser, enableEraser, setEraser,
  disablePoint, enablePoint,
  disableEllipse, enableEllipse, setEllipse,
  disableRect, enableRect, setHighlightColor, setRect,
  disableText, enableText, setText, closeInput,
  createPage, renderPage
};
