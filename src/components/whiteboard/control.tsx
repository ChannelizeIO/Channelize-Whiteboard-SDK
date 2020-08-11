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
import FirstPageIcon from '@material-ui/icons/FirstPage';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import LastPageIcon from '@material-ui/icons/LastPage';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import RemoveCircleOutlineOutlinedIcon from '@material-ui/icons/RemoveCircleOutlineOutlined';
import { Tooltip } from '@material-ui/core';

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
             <Tooltip title="First Canvas">
              <FirstPageIcon onClick={() => toggleFirstLast('first', setCanvasNumber, fileState.pdfFiles,  fileState.setTotalPages)}>
              </FirstPageIcon>
              </Tooltip>
              <Tooltip  title="Prev Canvas" >
              <ArrowBackIosIcon  onClick={() => togglePrev(setCanvasNumber, fileState.pdfFiles, fileState.setTotalPages)}/>
              </Tooltip>
            <div className="current_page">
              <span>{currentCanvasNumber}/{totalCanvas}</span>
            </div>
            <Tooltip title="Next Canvas">
              <ArrowForwardIosIcon  onClick={() => toggleNext(setCanvasNumber, fileState.pdfFiles, fileState.setTotalPages)} />
            </Tooltip >

            <Tooltip title="Last Canvas">
              <LastPageIcon  onClick={() => toggleFirstLast('last', setCanvasNumber, fileState.pdfFiles, fileState.setTotalPages)}/>
            </Tooltip>

            <Tooltip title="Add Canvas">
              <AddCircleOutlineIcon id="add_page"  onClick={() => fileState.fileDispatch({type: 'add-page'})}/>
            </Tooltip>
            {
                fileState.pdfFiles.length > 1 ?
                <Tooltip title="Remove Canvas">
                  <RemoveCircleOutlineOutlinedIcon 
                  id="remove_page" 
                  onClick={
                    () => {
                    if(window.confirm('Are you sure you want to delete canvas?'))
                    fileState.fileDispatch({type: 'remove-page'})
                  }
                  }
                  />
                </Tooltip> : null
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

