/// <reference types="react-scripts" />

declare module 'agora-rtc-sdk' {
  const AgoraRTC: any;
  export default AgoraRTC;
}

declare module 'agora-rtm-sdk' {
  const AgoraRTM: any;
  export default AgoraRTM;
}

declare module 'js-md5' {
  const MD5: any;
  export default MD5;
}

declare interface Device {
  deviceId: string
  label: string
  kind: string
}

declare module '*.scss';