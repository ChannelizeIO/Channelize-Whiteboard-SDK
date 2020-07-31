import React from 'react';
import PollCreate from './create';
import PollShow from './show';
const PollCard = props =>  {

  return (
    <>
    { props.role === 'teacher' ?
    <PollCreate
    className="internal-card" 
    createFlag={props.createFlag}
    tool={props.tool}
    />
    :null}
    <PollShow
      className="internal-card" 
      tool={props.tool}
      end={props.endPoll}
      />
    </>
    )
}
export default PollCard;
