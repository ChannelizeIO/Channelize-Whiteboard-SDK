import { useState } from 'react';
import { roomStore } from '../stores/room';

export default function usePollData() {
	const rtmClient = roomStore.rtmClient;
	const [ createPollFlag, setCreatePollFlag ] = useState(false);
	const [ pollView, switchPollView ] = useState('create');

	const handlePollTool = (type, value) => {
		if (type === 'create_popup') {
			setCreatePollFlag(value);
		} else if (type === 'show_popup') {
			roomStore.openPollDetail(value);
		} else if (type === 'switch_view') {
			switchPollView(value);
		}
	};

	const endPoll = async () => {
		try {
		await rtmClient.sendChannelMessage(JSON.stringify({ type: 'end_poll' }));
		roomStore.endPoll();
		switchPollView('create');
		} catch(err) {}
	};

	return {
		createPollFlag,
		pollView,
		handlePollTool,
		endPoll
	};
}
