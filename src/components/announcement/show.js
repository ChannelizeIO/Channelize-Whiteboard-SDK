import React from 'react';
import {useRoomState} from '../../containers/root-container';
import './show.scss';
const AnnouncementShow=()=>{

    const roomState = useRoomState()
    const  announcement  = roomState.announcement.announcement
    const  type  = roomState.announcement.type

    return (
      <>
   <div className="announcement-show">
     {type=="announcement_image"?<img src ={announcement} alt=''/>:null}
     {type=="announcement_text"?<h3>{announcement}</h3>:null}
     {announcement?
     <div className="text-box">
        Announcement
     </div>:null}
    </div>
      </>
  );
}
export default AnnouncementShow;
