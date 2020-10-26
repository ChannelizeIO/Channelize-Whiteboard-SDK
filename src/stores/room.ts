import { Subject } from 'rxjs';
import { Map, List } from 'immutable';
import AgoraRTMClient, { RoomMessage } from '../utils/agora-rtm-client';
import { globalStore } from './global';
import { get, set, isEmpty } from 'lodash';
import GlobalStorage from '../utils/custom-storage';
import { t } from '../i18n';
import { jsonParse } from '../utils/helper';

function canJoin({ onlineStatus, roomType, channelCount, role }: { onlineStatus: any, role: string, channelCount: number, roomType: number }) {
  const result = {
    permitted: true,
    reason: ''
  }
  const channelCountLimit = [2, 17, Infinity];

  let maximum = channelCountLimit[roomType];
  if (channelCount >= maximum) {
    result.permitted = false;
    result.reason = t('toast.teacher_and_student_over_limit');
    return result;
  }

  const teacher = get(onlineStatus, 'teacher', false);
  const studentsTotalCount: number = get(onlineStatus, 'studentsTotalCount', 0);

  if (role === 'teacher') {
    const isOnline = teacher;
    if (isOnline) {
      result.permitted = false;
      result.reason = t('toast.teacher_exists');
      return result;
    }
  }

  if (role === 'student') {
    if (studentsTotalCount >= maximum - 1) {
      result.permitted = false;
      result.reason = t('toast.student_over_limit');
      return result;
    }
  }

  return result;
}

export type LocalAttrs = Partial<AgoraUser & ClassState>;

export type ChannelAttrs = {
  uid: string
  account: string
  role: string
  class_state?: number
  whiteboard_uid: string
  link_uid: number
  lock_board?: number
  grant_board: number
};
export interface AgoraUser {
  uid: string
  account: string
  role: string
  boardId: string
  linkId: number
  lockBoard: number
  grantBoard: number
}

export interface ClassState {
  rid: string
  roomName: string
  teacherId: string
  roomType: number
  boardId: string
  linkId: number
  lockBoard: number
  courseState: number
  allowAnnotation: number
}

export type SessionInfo = {
  uid: string
  rid: string
  account: string
  roomName: string
  roomType: number
  role: string
}

export type RtmState = {
  joined: boolean
  memberCount: number
}

export type VoteUser = {
  name : string
}

export interface PollOptions {
  option: string
  votes: number
  voterId: List<VoteUser>
}

export type PollData = {
  pollId: string
  teacher: string
  question: string
  show: boolean
  totalValue:any
  options : List<PollOptions>
}
export type AnnouncementData = {
  aId: any
  teacher: any
  announcement:any
  type:any
  show:boolean
  
}

export type AnnotatePdfData={
  annotations:any,type:any,status:any,annotationId:any
}
export type pdfData={
  file:any,
  fileType:any
  type:any
}
export type AnnouncementCreated={
 isCreated:boolean
}



export type RoomState = {
  rtmLock: boolean
  rtmToken: string
  me: AgoraUser
  users: Map<string, AgoraUser>
  course: ClassState
  applyUid: number
  rtm: RtmState
  poll: PollData
  language: string
  vt:number
  announcement:AnnouncementData
  isAnnouncementCreated:AnnouncementCreated,
  annotatePdf:AnnotatePdfData,
  pdfData:pdfData
}

export class RoomStore {
  private subject: Subject<RoomState> | null;
  public _state: RoomState;

  get state() {
    return this._state;
  }

