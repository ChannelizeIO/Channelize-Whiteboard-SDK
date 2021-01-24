import React from 'react';
import Poll from 'react-polls';
import Button from '../custom-button';
import Icon from '../icon';
import './show.scss';
import { useRoomState } from '../../containers/root-container';
import { roomStore } from '../../stores/room';

const PollShow = props => {
  const roomState = useRoomState()
  const rtmClient = roomStore.rtmClient;

  const handleVote = async (voteAnswer) => {

    if (roomState.me.role === 'teacher' && roomState.poll.totalValue === 1) {
      let total = roomState.poll.totalValue;
      roomStore.updateVote(total);
    }
    if (roomState.me.role === 'teacher' && roomState.poll.totalValue === undefined) {
      let total = roomState.vt + 1;
      roomStore.updateVote(total);
    }

    const pollAnswers = roomState.poll.options

    const newPollAnswers = pollAnswers.map(answer => {
      if (answer.option === voteAnswer) {
        answer.votes++
        answer.voterId.push({ name: roomState.me.account })
      }
      return answer

    })

    const answerSubmit = {
      type: 'poll_answer',
      answer: newPollAnswers
    }

    try {
      await rtmClient.sendChannelMessage(JSON.stringify(answerSubmit));
      const pollOptions = roomState.poll.options
      let totalVotes = 0
      pollOptions.map(answer => {
        if (answer.votes) totalVotes += answer.votes
        return answer
      })

      const answer = {
        options: newPollAnswers,
        vt: totalVotes
      }

      roomStore.addPollVotes(answer);

      if (roomState.me.role === 'student') {
        const timer = setTimeout(() => {
          props.tool('show_popup', false)
        }, 2000);
        return () => clearTimeout(timer);
      }
    } catch (err) { }

  }

  const countVotes = () => {
    if (!roomState.poll.pollId)
      return
    const pollOptions = roomState.poll.options
    let totalVotes = 0
    pollOptions.map(answer => {
      if (answer.votes) totalVotes += answer.votes
      return answer
    })

  }
  const reportData = async () => {
    if (!roomState.poll.pollId)
      return
    const pollOptions = roomState.poll.options
    let totalVotes = 0
    pollOptions.map(answer => {
      if (answer.votes) totalVotes += answer.votes

      return answer
    })
    const data = {
      pollID: roomState.poll.pollId,
      teacherName: roomState.poll.teacher,
      question: roomState.poll.question,
      result: {
        totalVote: totalVotes,
        options: roomState.poll.options
      }
    }
    const fileName = roomState.poll.pollId;
    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: 'application/json' });
    const href = await URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = fileName + ".json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  }

  const fileName = 3;
  return (
    <>
      {roomState.poll.pollId && roomState.poll.show ?
        <div className={props.className ? props.className : "flex-container"}>
          <div className="custom-card show_poll_card_sec">
            {roomState.me.role === 'teacher' ? <Icon className="icon-close" icon onClick={() => {
              props.tool('show_popup', false)
            }} /> : null}
            <div className="flex-item card">
              <div className="position-content flex-direction-column">
                <Poll question={roomState.poll.question} answers={roomState.poll.options} onVote={handleVote} />
                <div className="details-button">
                  {roomState.me.role === 'teacher' ?
                    <>
                      <Button name={"End Poll"} onClick={props.end} />
                      <Button name={"Download Poll Detail"} onClick={reportData} />
                    </>
                    : null}
                </div>
              </div>
            </div>
          </div>
        </div> : null
      }
    </>
  )
}
export default PollShow;
