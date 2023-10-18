import http from '../index';

export function getDictApi() {
  // 开启缓存
  return http.get('dict', { cache: true });
}
