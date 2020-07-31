import { addEventListener, removeEventListener, fireEvent } from './event';
import { disableEdit, enableEdit } from './edit';
import { disablePen, enablePen, setPen } from './pen';
import { disableLine, enableLine, setLine } from './line';
import { disableEllipse, enableEllipse } from './ellipse';
import { disableEraser, enableEraser, setEraser } from './eraser';
import { disablePoint, enablePoint } from './point';
import { disableRect, enableRect, setHighlightColor } from './rect';
import { disableText, enableText, setText } from './text';
import { createPage, renderPage } from './page';

export default {
  addEventListener, removeEventListener, fireEvent,
  disableEdit, enableEdit,
  disablePen, enablePen, setPen,
  disableLine, enableLine, setLine,
  disableEraser, enableEraser, setEraser,
  disablePoint, enablePoint,
  disableEllipse, enableEllipse,
  disableRect, enableRect, setHighlightColor,
  disableText, enableText, setText,
  createPage, renderPage
};
