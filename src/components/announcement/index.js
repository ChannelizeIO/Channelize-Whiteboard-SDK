import React from 'react';
import CreateAnnouncement from './create';
import AnnouncementShow from './show';

const AnnouncementCard = props =>  {

  return (
    <>
    { props.role === 'teacher' ?
    <CreateAnnouncement
    className="internal-card" 
    createFlag={props.createFlag}
    tool={props.tool}
    />
    :null}
    {props.role ==="student"?
    <AnnouncementShow
      className="internal-card" 
      tool={props.tool}
      end={props.endPoll}
      
      />:null}
    </>
    )
}

export default AnnouncementCard;
