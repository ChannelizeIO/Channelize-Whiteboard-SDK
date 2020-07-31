const BUILD_VERSION = process.env.REACT_APP_BUILD_VERSION as string;
const build_version = BUILD_VERSION ? BUILD_VERSION : '0.0.1';

const zhCN: any = {
  'return': {
    'home': '返回主页',
  },
  'error': {
    'not_found': '页面找不到',
    'components': {
      'paramsEmpty': '参数：{reason}不能为空',
    }
  },
  'whiteboard': {
    'loading': '加载中...',
  },
  'toast': {
    'api_login_failured': '房间加入失败, 原因: {reason}',
    'confirm': '确定',
    'cancel': '取消',
    'quit_room': '确定退出课程吗？',
    'kick': '其他端登录，被踢出房间',
    'login_failure': '登录房间失败',
    'whiteboard_lock': '设置白板跟随',
    'whiteboard_unlock': '取消白板跟随',
    'canceled_screen_share': '已取消屏幕共享',
    'screen_sharing_failed': '屏幕分享失败, 原因：{reason}',
    'recording_failed': '开启云录制失败, 原因：{reason}',
    'start_recording': '开始云录制',
    'stop_recording': '结束云录制',
    'recording_too_short': '录制太短，至少15秒',
    'rtm_login_failed': '房间登录失败, 请检查网络设置',
    'rtm_login_failed_reason': '房间登录失败, 原因： {reason}',
    'replay_failed': '回放失败，请刷新页面重试',
    'teacher_exists': '该房间老师已存在，请等待30秒或重新创建教室',
    'student_over_limit': '超出学生最大人数，请等待30秒或重新创建教室',
    'teacher_and_student_over_limit': '超出学生和老师的最大人数',
    'teacher_accept_whiteboard': '老师已授权了你白板的权限',
    'teacher_cancel_whiteboard': '老师已收回了你白板的权限',
    'teacher_accept_co_video': '老师已允许连麦',
    'teacher_reject_co_video': '老师已拒绝连麦',
    'teacher_cancel_co_video': '老师已取消连麦',
    'student_cancel_co_video': '学生已取消连麦',
    'add_page': '添加了新画布！',
    'remove_page': '当前的画布已删除！',
    'toggle_page': '画布变了！',
    'upload_file': '新文件已添加！'
  },
  'notice': {
    'student_interactive_apply': `"{reason}"想和你连麦`
  },
  'chat': {
    'placeholder': '说点什么',
    'banned': '禁言中',
    'send': '发送'
  },
  'device': {
    'camera': '摄像头',
    'microphone': '麦克风',
    'speaker': '扬声器',
    'finish': '完成',
  },
  'nav': {
    'delay': '延迟: ',
    'network': '网络: ',
    'cpu': 'CPU: ',
    'class_end': '课程结束',
    'class_start': '课程开始',
    'class_ended': '上课开始',
    'class_started': '类结束'
  },
  'home': {
    'entry-home': '进入教室',
    'teacher': '老师',
    'student': '学生',
    'cover_class': 'cover-cn',
    'room_name': '房间名',
    'nickname': '昵称',
    'room_type': '房间类型',
    'room_join': '加入房间',
    'short_title': {
      'title': '引导白板',
      'subtitle': '由声网提供',
    },
    'name_too_long': '名字过长，不得超过20个字符',
    '1v1': '一对一',
    'mini_class': '小班课',
    'large_class': '大班课',
    'missing_room_name': '缺少房间名',
    'missing_your_name': '缺少昵称',
    'missing_password': '缺少房间密码',
    'missing_role': '缺少角色',
    'account': '姓名',
    'password': '密码',
  },
  'room': {
    'chat_room': '消息列表',
    'student_list': '学生列表',
    'uploading': '上传中...',
    'converting': '转换中...',
    'upload_success': '上传成功',
    'upload_failure': '上传失败，请检查网络',
    'convert_success': '转换成功',
    'convert_failure': '转换失败，请检查网络',
  },
  'replay': {
    'loading': '加载中...',
  },
  'build_version': `构建版本: ${build_version}`,
}

export default zhCN;