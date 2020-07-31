import React, {useMemo} from 'react';
import Button from '../custom-button';
import {Dialog, DialogContent, DialogContentText} from '@material-ui/core';

import './dialog.scss';
import { useGlobalState } from '../../containers/root-container';
import { roomStore } from '../../stores/room';
import { globalStore } from '../../stores/global';
import { useHistory } from 'react-router-dom';
import { RoomMessage } from '../../utils/agora-rtm-client';
import { t } from '../../i18n';

interface RoomProps {
  onConfirm: (type: string) => void
  onClose: (type: string) => void
  desc: string
  type: string
}

function RoomDialog(
{
  onConfirm,
  onClose,
  desc,
  type
}: RoomProps) {

  const handleClose = () => {
    onClose(type)
  };

  const handleConfirm = () => {
    onConfirm(type)
  }

  return (
    <div>
      <Dialog
        disableBackdropClick
        open={true}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent
          className="modal-container"
        >
          <DialogContentText className="dialog-title">
            {desc}
          </DialogContentText>
          <div className="button-group">
            <Button name={t("toast.confirm")} className="confirm" onClick={handleConfirm} color="primary" />
            <Button name={t("toast.cancel")} className="cancel" onClick={handleClose} color="primary" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const DialogContainer = () => {

  const history = useHistory();
  const {dialog} = useGlobalState();
  

  const visible = useMemo(() => {
    if (!dialog.type) return false;
    return true;
  }, [dialog]);

  const onClose = (type: string) => {
    if (type === 'exitRoom') {
      globalStore.removeDialog();
      // history.push('/');
    }
    else if (type === 'apply') {
      roomStore.rtmClient.sendPeerMessage(
        `${roomStore.applyUid}`, {cmd: RoomMessage.rejectCoVideo}
      ).then(() => {
        globalStore.removeDialog();
      }).catch(console.warn);
    }
  }

  const onConfirm = (type: string) => {
    if (type === 'exitRoom') {
      globalStore.removeDialog();
      Object.keys(localStorage).forEach((key) => {
        if (key.indexOf('/annotations') !== -1) {
          localStorage.removeItem(`${key}`);
        }
      });
      history.push('/');
    }
    else if (type === 'apply') {
      Promise.all([
        roomStore.rtmClient.sendPeerMessage(
          `${roomStore.applyUid}`, {cmd: RoomMessage.acceptCoVideo}
        ),
        roomStore.updateCourseLinkUid(roomStore.applyUid)
      ]).then(() => {
        
        globalStore.removeNotice();
        globalStore.removeDialog();
      }).catch(console.warn);
    }

    return;
  }
 
  return (
    visible ? 
      <RoomDialog 
        type={dialog.type}
        desc={dialog.message}
        onClose={onClose}
        onConfirm={onConfirm}
      /> : 
      null
  )
}


export default React.memo(DialogContainer);