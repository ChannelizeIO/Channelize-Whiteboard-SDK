import React, { useMemo, useContext, useEffect, useState } from 'react';
import Icon from '../icon';
import PollCard from '../../components/poll/index'
import usePollData from '../../hooks/use-poll-data';
import { useLocation } from 'react-router';
import { roomStore } from '../../stores/room';
import { globalStore } from '../../stores/global';
import { t } from '../../i18n';
import { sendToRemote } from '../whiteboard';
import { fileContext } from '../mediaboard';

interface ControlItemProps {
  name: string
  onClick: (evt: any, name: string) => void
  text?: string
}

const ControlItem = (props: ControlItemProps) => {
  const onClick = (evt: any) => {
    props.onClick(evt, props.name);
  }

  return (
    props.text ?
      <div className={`control-btn control-${props.name}`} onClick={onClick}>
        <div className={`btn-icon ${props.name} `}
          data-name={props.name} />
        <div className="control-text">{props.text}</div>
      </div>
      :
      <Icon
        bubbleCount ={roomStore._state.vt}
        data={props.name}
        onClick={onClick}
        className={`items ${props.name} `}
      />
  )
}

interface NoticeProps {
  reason: string
  text?: string
}

interface ControlProps {
  isHost?: boolean
  role: string
  notice?: NoticeProps
  onClick: (evt: any, type: string) => void
}
export const toggleNext = (setCanvasNumber: any, pdfFiles: any, setTotalPages: any) => {
  let current = document.getElementsByClassName('pdfViewer active')[0];
  let next = document.getElementsByClassName('pdfViewer active')[0].nextElementSibling;
  if (next) {
      globalStore.showToast({
        type: 'notice-board',
        message: t('toast.toggle_page')
      });
      if (roomStore._state.me.role === "teacher")
          sendToRemote("", "", "next-page", "");
      current.classList.remove('active');
      next.classList.add('active');


      if(roomStore._state.me.role === "teacher") {
      // changing current canvas number
      const currentCanvasNumber = next.id.substring(15);
      if(isNaN(parseInt(currentCanvasNumber))) {
        const currentCanvasIndex = pdfFiles.indexOf(currentCanvasNumber)
        setCanvasNumber(currentCanvasIndex + 1)
      } else {
      const currentCanvasIndex = pdfFiles.indexOf(parseInt(currentCanvasNumber));
      setCanvasNumber(currentCanvasIndex + 1);
      }

      // set total pages in canvas
      let totalPages = next?.childElementCount;
      setTotalPages(totalPages)
    }
  }
}

export const togglePrev = (setCanvasNumber: any, pdfFiles: any, setTotalPages: any) => {
  let current = document.getElementsByClassName('pdfViewer active')[0];
  let previous = document.getElementsByClassName('pdfViewer active')[0].previousElementSibling;

  if (previous) {
      globalStore.showToast({
        type: 'notice-board',
        message: t('toast.toggle_page')
      });
      if (roomStore._state.me.role === "teacher")
          sendToRemote("", "", "prev-page", "");
      current.classList.remove('active');
      previous.classList.add('active');


      if(roomStore._state.me.role === "teacher") {
      // changing current canvas number
      const currentCanvasNumber =  previous.id.substring(15);

      if(isNaN(parseInt(currentCanvasNumber))) {
        const currentCanvasIndex = pdfFiles.indexOf(currentCanvasNumber)
        setCanvasNumber(currentCanvasIndex + 1)
      } else {
        const currentCanvasIndex = pdfFiles.indexOf(parseInt(currentCanvasNumber))
        setCanvasNumber(currentCanvasIndex + 1)
      }

      // set total pages in a canvas
      let totalPages = previous?.childElementCount;
      setTotalPages(totalPages)
    }

  }
}

export const toggleFirstLast =  (item: any, setCanvasNumber: any, pdfFiles: any, setTotalPages: any) => {

  if(item === "first" && (document.getElementById('main-container')!.firstChild as HTMLElement).classList.contains('active')) {
    return;
  } else if(item === "last" && (document.getElementById('main-container')!.lastChild as HTMLElement).classList.contains('active')) {
    return;
  }

  let current = document.getElementsByClassName('pdfViewer active')[0];

  if (roomStore._state.me.role === "teacher") {
    sendToRemote("", "", 'toggleFirstLast', item);
  }

  globalStore.showToast({
    type: 'notice-board',
    message: t('toast.toggle_page')
  });

  current.classList.remove('active');
  document.querySelector(`.pdfViewer:${item}-child`)!.classList.add('active');


  if(roomStore._state.me.role === "teacher") {

  let totalPages = null;
  if(item === 'first') {
    setTotalPages(1);
    // set current canvas number to 1
    setCanvasNumber(1);
  } else {
    // set current canvas number to last
  const value = document.querySelector(`.pdfViewer:${item}-child`)?.id.substring(15);

  if(isNaN(parseInt(value!))) {
    const currentCanvasIndex = pdfFiles.indexOf(value)
    setCanvasNumber(currentCanvasIndex + 1);
  } else {
    const currentCanvasIndex = pdfFiles.indexOf(parseInt(value!))
        setCanvasNumber(currentCanvasIndex + 1)
  }

  // set total pages for current active canvas
  totalPages = document.getElementsByClassName('pdfViewer active')[0].childElementCount;
  setTotalPages(totalPages)
  }
}
}

