import http from '../index';

export function captchaAuthApi() {
  // 开启缓存
  return http.get('dict', { cache: true });
}
