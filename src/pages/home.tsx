import React, { useState, useEffect, useRef } from 'react';
import { Theme, FormControl } from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import Button from '../components/custom-button';
import RoleRadio from '../components/role-radio';
import FormInput from '../components/form-input';
import FormSelect from '../components/form-select';
import LangSelect from '../components/lang-select';
import {useHistory} from 'react-router-dom';
import { roomStore } from '../stores/room';
import { genUid } from '../utils/helper';
import MD5 from 'js-md5';
import { globalStore, roomTypes } from '../stores/global';
import { t } from '../i18n';
import GlobalStorage from '../utils/custom-storage';

const useStyles = makeStyles ((theme: Theme) => ({
  formControl: {
    minWidth: '240px',
    maxWidth: '240px',
  }
}));

type SessionInfo = {
  roomName: string
  roomType: number
  yourName: string
  role: string
}

const defaultState: SessionInfo = {
  roomName: '',
  roomType: 0,
  role: '',
  yourName: '',
}

function HomePage() {
  document.title = t(`home.short_title.title`)
  const classes = useStyles();

  const history = useHistory();

  const ref = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      ref.current = true;
    }
  }, []);

  const [session, setSessionInfo] = useState<SessionInfo>(defaultState);

  const [required, setRequired] = useState<any>({} as any);

  const handleSubmit = () => {
    if (!session.roomName) {
      setRequired({...required, roomName: t('home.missing_room_name')});
      return;
    }

    if (!session.yourName) {
      setRequired({...required, yourName: t('home.missing_your_name')});
      return;
    }

    if (!session.role) {
      setRequired({...required, role: t('home.missing_role')});
      return;
    }
    if (!roomTypes[session.roomType]) return;
    const path = roomTypes[session.roomType].path
    const payload = {
      uid: genUid(),
      rid: `${session.roomType}${MD5(session.roomName)}`,
      role: session.role,
      roomName: session.roomName,
      roomType: session.roomType,
      video: 0,
      audio: 0,
      chat: 0,
      account: session.yourName,
      rtmToken: '',
      boardId: '',
      linkId: 0,
      sharedId: 0,
      lockBoard: 0,
      grantBoard: 0,
    }
    ref.current = true;
    globalStore.showLoading();
    roomStore.loginAndJoin(payload).then(() => {
      Object.keys(localStorage).forEach((key) => {
        if (key.indexOf('/annotations') !== -1) {
          localStorage.removeItem(`${key}`);
        }
      });
      history.push(`/classroom/${path}`);
    }).catch((err: any) => {
      if (err.reason) {
        globalStore.showToast({
          type: 'rtmClient',
          message: t('toast.rtm_login_failed_reason', {reason: err.reason}),
        })
      } else {
        globalStore.showToast({
          type: 'rtmClient',
          message: t('toast.rtm_login_failed'),
        })
      }
      console.warn(err);
    })
    .finally(() => {
        ref.current = false;
        globalStore.stopLoading();
    })
  }

  return (
    <div className={`flex-container home-cover-web`}>
      <div className="web-menu">
        <div className="web-menu-container">
          <span className="site-logo">
          </span>
          <div className="short-title">
            <span className="title">{t('home.short_title.title')}</span>
            <span className="subtitle">{t('home.short_title.subtitle')}</span>
          </div>
        </div>
      </div>
      <div className="card-container">
      <div className="card-info">
        <div className="card-info-block">
        <span className="card-title">
          <h3>Modern JavaScript based Whiteboard for Collaboration in Online Education</h3>
          <p>Channelize Whiteboard is a leading open source whiteboard solution that powers innovation in Tele-education by adding engagement in online learning. It is rich in features, compatible with diverse frameworks, and easy to integrate and extend.</p>
        </span>
        </div>
      </div>
      <div className="custom-card">
        <div className="flex-item cover">
            <div className={`cover-placeholder-web ${t('home.cover_class')}`}></div>
        </div>
        <div className="flex-item card">
          <div className="position-content flex-direction-column">
            <FormControl className={classes.formControl}>
              <FormInput Label={t('home.room_name')} value={session.roomName} onChange={
                (val: string) => {
                  setSessionInfo({
                    ...session,
                    roomName: val
                  });
                }}
                requiredText={required.roomName}
              />
            </FormControl>
            <FormControl className={classes.formControl}>
              <FormInput Label={t('home.nickname')} value={session.yourName} onChange={
                (val: string) => {
                  setSessionInfo({
                    ...session,
                    yourName: val
                  });
                }}
                requiredText={required.yourName}
              />
            </FormControl>
            <FormControl className={classes.formControl}>
              <FormSelect
                Label={t('home.room_type')}
                value={session.roomType}
                onChange={(evt: any) => {
                  setSessionInfo({
                    ...session,
                    roomType: evt.target.value
                  });
                }}
                items={roomTypes.map((it: any) => ({
                  value: it.value,
                  text: t(`${it.text}`),
                  path: it.path
                }))}
              />
            </FormControl>
            <FormControl className={classes.formControl}>
              <RoleRadio value={session.role} onChange={(evt: any) => {
                 setSessionInfo({
                   ...session,
                   role: evt.target.value
                 });
              }} requiredText={required.role}></RoleRadio>
            </FormControl>
            <Button name={t('home.room_join')} onClick={handleSubmit}/>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
export default React.memo(HomePage);
