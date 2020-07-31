import React, { useState, useEffect, useRef } from 'react';
import Icon from './icon';
import './nav.scss';
import Button from './custom-button';
import * as moment from 'moment';
import { ClassState } from '../utils/types';
import { platform } from '../utils/platform';
import { useRoomState } from '../containers/root-container';
import { roomStore } from '../stores/room';
import { globalStore } from '../stores/global';
import { t } from '../i18n';

interface NavProps {
  delay: string
  network: string
  cpu: string
  role: string
  roomName: string
  time: number
  showSetting: boolean
  classState: boolean
  onCardConfirm: (type: string) => void
  handleClick: (type: string) => void
}

const networkQualityIcon: {[key: string]: string} = {
  'excellent': 'network-good',
  'good': 'network-good',
  'poor': 'network-normal',
  'bad': 'network-normal',
  'very bad': 'network-bad',
  'down': 'network-bad',
  'unknown': 'network-bad',
}

export function Nav ({
  delay,
  network,
  role,
  roomName,
  time,
  handleClick,
  classState,
}: NavProps) {

  return (
    <>
    <div className={'nav-container'}>
      <div className="class-title">
        <span className="room-name">{roomName}</span>
        {role === 'teacher' ?
          <Button className={`nav-button ${classState ? "stop" : "start"}`} name={classState ? t('nav.class_end') : t('nav.class_start')} onClick={(evt: any) => {
            handleClick("classState")
          }} /> : null}
      </div>
      <div className="network-state">
        {platform === 'web' ? <span className="net-field">{t('nav.delay')}<span className="net-field-value">{delay}</span></span> : null}
        <span className="net-field net-field-container">
          {t('nav.network')}
          <span className={`net-field-value ${networkQualityIcon[network]}`} style={{marginLeft: '.2rem'}}>
          </span>
        </span>
      </div>
      <div className="menu">
        <div className="timer">
          <Icon className="icon-time" disable />
          <span className="time">{moment.utc(time).format('HH:mm:ss')}</span>
        </div>
        <span className="menu-split" />
        <div className={platform === 'web' ? "btn-group" : 'electron-btn-group' }>
          <Icon className="icon-exit" onClick={(evt: any) => {
            handleClick("exit");
          }} />
        </div>
      </div>
    </div>
    </>
  )
}

export default function NavContainer() {

  const ref = useRef<boolean>(false);

  const [time, updateTime] = useState<number>(0);

  const [timer, setTimer] = useState<any>(null);

  const calcDuration = (time: number) => {
    return setInterval(() => {
      !ref.current && updateTime(+Date.now() - time);
    }, 150, time)
  }

  const [card, setCard] = useState<boolean>(false);

  const [rtt, updateRtt] = useState<number>(0);
  const [quality, updateQuality] = useState<string>('unknown');
  const [cpuUsage, updateCpuUsage] = useState<number>(0);

  useEffect(() => {
    return () => {
      ref.current = true;
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
    }
  }, []);

  const roomState = useRoomState();

  const me = roomState.me;
  const courseState = roomState.course.courseState;
  const course = roomState.course;

  useEffect(() => {
    if (courseState === ClassState.STARTED
      && timer === null) {
        const now: number = +Date.now();
        setTimer(calcDuration(now));
        globalStore.showToast({
          type: 'notice',
          message: t('nav.class_started')
        });
    }
    if (timer && courseState === ClassState.CLOSED) {
      clearInterval(timer);
      setTimer(null);
      globalStore.showToast({
        type: 'notice',
        message: t('nav.class_ended')
      });
    }
  }, [courseState]);

  const lock = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      lock.current = true;
    }
  }, []);

  const updateClassState = () => {
    if (!lock.current) {
      lock.current = true;
      roomStore.updateMe({
        courseState: +!Boolean(roomStore.state.course.courseState)
      }).then(() => {
      }).catch(console.warn)
      .finally(() => {
        lock.current = false;
      })
    }
  };

  const handleClick = (type: string) => {
    if (type === 'setting') {
      setCard(true);
    } else if (type === 'exit') {
      globalStore.showDialog({
        type: 'exitRoom',
        message: t('toast.quit_room'),
      });
    } else if (type === 'classState') {
      updateClassState();
    }
  }

  const handleCardConfirm = (type: string) => {
    switch (type) {
      case 'setting':
        setCard(false);
        return;
      case 'exitRoom':
        globalStore.removeDialog();
        return;
    }
  }

  return (
    <Nav
      role={me.role}
      roomName={course.roomName}
      classState={Boolean(course.courseState)}
      delay={`${rtt}ms`}
      time={time}
      network={`${quality}`}
      cpu={`${cpuUsage}%`}
      showSetting={card}
      onCardConfirm={handleCardConfirm}
      handleClick={handleClick}
    />
  )
}