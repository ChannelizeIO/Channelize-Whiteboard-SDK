import React, {useState} from 'react';
import { FormControl } from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import Button from '../custom-button';
import FormInput from '../new-form-input';
import Icon from '../icon';
import './create.scss';
import { useRoomState } from '../../containers/root-container';
import { roomStore } from '../../stores/room';

const useStyles = makeStyles ( Theme => ({
  formControl: {
    minWidth: '240px',
    maxWidth: '240px',
  }
}));

const PollCreate = props => {
    const roomState = useRoomState();
    const rtmClient = roomStore.rtmClient;
    const me = roomState.me;
    const roomName = roomState.course.roomName; 
    const classes = useStyles()
    // Declaring poll question and answers
    const [pollQuestion, setPollQuestion] = useState('');
    const[pollOptions, setPollOptions] = useState([
      {option: '', custom:false},
      {option: '', custom:false}
    ]);
    const [required, setRequired] = useState({});
  
  
    const handleDelete = (e) => {
      e.preventDefault()
      const id = e.target.value
      pollOptions.splice(id, 1)
      setPollOptions([...pollOptions])
    }
  
    const addOption = () => {
      if(pollOptions.length > 3) return
      const options = {
        option: '',
        custom: true
      }
  
      setPollOptions([...pollOptions, options])
    }
  
    const handleChange = (index, val) => {
      const option = {
        option: val,
        custom: pollOptions[index].custom
      }

      pollOptions[index] = option
      setPollOptions([...pollOptions], pollOptions)
    }
    
    const createPoll = async () => {
      if (!pollQuestion) {
        setRequired({questionError: 'missing poll question'});
        return;
      }
      if(!pollOptions[0].option) {
        return;
      }

      if(!pollOptions[1].option) {
        return;
      }


      const optionArr = []
      pollOptions.map(value => (
        optionArr.push({option: value.option, votes: 0, voterId: []})
      ))
      const poll = {
        type: 'poll',
        pollId: roomName + '_' + Date.now(),
        teacher: me.account,
        question: pollQuestion,
        options: optionArr,
        total:0
      }

      await rtmClient.sendChannelMessage(JSON.stringify(poll));
      const pollme = {
        pollId: roomName + '_' + Date.now(),
        teacher: me.account,
        question: pollQuestion,
        show:false,
        options: optionArr,
        total:1
      }
      roomStore.addPollData(pollme)
      props.tool('switch_view', 'show');
      props.tool('create_popup', false);
      setRequired({})
      setPollOptions([
        {option: '', custom:false},
        {option: '', custom:false}
      ])
      setPollQuestion('')

    }
  
    return (
      <>
      {props.createFlag ? 
      <div className={props.className ? props.className : "flex-container"}>
      <div className="custom-card poll-card_1">
        <Icon className="icon-close" icon onClick={() => {
          props.tool('create_popup', false)
        }}/>
        <div className="flex-item card">
         <div className="position-content flex-direction-column">
          <FormControl className={classes.formControl}>
              <FormInput Label={"What's your poll question?"} value={pollQuestion} onChange={(val) => {
                setPollQuestion(val)
              } }
              requiredText={required.questionError}
              />
            </FormControl> 
          { 
            pollOptions && pollOptions.length < 5 && pollOptions.map((option, i) => (
              <div className="poll-options">
              <FormControl className={classes.formControl}>
              <FormInput 
              Label={"Option " + (i + 1)  }
              onChange={handleChange.bind(this, i)}
              value={option.option}
              requiredText={required[0]}
              />
            </FormControl>      
            {option.custom ? <button className="delete-option" onClick={handleDelete} value={i}>X</button> :null}
            </div>
          ))
          }
          { pollOptions.length < 4 ?
          <button className="add-option" onClick={addOption}> + Add Option</button> : null
          }
          <Button name={"Create Poll"} onClick = {createPoll}/>
             </div>
             </div>
           </div>
          </div>
        :null}
        </>
    );
  }

export default PollCreate;