export default function Control({
  onClick,
  role,
  isHost,
  notice,
}: ControlProps) {
  const location = useLocation();
  const {createPollFlag, pollView, handlePollTool, endPoll } = usePollData();

  // to get total number of canvas
  const [totalCanvas, setCanvasCount] = useState(1);

  // to get current canvas number
  const [currentCanvasNumber, setCanvasNumber ] = useState(1);
  const showCreate: boolean = useMemo(() => {
  
    if (role === 'teacher' && (location.pathname.match(/big-class/) || location.pathname.match(/small-class/))) {
      return true
    }
    return false;
  }, [location.pathname, role]);

  const fileState = useContext(fileContext);

   useEffect(() => {

    if(fileState.pdfFiles.length < totalCanvas) {
      let current = document.getElementsByClassName('pdfViewer active')[0];
      let canvas = current?.id.substring(15);

      if(isNaN(parseInt(canvas!))) {
        const currentCanvasIndex = fileState.pdfFiles.indexOf(canvas)
        setCanvasNumber(currentCanvasIndex + 1);
      } else {
        let currentCanvasIndex = fileState.pdfFiles.indexOf(parseInt(canvas)) + 1;
        setCanvasNumber(currentCanvasIndex)
      }

      // set number of pages for active canvas
      let totalPages = current.childElementCount
      fileState.setTotalPages(totalPages)
    } else {
      setCanvasNumber(fileState.pdfFiles.length)
    }
    setCanvasCount(fileState.pdfFiles.length)
   }, [fileState.pdfFiles.length])



  return (
    <>
    <div className="controls-container">
      <div className="interactive">
        {notice ?
          <ControlItem name={notice.reason}
            onClick={onClick} />
        : null}
      </div>
      {(role === 'teacher') ?
      <div className="controls">
        { role === 'teacher' ?
          <>
            <span title="First Page">
            <ControlItem name={`first_page`}
              onClick={() => toggleFirstLast('first', setCanvasNumber, fileState.pdfFiles,  fileState.setTotalPages)} />
              </span>
              <span title="Prev Page">
            <ControlItem name={`prev_page`}
              onClick={() => togglePrev(setCanvasNumber, fileState.pdfFiles, fileState.setTotalPages)} />
              </span>
            <div className="current_page">
              <span>{currentCanvasNumber}/{totalCanvas}</span>
            </div>
            <span title="Next Page">
            <ControlItem name={`next_page`}
              onClick={() => toggleNext(setCanvasNumber, fileState.pdfFiles, fileState.setTotalPages)} />
              </span>
              <span title="Last Page">
            <ControlItem name={`last_page`}
              onClick={() => toggleFirstLast('last', setCanvasNumber, fileState.pdfFiles, fileState.setTotalPages)} />
              </span>
              <div className="icons items add_page" id="add_page" title="Add Canvas" onClick={() => fileState.fileDispatch({type: 'add-page'})}></div>
              {
                fileState.pdfFiles.length > 1 ?
                <div className="icons items remove_page" 
                id="remove_page" title="Remove Canvas"
                onClick={() => {
                  if(window.confirm('Are you sure you want to delete canvas?'))
                  fileState.fileDispatch({type: 'remove-page'})
                }
                }
                ></div> : null
              }

            <div className="menu-split" style={{ marginLeft: '7px', marginRight: '7px' }}></div>
          </> : null
        }
        {role === 'teacher' ?
         showCreate ?
         <>
         <ControlItem
         name={pollView === 'create' ? 'poll_create' : 'poll_show'}
         onClick={() => {pollView === 'create' ? handlePollTool('create_popup', true) : handlePollTool('show_popup', true)}}
         text={pollView === 'create' ? '' : ''}
         />
         </> : null
         : null }
      </div> : null}
    </div>
    <PollCard
    createFlag={createPollFlag}
    role={role}
    tool={handlePollTool}
    endPoll={endPoll}
    />
    </>
  )
};

