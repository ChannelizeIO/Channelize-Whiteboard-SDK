const BUILD_VERSION = process.env.REACT_APP_VERSION as string;
const build_version = BUILD_VERSION ? BUILD_VERSION : '1.0.0';


const en = {
  'return': {
    'home': 'Back To Home',
  },
  'error': {
    'not_found': 'Page Not Found',
    'components': {
      'paramsEmpty': 'params：{reason} can`t be empty',
    }
  },
  'whiteboard': {
    'loading': 'Loading...',
  },
  'toast': {
    'api_login_failured': 'Join Failured, Reason: {reason}',
    'confirm': 'Confirm',
    'cancel': 'Cancel',
    'quit_room': 'Are you sure to exit the classroom?',
    'kick': 'kicked',
    'login_failure': 'login failure',
    'whiteboard_lock': 'Whiteboard follow',
    'whiteboard_unlock': 'Whiteboard nofollow',
    'canceled_screen_share': 'Canceled screen sharing',
    'screen_sharing_failed': 'Screen sharing failed, reason: {reason}',
    'recording_failed': 'Start cloud recording failed, reason: {reason}',
    'start_recording': 'Start cloud recording success',
    'stop_recording': 'Stop cloud recording success',
    'recording_too_short': 'Recording too short, at least 15 seconds',
    'rtm_login_failed': 'login failure, please check your network',
    'rtm_login_failed_reason': '{reason}',
    'replay_failed': 'Replay Failed please refresh browser',
    'teacher_exists': 'Teacher already exists, Please waiting for 30s or reopen new class',
    'student_over_limit': 'Student have reached upper limit, , Please waiting for 30s or rejoin new class',
    'teacher_and_student_over_limit': 'The number of students and teacher have reached upper limit',
    'teacher_accept_whiteboard': 'Teacher grant your whiteboard',
    'teacher_cancel_whiteboard': 'Teacher cancel your whiteboard',
    'teacher_accept_co_video': 'Teacher  accept co-video',
    'teacher_reject_co_video': 'Teacher  rejected co-video',
    'teacher_cancel_co_video': 'Teacher  canceled co-video',
    'student_cancel_co_video': 'Student canceled co-video',
    'teacher_already_acpt_whiteboard': 'Teacher already grant whiteboard',
    'add_page': 'New canvas added!',
    'remove_page': 'Current canvas removed!',
    'toggle_page': 'Canvas changed!',
    'upload_file': 'File has been uploaded successfully!',
    'one_allowed_annotation': 'Only one student allowed to annotate at a time',
    'student_not_joined': 'Student not joined yet',
    'interact_not_allowed': 'You are not allowed to interact until Teacher joins the class',
    'student_joined': 'student joined',
    'student_leave': 'student leaved',
    'user_joined': 'user joined',
    'user_leave': 'user leave',
    'raised_hand': 'You have raised hand',
  },

  'notice': {
    'student_interactive_apply': `"{reason}" wants to interact with you`
  },
  'chat': {
    'placeholder': 'Input Message',
    'banned': 'Banned',
    'send': 'send'
  },
  'device': {
    'camera': 'Camera',
    'microphone': 'Microphone',
    'speaker': 'Speaker',
    'finish': 'Finish',
  },
  'nav': {
    'delay': 'Delay: ',
    'network': 'Network: ',
    'cpu': 'CPU: ',
    'class_end': 'Class end',
    'class_start': 'Class start',
    'class_ended': 'Class Ended',
    'class_started': 'Class Started'
  },
  'home': {
    'entry-home': 'Join Classroom',
    'teacher': 'Teacher',
    'student': 'Student',
    'cover_class': 'cover-en',
    'room_name': 'Room Name',
    'nickname': 'Your Name',
    'room_type': 'Room Type',
    'room_join': 'Join',
    'short_title': {
      'title': 'Channelize Whiteboard',
      'subtitle': 'Powered by Channelize.io & Agora.io',
    },
    'name_too_long': 'name too long, should <= 20 characters',
    '1v1': 'One to One Classroom',
    'mini_class': 'Small Classroom',
    'large_class': 'Lecture Hall',
    'missing_room_name': 'missing room name',
    'missing_your_name': 'missing your name',
    'missing_password': 'missing password',
    'missing_role': 'missing role',
    'account': 'nickname',
    'password': 'password',
  },
  'room': {
    'chat_room': 'Chat Room',
    'student_list': 'Student List',
    'uploading': 'Uploading...',
    'converting': 'Converting...',
    'upload_success': 'upload success',
    'upload_failure': 'upload failure, check the network',
    'convert_success': 'convert success',
    'convert_failure': 'convert failure, check the network',
  },
  'replay': {
    'loading': 'loading...',
  },
  'build_version': `build version: ${build_version}`,
}

export default en;