  set state(newState) {
    this._state = newState;
  }
  public readonly defaultState: RoomState = Object.freeze({
    rtmLock: false,
    rtmToken: '',
    vt:0,
    me: {
      account: "",
      uid: "",
      role: "",
      linkId: 0,
      boardId: '',
      lockBoard: 0,
      grantBoard: 0,
    },
    users: Map<string, AgoraUser>(),
    applyUid: 0,
    rtm: {
      joined: false,
      memberCount: 0,
    },
    course: {
      teacherId: '',
      boardId: '',
      linkId: 0,
      courseState: 0,
      rid: '',
      roomName: '',
      roomType: 0,
      lockBoard: 0,
      allowAnnotation: 0,
    },
    poll: {
      totalValue:'',
      pollId: '',
      teacher: '',
      question: '',
      show: false,
      options : List<PollOptions>(),
    },
    announcement:{
      aId: '',
      teacher: '',
      announcement:'',
      type:'',
      show:false
    },
    isAnnouncementCreated:{
      isCreated:false
    },
    annotatePdf:{
      annotations:'',
      type:'',
      status:'',
      annotationId:''
    },
    pdfData:{
      file:'',
      fileType:'',
      type:''
    },
    language: navigator.language,
    ...GlobalStorage.read('agora_room')
  });

  private applyLock: number = 0;

  public windowId: number = 0;

  private uploadByMe: number = 0;

  public rtmClient: AgoraRTMClient;

  constructor() {
    this.subject = null;
    this._state = {
      ...this.defaultState
    };
    this.rtmClient = new AgoraRTMClient();
  }

  initialize() {
    this.subject = new Subject<RoomState>();
    this.state = {
      ...this.defaultState,
    }
    this.applyLock = 0;
    this.uploadByMe = 0;
    this.subject.next(this.state);
  }

  get applyUid() {
    return this.applyLock;
  }

  get uploadBy() {
    return this.uploadByMe;
  }

  subscribe(updateState: any) {
    this.initialize();
    this.subject && this.subject.subscribe(updateState);
  }

  unsubscribe() {
    this.subject && this.subject.unsubscribe();
    this.subject = null;
  }

  commit(state: RoomState) {
    this.subject && this.subject.next(state);
  }

  updateState(rootState: RoomState) {
    this.state = {
      ...this.state,
      ...rootState,
    }
    this.commit(this.state);
  }

  isTeacher(peerId: string) {
    if (!peerId
      || !this.state.course.teacherId
      || this.state.course.teacherId !== peerId
    ) return false;
    return true;
  }

  isStudent(peerId: string) {
    if (!peerId
      || this.state.course.teacherId === peerId
    ) return false;

    return true;
  }

  updateMemberCount(count: number) {
    this.state = {
      ...this.state,
      rtm: {
        ...this.state.rtm,
        memberCount: count,
      }
    }
    this.commit(this.state);
  }

  async handlePeerMessage(cmd: RoomMessage, peerId: string) {
    if (!peerId) return console.warn('state is not assigned');
    const myUid = this.state.me.uid;
    console.log("Teacher: ", this.isTeacher(myUid), ", peerId: ", this.isStudent(peerId));
    // student follow teacher peer message
    if (!this.isTeacher(myUid) && this.isTeacher(peerId)) {
      switch (cmd) {
        case RoomMessage.muteBoard: {
          globalStore.showToast({
            type: 'notice',
            message: t('toast.teacher_cancel_whiteboard'),
          });
          return await this.updateMe({ grantBoard: 0 });
        }
        case RoomMessage.unmuteBoard: {
          globalStore.showToast({
            type: 'notice',
            message: t('toast.teacher_accept_whiteboard')
          });
          return await this.updateMe({ grantBoard: 1 });
        }
        default:
      }
      return;
    }
    

    // when i m teacher & received student message
    if (this.isTeacher(myUid) && this.isStudent(peerId)) {
      switch (cmd) {
        case RoomMessage.unmuteBoard: {
          // WARN: LOCK
          if (this.state.course.linkId && roomStore.state.course.allowAnnotation) {
            return console.warn('already received apply id: ', this.applyLock);
          }
      
          const applyUser = roomStore.state.users.get(`${peerId}`);
          if (applyUser) {
            this.applyLock = +peerId;
            console.log("applyUid: ", this.applyLock);
            this.state = {
              ...this.state,
              applyUid: this.applyLock,
            }
            this.commit(this.state);
            globalStore.showNotice({
              reason: 'peer_hands_up',
              text: t('notice.student_interactive_apply', { reason: applyUser.account }),
            });
          }
          return;
        }

        case RoomMessage.muteBoard: {
          // WARN: LOCK
          if (this.state.course.linkId && `${this.state.course.linkId}` === peerId) {
            roomStore.updateCourseLinkUid(0).then(() => {
              this.setAllowAnnotation(0);
            }).catch(console.warn);
            globalStore.showToast({
              type: 'co-video',
              message: t('toast.student_cancel_co_video')
            });
          }
          return;
        }
        default:
      }
      return;
    }
  }

