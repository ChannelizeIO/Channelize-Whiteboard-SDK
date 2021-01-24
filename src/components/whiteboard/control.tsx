import React, { useMemo, useContext, useEffect, useState, useRef } from 'react';
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
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import CreateIcon from '@material-ui/icons/Create';
import CreateOutlinedIcon from '@material-ui/icons/CreateOutlined';
import { green } from '@material-ui/core/colors';
import Button from '@material-ui/core/Button';
import RecordRTCPromisesHandler from 'recordrtc';
import { async } from 'rxjs/internal/scheduler/async';
import GetAppIcon from '@material-ui/icons/GetApp';
import StopIcon from '@material-ui/icons/Stop';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';


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
        bubbleCount={roomStore._state.vt}
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


    if (roomStore._state.me.role === "teacher") {
      // changing current canvas number
      const currentCanvasNumber = next.id.substring(15);
      if (isNaN(parseInt(currentCanvasNumber))) {
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


    if (roomStore._state.me.role === "teacher") {
      // changing current canvas number
      const currentCanvasNumber = previous.id.substring(15);

      if (isNaN(parseInt(currentCanvasNumber))) {
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

export const toggleFirstLast = (item: any, setCanvasNumber: any, pdfFiles: any, setTotalPages: any) => {

  if (item === "first" && (document.getElementById('main-container')!.firstChild as HTMLElement).classList.contains('active')) {
    return;
  } else if (item === "last" && (document.getElementById('main-container')!.lastChild as HTMLElement).classList.contains('active')) {
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


  if (roomStore._state.me.role === "teacher") {

    let totalPages = null;
    if (item === 'first') {
      setTotalPages(1);
      // set current canvas number to 1
      setCanvasNumber(1);
    } else {
      // set current canvas number to last
      const value = document.querySelector(`.pdfViewer:${item}-child`)?.id.substring(15);

      if (isNaN(parseInt(value!))) {
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
  const { createPollFlag, pollView, handlePollTool, endPoll } = usePollData();
  const roomType = roomStore.state.course.roomType;
  // to get total number of canvas
  const [totalCanvas, setCanvasCount] = useState(1);
  // screen recording
  const [isRecording, setRecording] = useState(false);
  let recorder = useRef<any>();
  let desktopStream = useRef<any>();
  // to get current canvas number
  const [currentCanvasNumber, setCanvasNumber] = useState(1);
  const showCreate: boolean = useMemo(() => {

    if (role === 'teacher' && (location.pathname.match(/big-class/) || location.pathname.match(/small-class/))) {
      return true
    }
    return false;
  }, [location.pathname, role]);

  const fileState = useContext(fileContext);

  useEffect(() => {

    if (fileState.pdfFiles.length < totalCanvas) {
      let current = document.getElementsByClassName('pdfViewer active')[0];
      let canvas = current?.id.substring(15);

      if (isNaN(parseInt(canvas!))) {
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


  // active and de-active every canvas div
  const activediv = async (value: string) => {

    // get every canvas div
    const active = document.getElementsByClassName('pdfViewer');

    if (value == 'active') {
      // loop through every canvas and add active class
      for (let i = 0; i < active.length; i++) {
        active[i].classList.add('active');
      }
    } else if (value == 'deactive') {
      // loop through every canvas and remove active class
      for (let i = 0; i < active.length; i++) {
        if (i + 1 == currentCanvasNumber) {
          continue;
        }
        active[i].classList.remove('active');
      }
    }
  }

  // download anntated canvas as single .pdf file
  const printDocument = async () => {
      try {
        // add active class to every canvas div
        await activediv('active')

        // get number of canvas
        const input = document.getElementById('main-container')?.childElementCount;
        const board = document.getElementById('Board')
        board?.scrollTo(0,0);
        window.scrollTo(0,0);
        let pdf = new jsPDF('l', 'mm', 'a0');
        let pdfSize = 0;

        // loop through every canvas
        for (let i = 1; i <= input!; i++) {
          
          // get canvas
          const d = document.querySelector('#viewerContainer' + i) as HTMLElement;
    
          if (d) {
            pdfSize = pdfSize + 1;
            const canvas = await html2canvas(d,{
              removeContainer: true,
              x: 50,
              height: 1000,
            });
            // convert canvas to image
            const imgData = canvas.toDataURL('image/jpeg');
            pdf.setFontSize(40);
            // add page number for pdf
            pdf.text(`Page Number: ${i}`, 12, 12);
            pdf.addImage(imgData, 'JPEG', 5, 15, canvas.width-150 , canvas.height-150);
            // add empty page for next iteration
            pdf.addPage();
          }
        }
        // delete last page if empty
        if (pdfSize <= input!) {
          pdf.deletePage(pdfSize + 1);
        }
        // save pdf
        pdf.save("testdownload.pdf");

        // remove active class from canvas div
        await activediv('deactive');
      } catch(err) {}
  }

  const showTool: boolean = useMemo(() => {
    if (role === 'student' && (location.pathname.match(/big-class/) || location.pathname.match(/small-class/))) {
      return true
    }
    return false;
  }, [location.pathname, role]);


  // get random string 
  function getRandomString() {
    if (window.crypto && window.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
      var a = window.crypto.getRandomValues(new Uint32Array(3)),
        token = '';
      for (var i = 0, l = a.length; i < l; i++) {
        token += a[i].toString(36);
      }
      return token;
    } else {
      return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
    }
  }

  // file name for recorded file
  function getFileName(fileExtension: any) {
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth();
    var date = d.getDate();
    return 'RecordRTC-' + year + month + date + '-' + getRandomString() + '.' + fileExtension;
  }


  // stop recording
  const stopRecording = async () => {
    recorder.current.stopRecording(function () {
      setRecording(false);
      let blob = recorder.current.getBlob();
      var file = new File([blob], getFileName('mp4'), {
        type: 'video/mp4'
      });
      // save recording as mp4
      RecordRTCPromisesHandler.invokeSaveAsDialog(file, getFileName('mp4'));
      let tracks = desktopStream.current.getTracks();
      // stop screen recording track
      tracks.forEach((track: any) => track.stop());
      globalStore.showToast({
        type: 'notice-board',
        message: t('toast.stop_recording')
      });
    });
  }


  // record screen 
  const handleScreenRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      let displaymediastreamconstraints = {
        video: {
          displaySurface: 'browser'
        },
        audio: true,
      };

      const mediaDevices = navigator.mediaDevices as any;
       
      try {
        // get screen stream
        desktopStream.current = await mediaDevices.getDisplayMedia(displaymediastreamconstraints);
      const tracks = [
        ...desktopStream.current.getVideoTracks(),
      ];

      let stream = new MediaStream(tracks);
      recorder.current = new RecordRTCPromisesHandler(stream, {
        type: 'video',
        mimeType: 'video/webm;codecs=vp8'
      });

      // start recording
      recorder.current.startRecording();
      setRecording(true);

      // stop recording on stop screenshare lisnter
      desktopStream.current.getVideoTracks()[0].onended = function () {
        stopRecording();
      };

      globalStore.showToast({
        type: 'notice-board',
        message: t('toast.start_recording')
      });
      } catch(err) {}
    }
  }


  // allow student to annotate for single classroom
  const allowToAnnotate = async () => {
    try {
      const annotationAllow = roomStore._state.course.allowAnnotation;
    const student = roomStore._state.users;
    let uids: string[] = [];
    student.forEach((x) => {
      console.log(x);
      if (x.role == 'student') {
        uids.push(x.uid);
      }
    });

    if (uids.length === 0) {
      globalStore.showToast({
        message: t('toast.student_not_joined'),
        type: 'notice'
      });
      return;
    }

    // check if student is online
    let uid = await roomStore.rtmClient.queryOnlineStatusById(uids);
    if (uid === undefined) {
      globalStore.showToast({
        message: t('toast.student_not_joined'),
        type: 'notice'
      });
      return;
    }

    // allow or deny to annotate
    if (Boolean(annotationAllow)) {
      await roomStore.mute(uid, 'grantBoard');
      await roomStore.setApplyUid('0');
    } else {
      await roomStore.unmute(uid, 'grantBoard');
      await roomStore.setApplyUid(uid);
    }
    } catch (err) {}
  }

  return (
    <>
      <div className="controls-container">
        <div className="interactive">
          {notice ?
            <ControlItem name={notice.reason}
              onClick={onClick} />
            : null}
        </div>
        {(role === 'teacher') || showTool ?
          <div className="controls">
            {role === 'teacher' ?
              <>
                <div className="control-button">
                  <FirstPageIcon onClick={() => toggleFirstLast('first', setCanvasNumber, fileState.pdfFiles, fileState.setTotalPages)}>
                  </FirstPageIcon>
                  <span className="tooltiptext">First Canvas</span>
                </div>

                <div className="control-button">
                  <ArrowBackIosIcon onClick={() => togglePrev(setCanvasNumber, fileState.pdfFiles, fileState.setTotalPages)} />
                  <span className="tooltiptext">Previous Canvas</span>
                </div>
                <div className="current_page">
                  <span>{currentCanvasNumber}/{totalCanvas}</span>
                </div>
                <div className="control-button">
                  <ArrowForwardIosIcon onClick={() => toggleNext(setCanvasNumber, fileState.pdfFiles, fileState.setTotalPages)} />
                  <span className="tooltiptext">Next Canvas</span>
                </div>

                <div className="control-button">
                  <LastPageIcon onClick={() => toggleFirstLast('last', setCanvasNumber, fileState.pdfFiles, fileState.setTotalPages)} />
                  <span className="tooltiptext">Last Canvas</span>
                </div>

                <div className="control-button">
                  <AddCircleOutlineIcon id="add_page" onClick={() => fileState.fileDispatch({ type: 'add-page' })} />
                  <span className="tooltiptext">Add Canvas</span>
                </div>
                {
                  fileState.pdfFiles.length > 1 ?
                    <div className="control-button">
                      <RemoveCircleOutlineOutlinedIcon
                        id="remove_page"
                        onClick={
                          () => {
                            if (window.confirm('Are you sure you want to delete canvas?'))
                              fileState.fileDispatch({ type: 'remove-page' })
                          }
                        }
                      />
                      <span className="tooltiptext">Remove Canvas</span>
                    </div> : null
                }
                <div className='control-button'>
                  <GetAppIcon onClick={printDocument} />
                  <span className="tooltiptext">Download canvas</span>
                </div>
                <div className="menu-split" style={{ marginLeft: '7px', marginRight: '7px' }}></div>
              </> : null
            }
            {
              role === 'teacher' ?
                (
                  <>
                    {
                      isRecording ?
                        <div className="control-button">
                          <StopIcon onClick={handleScreenRecording} />
                          <span className="tooltiptext">Stop recording</span>
                        </div>
                        :
                        <div className="control-button">
                          <FiberManualRecordIcon onClick={handleScreenRecording} />
                          <span className="tooltiptext">Start recording</span>
                        </div>
                    }
                  </>
                ) : null
            }
            <div className="menu-split" style={{ marginLeft: '7px', marginRight: '7px' }}></div>

            {
              role === 'teacher' && roomType === 0 ?
                (
                  <>
                    {
                      !roomStore._state.course.allowAnnotation ?
                        <div className="control-button">
                          <CreateOutlinedIcon onClick={allowToAnnotate} />
                          <span className="tooltiptext">Allow annotation</span>
                        </div> :
                        <div className="control-button">
                          <CreateIcon style={{ color: green[500] }} onClick={allowToAnnotate} />
                          <span className="tooltiptext">Deny annotation</span>
                        </div>
                    }
                  </>
                ) : null
            }
            {role === 'teacher' ?
              showCreate ?
                <>
                  <ControlItem
                    name={pollView === 'create' ? 'poll_create' : 'poll_show'}
                    onClick={() => { pollView === 'create' ? handlePollTool('create_popup', true) : handlePollTool('show_popup', true) }}
                    text={pollView === 'create' ? '' : ''}
                  />
                </> : null
              : null}

            {role === 'student' ?
              <>
                <ControlItem
                  name={isHost ? 'hands_up_end' : 'hands_up'}
                  onClick={onClick}
                  text={''}
                />
              </>
              : null}

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

