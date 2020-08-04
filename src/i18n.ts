import { globalStore } from './stores/global';
import {get, isEmpty} from 'lodash';
import zhCN from './i18n/zh';
import en from './i18n/en';

const BUILD_VERSION = process.env.REACT_APP_BUILD_VERSION as string;
const build_version = BUILD_VERSION ? BUILD_VERSION : '0.0.1';

export const t = (name: string, options?: any): string => {
  const lang = globalStore.state.language.match(/zh/) ? zhCN : en;
  let content = get(lang, name, null);
  if (!content) {
    console.error(`${lang}: ${name} has no match`);
    return `${lang}.${name}`;
  }

  if (!isEmpty(options)) {
    if (options.reason && content.match(/\{.+\}/)) {
      content = content.replace(/\{.+\}/, options.reason);
    }
  }
  return content;
}