  async setUploadByme(num: number) {
    this.uploadByMe = num;
  }

  async mute(uid: string, type: string) {
    const me = this.state.me;
     if (me.role === 'teacher') {
      if (type === 'grantBoard') {
        await this.rtmClient.sendPeerMessage(`${uid}`, { cmd: RoomMessage.muteBoard });
        this.updateMe({allowAnnotation: 0});
      }
    }
  }

  async unmute(uid: string, type: string) {
    const me = this.state.me;

    if (me.role === 'teacher') {
      if (type === 'grantBoard') {
        await this.rtmClient.sendPeerMessage(`${uid}`, { cmd: RoomMessage.unmuteBoard });
        this.updateMe({allowAnnotation: 1});
      }
    }
  }

  async loginAndJoin(payload: any, pass: boolean = false) {
    const { roomType, role, uid, rid, rtmToken } = payload;
    console.log("payload: ", payload);
    let result = { permitted: true, reason: '' };
    await this.rtmClient.login(uid, rtmToken);
    try {
      const channelMemberCount = await this.rtmClient.getChannelMemberCount([rid]);
      const channelCount = channelMemberCount[rid];
      let accounts = await this.rtmClient.getChannelAttributeBy(rid);
      const onlineStatus = await this.rtmClient.queryOnlineStatusBy(accounts);
      console.log("onlineStatus", onlineStatus);
      const argsJoin = {
        channelCount,
        onlineStatus,
        role,
        accounts,
        roomType
      };
      result = pass === false ? canJoin(argsJoin) : { permitted: true, reason: '' };
      if (result.permitted) {
        let res = await this.rtmClient.join(rid);
        const grantBoard = role === 'teacher' ? 1 : payload.grantBoard;
        await this.updateMe({ ...payload, grantBoard });
        this.state = {
          ...this.state,
          rtm: {
            ...this.state.rtm,
            joined: true
          },
        }
        console.log("loginAndJoin>>>>: accounts", accounts);
        this.commit(this.state);
        return;
      }
      throw {
        type: 'not_permitted',
        reason: result.reason
      }
    } catch (err) {
      if (this.rtmClient._logged) {
        await this.rtmClient.logout();
      }
      throw err;
    }
  }

  async updateCourseLinkUid(linkId: number) {
    const me = this.state.me;
    console.log("me: link_uid", me, linkId);
    let res = await this.updateMe({
      linkId,
    })
    this.applyLock = linkId;
    console.log("current apply lock: ", this.applyLock);
    return res;
  }

  async updateWhiteboardUid(boardId: string) {
    let res = await this.updateMe({
      boardId
    });
    console.log("[update whiteboard uuid] res", boardId);
    return res;
  }

  updateVote(msg:number) {
    this.state = {
      ...this.state,
      vt: msg
    };

    this.commit(this.state);
  }

  addPollData(data: any) {
    this.state = {
      ...this.state,
      poll: {
        ...this.state.poll,
        pollId: data.pollId,
        teacher: data.teacher,
        question: data.question,
        show: data.show,
        options : data.options,
        totalValue:data.total
      }
    }
    this.commit(this.state);
  }

  addPollVotes(votes: any) {
    console.log(votes);
    this.state = {
      ...this.state,
      poll: {
        ...this.state.poll,
        options:votes.options,
        totalValue:votes.vt

      }
    }
    

    this.commit(this.state);
  }
  
