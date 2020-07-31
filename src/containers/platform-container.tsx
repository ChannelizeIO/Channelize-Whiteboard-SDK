import React, { useEffect } from 'react';
import Icon from '../components/icon';
import _, {isFunction} from 'lodash';
import { useLocation } from 'react-router';

export interface IPlatformContext {
  platform: string
}

export interface IWindow {
  ownerName: string
  name: string
  windowId: any
  image: string
}

const PlatformContext: React.Context<IPlatformContext> = React.createContext({} as IPlatformContext);

export const usePlatform = () => React.useContext(PlatformContext);

export const PlatformContainer: React.FC<React.ComponentProps<any>> = ({ children }: React.ComponentProps<any>) => {

  const platform = _.get(process.env, 'REACT_APP_RUNTIME_PLATFORM', 'web')


  const location = useLocation();

  // @ts-ignore
  const ipc = window.ipc;

  useEffect(() => {
    if (!ipc) return;
    if (location.pathname.match(/classroom|replay/)) {
      ipc.send('resize-window', {width: 990, height: 706});
    } else {
      ipc.send('resize-window', {width: 700, height: 500});
    }
  }, [location, ipc]);


  const value = {
    platform,
  }

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  )
}
