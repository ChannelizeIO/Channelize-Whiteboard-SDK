import React from 'react';
import MediaBoard from '../../components/mediaboard';
import AnnouncementCard from '../../components/announcement/index';
import { useRoomState } from '../../containers/root-container';
import './small-class.scss';

export default function SmallClass() {
  const roomState = useRoomState();
  return (
    <div className="room-container">
      <div className="container">
        <AnnouncementCard role={roomState.me.role} />
        <MediaBoard />
      </div>
    </div>
  )
}