  openPollDetail(view: boolean) {
    this.state = {
      ...this.state,
      poll: {
        ...this.state.poll,
        show: view
      }
    }
    this.commit(this.state);
  }

  endPoll() {
    this.state = {
      ...this.state,
      poll: {
        pollId: '',
        teacher: '',
        question: '',
        totalValue:'',
        show: false,
        options : List<PollOptions>()
      }
    }
    roomStore.updateVote(0);
    this.commit(this.state); 
  }
  
  addAnnouncementData(data: any) {
    
    console.log(data);
    this.state = {
      ...this.state,
     announcement:{
       
      
        aId: data.aId,
        teacher: data.teacher,
        announcement: data.announcement,
        type : data.type,
        show:data.show
     }
     
    }
     
    
    this.commit(this.state);
  }
  
  setAnnouncementCreated(data:any)
  {
    this.state = {
      ...this.state,
     isAnnouncementCreated:{
       isCreated: data.isCreated
     }
    }
    this.commit(this.state); 
    
  }

  sendAnnotation(data:any)
  {
    this.state={
      ...this.state,
      annotatePdf:{
        annotations:data.annotations,
        type:data.type,
        status: data.status,
        annotationId: data.annotationId
      }
    }
    this.commit(this.state);
  }

  setFileData(data:any){
    console.log(data)
    this.state={
      ...this.state,
      pdfData:{
        file: data.file,
        fileType:data.fileType,
        type: data.type
      }
    }
    this.commit(this.state);
    
  }
  
  
  private compositeMe(params: Partial<AgoraUser>): AgoraUser {
    console.log("compositeMe: ", params);
    const newMe: AgoraUser = { ...this.state.me };
    for (const prop in params) {
      if (newMe.hasOwnProperty(prop) && params.hasOwnProperty(prop)) {
        set(newMe, prop, get(params, prop, ''));
      }
    }
    return newMe;
  }

  private compositeCourse(params: Partial<ClassState>): ClassState {
    console.log("compositeCourse: ", params);
    const newCourse = { ...this.state.course };
    console.log('newCourse', newCourse)
    for (const prop in params) {
      if (newCourse.hasOwnProperty(prop) && params.hasOwnProperty(prop)) {
        set(newCourse, prop, get(params, prop, ''));
      }
    }
    return newCourse;
  }

  private exactChannelAttrsBy(me: AgoraUser, course: ClassState): ChannelAttrs {
    console.log("origin: ", me, course);
    const newChannelAttrs: ChannelAttrs = {
      uid: me.uid,
      account: `${me.account}`,
      role: `${me.role}`,
      whiteboard_uid: me.boardId,
      link_uid: +me.linkId,
      lock_board: +me.lockBoard,
      grant_board: +me.grantBoard,
    }

    if (!course.boardId && me.boardId) {
      newChannelAttrs.whiteboard_uid = me.boardId;
    }

    if (me.role === 'teacher') {
      newChannelAttrs.lock_board = course.lockBoard;
      newChannelAttrs.class_state = course.courseState;
      newChannelAttrs.grant_board = course.allowAnnotation
    }
    return newChannelAttrs;
  }

  async updateMe(params: LocalAttrs) {
    const newMe = this.compositeMe(params);
    const newCourse = this.compositeCourse(params);
    const {
      role,
      uid,
    } = newMe;

    const channelKey: string = role === 'teacher' ? 'teacher' : `${uid}`;

    if (role === 'teacher') {
      newCourse.teacherId = uid;
    }

    const channelAttrs = this.exactChannelAttrsBy(newMe, newCourse);
    
    this.state = {
      ...this.state,
      me: {
        ...newMe,
      },
      users: this.state.users.set(newMe.uid, {
        ...newMe
      }),
      course: {
        ...newCourse,
      }
    }
    this.commit(this.state);
    let res = await this.rtmClient.updateChannelAttrsByKey(channelKey, channelAttrs);
    return res;
  }

