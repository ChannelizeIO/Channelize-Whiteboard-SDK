import React, { useMemo, useEffect, useState, useReducer } from 'react';
import Whiteboard from './whiteboard';
import Control from './whiteboard/control';
import { useLocation } from 'react-router';
import { useRoomState, useGlobalState } from '../containers/root-container';
import { roomStore } from '../stores/room';
import { globalStore } from '../stores/global';
import { t } from '../i18n';
import Toolelements from './whiteboard/toolelements';
import { sendToRemote } from './whiteboard';

interface MediaBoardProps {
  handleClick?: (type: string) => void
  children?: any
}

export const fileContext = React.createContext({} as any);

const fileReducer = (state: any, action: any) => {
  let whiteBaordFiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  let availableFiles = [];
  switch (action.type) {
    case 'add-page':
      availableFiles = whiteBaordFiles.filter(function (obj) { return state.indexOf(obj) === -1; });
      if (availableFiles.length > 0) {
          if(availableFiles.length === 1) {
            document.getElementById('add_page')!.style.display = 'none';
          }
          alert(t('toast.add_page'));
          sendToRemote("", availableFiles[0], "add-page", "");
          return [...state, availableFiles[0]];
      }
      return state;
    case 'remove-page':
      let id = document.getElementsByClassName('pdfViewer active')[0].id.replace('viewerContainer','');

      if(id !== '1') {
        let pageId = document.getElementById(`viewerContainer${id}`)!.getElementsByTagName('svg')[0].getAttribute('data-pdf-annotate-document');
        let updatedFiles = state.filter(function (value: any, index: any) {
          return value != id;
        });
        document.getElementsByClassName('pdfViewer active')[0].previousElementSibling?.classList.add('active');

        // show add button
        availableFiles = whiteBaordFiles.filter(function (obj) { return updatedFiles.indexOf(obj) == -1; });
        if(availableFiles.length > 0) {
          document.getElementById('add_page')!.style.display = 'block';
        }
        alert(t('toast.remove_page'));
        sendToRemote("", updatedFiles, "remove-page", pageId);
        return updatedFiles;
      }
      return state;
    case 'upload-file':
      sendToRemote("", action.fileId, "add-page", "");
      return [...state, action.fileId];
    case 'remote-add-page':
      return [...state, action.fileId];
    case 'remote-remove-page':
      document.getElementsByClassName('pdfViewer active')[0].previousElementSibling?.classList.add('active');
      return action.fileId;
    default:
      return state;
  }
}

const MediaBoard: React.FC<MediaBoardProps> = ({
  handleClick,
  children
}) => {

  const roomState = useRoomState();
  const role = roomState.me.role;
  const me = roomState.me;

  const handlePageTool: any =  (evt: any, type: string) => {

    if (type === 'peer_hands_up') {
      globalStore.showDialog({
        type: 'apply',
        message: `${globalStore.state.notice.text}`,
      })
    }
    if (handleClick) {
      handleClick(type);
    }
  }

  const isHost = useMemo(() => {
    return +roomStore.state.me.uid === +roomStore.state.course.linkId;
  }, []);

  const location = useLocation();
  const showControl: boolean = useMemo(() => {
    if (me.role === 'teacher') return true;
    if (location.pathname.match(/big-class/) || location.pathname.match(/small-class/)) {
      if (me.role === 'student') {
        return true;
      }
    }
    return false;
  }, [location.pathname, me.role]);

  const drawable: string = useMemo(() => {
    if (location.pathname.match('small-class|big-class')) {
      if (me.role === 'teacher') {
        return 'drawable';
      }
      if (me.role === 'student') {
        if (Boolean(me.grantBoard)) {
          return 'drawable';
        } else {
          return 'panel';
        }
      }
    }
    return 'drawable';
  }, [me.role, me.grantBoard, location]);

  const globalState = useGlobalState();

  const files = [1];

  const [pdfFiles, dispatch] = useReducer(fileReducer, files);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPages] = useState(1);


  useEffect(() => {
    setCurrentPage(1);
  },[pdfFiles]);

  function getMostVisibleElement(selector: any) : any {
    let clientRect = null;
    let clientRectTop = 0;
    let maxVisibleHeight = 0;
    let visibleHeightOfElem = 0;
    let mostVisibleElement = null;
    let skipRest = false;

    selector.forEach(function(element: any) {

        if (skipRest === false) {
            clientRect = element.getBoundingClientRect();
            clientRectTop = Math.abs(clientRect.top);

            if (clientRect.top >= 0) {
                visibleHeightOfElem = window.innerHeight - clientRectTop;
            } else {
                visibleHeightOfElem = clientRect.height - clientRectTop;
            }

            if (visibleHeightOfElem >= clientRect.height) {
                mostVisibleElement = element;
                skipRest = true;
            } else {

                if (visibleHeightOfElem > maxVisibleHeight) {
                    maxVisibleHeight = visibleHeightOfElem;
                    mostVisibleElement = element;
                }
            }

        }
    });
    return mostVisibleElement;
}

  const handleScroll = () => {

    if(roomStore._state.me.role === "teacher") {
      setTimeout(() => {
    sendToRemote("", "", "sync-scroll", document.querySelector('.media-board.drawable')!.scrollTop);
      }, 200);

    try {
      let elements = document.querySelectorAll('.pdfViewer.active');
    let  VisibleElement = getMostVisibleElement(elements[0].childNodes)

    if (VisibleElement !== null) {
      let VisibleElementId = VisibleElement.id
      let pageNumber = VisibleElementId.substring(13);
      setCurrentPage(pageNumber);
    }
    } catch (err) {
        // error handler
    }
  }
}

  return (
    <div id='Board' className={`media-board ${drawable}`} onScroll={handleScroll}>
      {
        <>
        <fileContext.Provider value={{
          pdfFiles: pdfFiles,
          fileDispatch: dispatch,
          setTotalPages: setTotalPages,
          currentPage: currentPage,
          totalPage: totalPage
          }}>
          <Whiteboard />
        </fileContext.Provider>
         </>
      }
      <div className="layer">
        <>
          {me.role === 'teacher' ? <fileContext.Provider value={{pdfFiles: pdfFiles, fileDispatch: dispatch}}><Toolelements /></fileContext.Provider> : null}
        </>
        {children ? children : null}
      </div>
      { showControl ?
      <fileContext.Provider value={{pdfFiles: pdfFiles, fileDispatch: dispatch, setTotalPages: setTotalPages}}>
      <Control
        isHost={isHost}
        notice={globalState.notice}
        role={role}
        onClick={handlePageTool}/>
        </fileContext.Provider> : null }
    </div>
  )
};
export default React.memo(MediaBoard);
