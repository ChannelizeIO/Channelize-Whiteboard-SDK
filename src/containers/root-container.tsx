import React, { useEffect, useRef } from 'react';
import { GlobalState, globalStore} from '../stores/global';
import { RoomState, roomStore} from '../stores/room';
import {ErrorState, errorStore} from '../pages/error-page/state';
import { useHistory, useLocation } from 'react-router-dom';
import { resolveMessage, resolvePeerMessage, jsonParse } from '../utils/helper';
import GlobalStorage from '../utils/custom-storage';
import { t } from '../i18n';
export type IRootProvider = {
  globalState: GlobalState
  roomState: RoomState
  errorState: ErrorState
}

export interface IObserver<T> {
  subscribe: (setState: (state: T) => void) => void
  unsubscribe: () => void
  defaultState: T
}

function useObserver<T>(store: IObserver<T>) {
  const [state, setState] = React.useState<T>(store.defaultState);
  React.useEffect(() => {
    store.subscribe((state: any) => {
      setState(state);
    });
    return () => {
      store.unsubscribe();
    }
  }, []);

  return state;
}


export const RootContext = React.createContext({} as IRootProvider);

export const useStore = () => {
  const context = React.useContext(RootContext)
  if (context === undefined) {
    throw new Error('useStore must be used within a RootProvider');
  }
  return context;
}

export const useGlobalState = () => {
  return useStore().globalState;
}

export const useRoomState = () => {
  return useStore().roomState;
}

export const useErrorState = () => {
  return useStore().errorState;
}

export const RootProvider: React.FC<any> = ({children}) => {
  const globalState = useObserver<GlobalState>(globalStore);
  const roomState = useObserver<RoomState>(roomStore);
  const errorState = useObserver<ErrorState>(errorStore);
  const history = useHistory();

  const ref = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      ref.current = true;
    }
  }, []);

  const value = {
    globalState,
    roomState,
    errorState,
  }

  useEffect(() => {
    if (!roomStore.state.rtm.joined) return;
    const rtmClient = roomStore.rtmClient;
    rtmClient.on('ConnectionStateChanged', ({ newState, reason }: { newState: string, reason: string }) => {
      if (reason === 'LOGIN_FAILURE') {
        globalStore.showToast({
          type: 'rtmClient',
          message: t('toast.login_failure'),
        });
        history.push('/');
        return;
      }
      if (reason === 'REMOTE_LOGIN' || newState === 'ABORTED') {
        globalStore.showToast({
          type: 'rtmClient',
          message: t('toast.kick'),
        });
        history.push('/');
        return;
      }
    });
    rtmClient.on("MessageFromPeer", ({ message: { text }, peerId, props }: { message: { text: string }, peerId: string, props: any }) => {
      const body = resolvePeerMessage(text);
      resolveMessage(peerId, body);
      roomStore.handlePeerMessage(body.cmd, peerId)
      .then(() => {
      }).catch(console.warn);
    });
    rtmClient.on("AttributesUpdated", (attributes: object) => {
      console.log('AttributesUpdated###', attributes);
      roomStore.updateRoomAttrs(attributes)
    });
    rtmClient.on("MemberJoined", (memberId: string) => {
      globalStore.showToast({
        type: 'rtmClient',
        message: t('toast.user_joined'),
      });
    });

    rtmClient.on("MemberLeft", async (memberId: string) => {
      if (roomStore.state.applyUid === +memberId && roomState.me.role === 'teacher') {
      roomStore.updateCourseLinkUid(0)
        .then(() => {
          roomStore.updateMe({
            allowAnnotation: 0
          });
          globalStore.removeNotice();
        }).catch(console.warn);
      }
      globalStore.showToast({
        type: 'rtmClient',
        message: t('toast.user_leave'),
      });
    });
    rtmClient.on("MemberCountUpdated", (count: number) => {
      !ref.current && roomStore.updateMemberCount(count);
    });
    rtmClient.on("ChannelMessage", ({ memberId, message }: { message: { text: string }, memberId: string }) => {
      const msg = jsonParse(message.text);

      switch (msg.type) {
        case "poll":
          const poll = {
            pollId: msg.pollId,
            teacher: msg.teacher,
            question: msg.question,
            show: true,
            options: msg.options
          }
          roomStore.addPollData(poll)
          break;
        case "poll_answer":
          const votes = {
            options: msg.answer
          }
          roomStore.addPollVotes(votes)
          break;
        case "end_poll":
          roomStore.endPoll()
           break;
        case "announcement_text":
          const announcementTxt = {
            type: msg.type,
            aId: msg.aId,
            teacher: msg.teacher,
            announcement: msg.announcement,
            show:true
          }
          roomStore.addAnnouncementData(announcementTxt)
          break;
         case "announcement_image" :
          const announcementImg = {
            type: msg.type,
            aId: msg.aId,
            teacher: msg.teacher,
            announcement: msg.announcement,
            show:true
          }
          roomStore.addAnnouncementData(announcementImg)
          break;

          case "announcement_delete":
            const announcementDel = {
              type: msg.type,
              aId: msg.aId,
              teacher: msg.teacher,
              announcement: msg.announcement,
              show:true
            }
            roomStore.addAnnouncementData(announcementDel)
            break;

            case "annotation":
              const annotationData = {
                type: msg.type,
                svg: msg.svg,
                viewport: msg.viewport,
                annotations: msg.annotations,
                status: msg.status,
                annotationId: msg.annotationId
              }
              roomStore.sendAnnotation(annotationData)
              break;
            case "fileUpload":

              const fileData = {
                type: msg.type,
                fileType:msg.fileType,
                file:msg.file
              }


            roomStore.setFileData(fileData)

            break;

        default:
      }
      var totalVotes = 0;
      msg.answer.map((answer:any) => {
        if (answer.votes) totalVotes += answer.votes
          return answer
        });
      roomStore.updateVote(totalVotes);
    });
    return () => {
      rtmClient.removeAllListeners();
    }
  }, [roomStore.state.rtm.joined]);

  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') {
      return;
    }
    const room = value.roomState;
    GlobalStorage.save('agora_room', {
      me: room.me,
      course: room.course,
    });
    GlobalStorage.save('language', value.globalState.language);
    // WARN: DEBUG ONLY MUST REMOVED IN PRODUCTION
    //@ts-ignore
    window.errorState = errorState;
    //@ts-ignore
    window.room = roomState;
    //@ts-ignore
    window.globalState = globalState;
  }, [value, location]);
  return (
    <RootContext.Provider value={value}>
      {children}
    </RootContext.Provider>
  )
}