  private exactChannelAttrsFrom(json: object) {
    const defaultCourseState = {
      class_state: 0,
      link_uid: 0,
      whiteboard_uid: 0,
      lock_board: 0,
      grant_board: 0,
    }


    const AgoraUserKeys: string[] = [
      'uid',
      'account',
      'role',
      'whiteboard_uid',
      'link_uid',
      'class_state',
      'grant_board',
      'lock_board'
    ];
    const teacherJson = jsonParse(get(json, 'teacher.value'));
    const course: any = {};
    if (teacherJson) {
      for (const prop in teacherJson) {
        if (defaultCourseState.hasOwnProperty(prop)) {
          course[prop] = teacherJson[prop];
        }
      }
    }

    const students = [];
    for (let key of Object.keys(json)) {
      if (key === 'teacher') continue;
      const student = jsonParse(get(json, `${key}.value`));
      if (!isEmpty(student)) {
        student.uid = key;
        students.push(Object.freeze(student));
      }
    }

    const accounts = [];
    if (!isEmpty(teacherJson)) {
      const teacher: any = { role: 'teacher' };
      for (const prop of AgoraUserKeys) {
        if (teacherJson.hasOwnProperty(prop)) {
          teacher[prop] = teacherJson[prop]
        }
      }
      accounts.push(teacher);
    }
    for (let student of students) {
      if (!isEmpty(student)) {
        const tempStudent: any = { role: 'student' };
        for (const prop of AgoraUserKeys) {
          if (student.hasOwnProperty(prop)) {
            tempStudent[prop] = student[prop]
          }
        }
        accounts.push(tempStudent);
      }
    }
    return {
      teacher: teacherJson,
      students: students,
      accounts,
      course,
    };
  }

  updateRoomAttrs(rawData: object) {
    const {
      teacher,
      accounts,
      course: room
    } = this.exactChannelAttrsFrom(rawData);

    console.log("origin", rawData);
    console.log("origin exact", teacher, accounts, room);
    const users = accounts.reduce((acc: Map<string, AgoraUser>, it: any) => {
      return acc.set(it.uid, {
        role: it.role,
        account: it.account,
        uid: it.uid,
        boardId: it.whiteboard_uid,
        linkId: it.link_uid,
        lockBoard: it.lock_board,
        grantBoard: it.grant_board
      });
    }, Map<string, AgoraUser>());

    const newClassState: Partial<ClassState> = {
      teacherId: get(teacher, 'uid', 0),
      linkId: room.link_uid,
      boardId: room.whiteboard_uid,
      courseState: room.class_state,
      lockBoard: room.lock_board,
      allowAnnotation: room.grant_board,
    };

    const me = this.state.me;
    let newMeValue: Partial<AgoraUser> = {};

    if (users.get(me.uid)) {
      newMeValue = users.get(me.uid) as AgoraUser;
    } else {
      newMeValue = me;
    }

    const newMe = this.compositeMe(newMeValue);
    users.set(newMe.uid, {...newMe});
    const newCourse = this.compositeCourse(newClassState);

    this.state = {
      ...this.state,
      users,
      me: {
        ...this.state.me,
        ...newMe,
      },
      course: {
        ...this.state.course,
        ...newCourse
      }
    }
    this.commit(this.state);
  }

  setAllowAnnotation(allowAnnotation: number) {
    this.state = {
      ...this.state,
      course: {
        ...this.state.course,
        allowAnnotation: allowAnnotation,
      }
    }
    this.commit(this.state);
  }

  async setApplyUid(uid: string) {
    this.state = {
      ...this.state,
      applyUid: +uid,
    }
    this.commit(this.state);
  }

  async exitAll() {
    try {
      try {
        await this.rtmClient.exit();
      } catch (err) {
        console.warn(err);
      }
    } finally {
      GlobalStorage.clear('agora_room');
      this.state = {
        ...this.defaultState
      }
      this.commit(this.state);
    }
  }
}
export const roomStore = new RoomStore();
//@ts-ignore
window.roomStore = roomStore;
