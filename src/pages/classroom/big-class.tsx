import React, { useRef, useEffect } from 'react';
import './big-class.scss';
import MediaBoard from '../../components/mediaboard';
import { RoomMessage } from '../../utils/agora-rtm-client';
import { roomStore } from '../../stores/room';
import { useRoomState } from '../../containers/root-container';
import AnnouncementCard from '../../components/announcement/index';


export default function BigClass() {

  const roomState = useRoomState();
  const me = roomState.me;
  const role = me.role;

  const rtmLock = useRef<boolean>(false);
  const lock = useRef<boolean>(false);

  useEffect(() => {
    rtmLock.current = false;
    return () => {
      rtmLock.current = true;
      lock.current = true;
    }
  }, []);

  const handleClick = (type: string) => {

    if (rtmLock.current) return;

    if (type === 'hands_up') {
      if (roomStore.state.course.teacherId) {
        rtmLock.current = true;
        roomStore.rtmClient.sendPeerMessage(roomStore.state.course.teacherId,
          { cmd: RoomMessage.applyCoVideo })
          .then((result: any) => {
          })
          .catch(console.warn)
          .finally(() => {
            rtmLock.current = false;
          })
      }
    }

    if (type === 'hands_up_end') {
      if (roomStore.state.course.teacherId) {
        rtmLock.current = true;
        roomStore.rtmClient.sendPeerMessage(roomStore.state.course.teacherId,
          { cmd: RoomMessage.cancelCoVideo })
          .then((result: any) => {
          })
          .catch(console.warn)
          .finally(() => {
            rtmLock.current = false;
          })
      }
    }
  }

  // TODO: handleClose
  const closeLock = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      closeLock.current = true;
    }
  }, []);

  return (
    <div className="room-container">
      <div className="live-container">
        <AnnouncementCard role={role} />
        <MediaBoard handleClick={handleClick}>
        </MediaBoard>
      </div>
    </div>
  )
}
