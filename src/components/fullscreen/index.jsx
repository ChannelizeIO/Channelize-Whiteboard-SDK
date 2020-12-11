import React, { useState } from 'react'

import FullscreenOutlinedIcon from '@material-ui/icons/FullscreenOutlined';
import FullscreenExitOutlinedIcon from '@material-ui/icons/FullscreenExitOutlined';

export default function FullScreen() {

  // full screen boolean
  const [fullScreen, setFullScreen] = useState(false);

  function handleFullscreenChange() {
    if (!document.fullscreenElement) {
      setFullScreen(false)
    } else {
      setFullScreen(true)
    }
  }

  const handleFullScreen = () => {

    const board = document.getElementById('Board');


    // register listener to handle esc key and minimize

    if (board) {
      board.onfullscreenchange = handleFullscreenChange;

      if (board.requestFullscreen && !fullScreen) {
        board.requestFullscreen();
      } else if (board.mozRequestFullScreen && !fullScreen) {
        /* Firefox */
        board.mozRequestFullScreen();
      } else if (board.webkitRequestFullscreen && !fullScreen) {
        /* Chrome, Safari and Opera */
        board.onwebkitfullscreenchange = handleFullscreenChange;
        board.webkitRequestFullscreen();
      } else if (board.msRequestFullscreen && !fullScreen) {
        /* IE/Edge */
        board.msRequestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  }

  return (
    <>
      {
        !fullScreen ?
          <>
            <FullscreenOutlinedIcon onClick={handleFullScreen} className='FullScreen' />
            <span className="tooltiptext">Full Screen</span>
          </>
          :
          <>
            <FullscreenExitOutlinedIcon onClick={handleFullScreen} className='NormalScreen' />
            <span className="tooltiptext">Exit Full Screen</span>
          </>
      }
    </>
  )
}
