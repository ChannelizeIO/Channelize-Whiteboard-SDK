import React, { useState } from 'react';
import { Theme, FormControl } from '@material-ui/core';
import Button1 from '../custom-button';
import FormInput from '../new-form-input';
import Icon from '../icon';
import './create.scss';
import { useRoomState } from '../../containers/root-container';
import { roomStore } from '../../stores/room';
import { useGlobalState } from '../../containers/root-container';
import { globalStore } from '../../stores/global';

import RoomDialog from '../../components/dialog/room';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import FileBase64 from 'react-file-base64';

const announcementTypes = ['Text Type Announcement', 'Image Type Announcement'];

const useStyles = makeStyles((theme) => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    width: 'fit-content',
  },
  formControl: {
    marginTop: theme.spacing(2),
    minWidth: 120,
  },
  formControlLabel: {
    marginTop: theme.spacing(1),
  },
}));

export default function CreateAnnouncement(props) {
  const roomState = useRoomState();
  const rtmClient = roomStore.rtmClient;
  const me = roomState.me;
  const roomName = roomState.course.roomName;
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [valueTxt, setValueTxt] = React.useState('');
  const [valueImg, setValueImg] = React.useState('');
  const [isText, setText] = React.useState(true);
  const [isImage, setImage] = React.useState(false);
  const [isErr, setErr] = React.useState(false);
  const [fullWidth, setFullWidth] = React.useState(false);
  const [announcementType, setAnnouncementType] = React.useState('announcement_text');
  const [file, setFile] = React.useState([]);
  const [require, setRequire] = useState({});


  const getFiles = (file) => {
    setFile(file)
  }

  const handleClickOpen = () => {
    setOpen(true);
    setErr(false);
  };

  const handleClose = () => {
    setRequire({});
    setOpen(false);
    setErr(false);
  };

  const handleannouncementTypeChange = (event) => {
    setAnnouncementType(event.target.value);


    if (event.target.value == "announcement_text") {

      setText(true);
      setImage(false);

    }
    if (event.target.value == "announcement_img") {
      setImage(true);
      setText(false);
    }
    setRequire({});
    setErr(false);

  };

  const handleFullWidthChange = (event) => {
    setFullWidth(event.target.checked);
  };


  const handleChangeTxt = (event) => {
    setValueTxt(event.target.value);
  };
  const handleChangeImg = (event) => {
    setValueImg(event.target.value);
  };

  const addAnnouncement = async (type) => {
    try {
      setErr(false);
      
      
      if (!valueTxt && !file.length) {
        setRequire({ announcementError: 'Pleae add announcement!' });
        
        
        return;
      }


      const announcement = {
        type: isText ? "announcement_text" : "announcement_image",
        aId: roomName + '_' + Date.now(),
        teacher: me.account,
        announcement: isText ? valueTxt : file[0].base64

      }

      await rtmClient.sendChannelMessage(JSON.stringify(announcement));
      const ren =
      {
        svg: `<svg class="customAnnotationLayer" width="612" height="792" data-pdf-annotate-container="true" data-pdf-annotate-viewport="{&quot;viewBox&quot;:[0,0,612,792],&quot;scale&quot;:1,&quot;rotation&quot;:0,&quot;offsetX&quot;:0,&quot;offsetY&quot;:0,&quot;transform&quot;:[1,0,0,-1,0,792],&quot;width&quot;:612,&quot;height&quot;:792}" style="width: 612px; height: 792px;" data-pdf-annotate-document="/static/media/Welcome.4a1c340f.pdf" data-pdf-annotate-page="1"></svg>`, viewport: '', annotations: {
          annotations: [{
            class: "Annotation",
            color: undefined,
            height: 224,
            page: 1,
            type: "area",
            uuid: "c00420fb-ea79-48f2-a55c-98af2b3d7fd1",
            width: 490,
            x: 243,
            y: 230,
          }], "documentId": "/static/media/Welcome.4a1c340f.pdf",
          "pageNumber": 1
        }, type: "annotation"
      }

      
      await rtmClient.sendChannelMessage(JSON.stringify(ren));

      roomStore.addAnnouncementData(announcement);
      roomStore.sendAnnotation(ren)
      const announcementCreated = {
        isCreated: true
      }
      roomStore.setAnnouncementCreated(announcementCreated);
      setRequire({});
      setFile([]);
      setOpen(false);
      setErr(false);
    }
    catch (err) {
      
      setErr(true);
      setFile([]);
      setRequire({ announcementSizeError: 'It seems that you are uploading or sending text more than 32KB, Please upload image or send less than 32KB. If you want to send larger image then you can use the link of the image and that can be sent through the text announcement ' });

    }


  }
  const deleteAnnouncement = async () => {
    const announcement = {
      type: "announcement_delete",
      aId: "",
      teacher: me.account,
      announcement: ""

    }

    await rtmClient.sendChannelMessage(JSON.stringify(announcement));
    roomStore.addAnnouncementData(announcement);
    const announcementCreated = {
      isCreated: false
    }
    roomStore.setAnnouncementCreated(announcementCreated);
    setFile([]);
    setRequire({});
    setOpen(false);
    setErr(false);

  }
  return (
    <>

      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        {!roomState.isAnnouncementCreated.isCreated ? "Create Announcement" : "Edit/Delete Annoucement"}
      </Button>
      <Dialog
        fullWidth={fullWidth}
        announcementType={announcementType}
        open={open}
        onClose={handleClose}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle id="max-width-dialog-title">Create Announcement</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You can create text or image announcement type. Select to create one.
          </DialogContentText>
          <form className={classes.form} noValidate>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="max-width">Announcement Type</InputLabel>
              <Select
                autoFocus
                value={announcementType}
                onChange={handleannouncementTypeChange}
                inputProps={{
                  name: 'max-width',
                  id: 'max-width',

                }}
              >

                <MenuItem value="announcement_text">Text Announcement</MenuItem>
                <MenuItem value="announcement_img">Image Announcement</MenuItem>

              </Select>
            </FormControl>
            {isText ? <TextField

              id="standard-multiline-flexible"
              label="Enter your announcement"
              multiline
              rowsMax={4}
              value={valueTxt}
              onChange={handleChangeTxt}
              helperText={require.announcementError}
            /> : null}
            {roomState.announcement.type == "announcement_image" && isImage ? <img src={roomState.announcement.announcement} /> : null}
            {isImage ? <FormControl className={classes.formControl}><FileBase64
              multiple={true}

              onDone={getFiles.bind(this)}

            /></FormControl>
              : null}
            {require.announcementError && isImage ? <p id="uploadImg">{require.announcementError ? "Please upload image" : null}</p> : null}
            {require.announcementSizeError && isImage ? <p id="uploadImg">{require.announcementSizeError ? require.announcementSizeError : null}</p> : null}

          </form>

        </DialogContent>
        <DialogActions>

          {roomState.isAnnouncementCreated.isCreated ? <Button onClick={deleteAnnouncement} color="primary">
            Delete
          </Button> : null}
          <Button onClick={addAnnouncement} color="success">
            Create
          </Button>
          <Button onClick={handleClose} color="danger">
            Close
          </Button>
        </DialogActions>
      </Dialog>

    </>
  );
}


