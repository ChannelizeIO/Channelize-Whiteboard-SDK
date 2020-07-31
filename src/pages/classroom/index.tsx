import React, { useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Nav from '../../components/nav';
import RoomDialog from '../../components/dialog/room';
import './room.scss';
import { roomStore } from '../../stores/room';
import { globalStore } from '../../stores/global';
import { t } from '../../i18n';

export const roomTypes = [
  {value: 0, text: 'One-on-One', path: 'one-to-one'},
  {value: 1, text: 'Small Class', path: 'small-class'},
  {value: 2, text: 'Large Class', path: 'big-class'},
];

export function RoomPage({ children }: any) {

  const history = useHistory();

  const lock = useRef<boolean>(false);

  useEffect(() => {

    const me = roomStore.state.me;
    const {
      rid,
      roomType,
      roomName,
      lockBoard,
      linkId,
    } = roomStore.state.course;

     const {rtmToken } = roomStore.state;

    if (!rid || !me.uid) {
      history.push('/');
    }

    const uid = me.uid;

    const payload = {
      rid,
      roomName,
      roomType,
      lockBoard,
      rtmToken,
      linkId: linkId,
      uid,
      role: me.role,
      account: me.account,
      boardId: me.boardId,
      grantBoard: me.grantBoard,
    }
    lock.current = true;
    if (roomStore.state.rtm.joined) return;
    globalStore.showLoading();
    roomStore.loginAndJoin(payload, true).then(() => {

    }).catch((err: any) => {
      globalStore.showToast({
        type: 'rtmClient',
        message: t('toast.login_failure'),
      });
      history.push('/');
    })
    .finally(() => {
      globalStore.stopLoading();
      lock.current = false;
    });
  }, []);

  const roomType = roomTypes[roomStore.state.course.roomType];

  const location = useLocation();

  useEffect(() => {
    return () => {
      globalStore.removeUploadNotice();
      roomStore.exitAll()
      .then(() => {
      })
      .catch(console.warn)
      .finally(() => {
      });
    }
  }, [location]);

  return (
    <div className={`classroom ${roomType.path}`}>
      <Nav />
      {children}
      <RoomDialog />
    </div>
  );
}
