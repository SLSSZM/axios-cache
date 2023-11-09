import type { AxiosRequestConfig } from 'axios';
import type { ResponseResult } from './http.interface';

export type CacheStatus = 'pending' | 'complete';
export type CacheCallBackType = 'success' | 'error';

export interface Cache {
  status: CacheStatus;
  res?: ResponseResult; // 这里是自己定义的后端返回格式，可以自己修改或者any
  callback: {
    resolve: (data: any) => void;
    reject: (error: any) => void;
  }[];
}

export class CacheManager {
  private cacheMap: Map<string, Cache> = new Map();

  /**
   * 根据请求生成key
   * @param config axios请求
   */
  public getCacheKey(config: AxiosRequestConfig): string {
    if (config.params) {
      return [config.method, config.url, ...Object.keys(config.params)].join('&');
    } else if (config.data) {
      return [config.method, config.url, ...Object.keys(config.data)].join('&');
    }
    return [config.method, config.url].join('&');
  }

  /**
   * 获取缓存
   * @param config axios请求
   */
  public get<T = any>(config: AxiosRequestConfig): Promise<ResponseResult<T>> | undefined {
    const key = this.getCacheKey(config);
    const cache = this.cacheMap.get(key);
    if (cache) {
      if (cache.status === 'complete') {
        return Promise.resolve(cache.res as ResponseResult<T>);
      }
      if (cache.status === 'pending') {
        return new Promise((resolve, reject) => {
          cache.callback.push({
            resolve,
            reject,
          });
        });
      }
    }
    this.cacheMap.set(key, {
      status: 'pending',
      callback: [],
    });
  }

  /**
   * 设置缓存
   * @param config axios请求
   * @param res 接口数据
   * @param cacheCallBackType Promise回调类型
   */
  public set(config: AxiosRequestConfig, res: any, cacheCallBackType: CacheCallBackType) {
    const key = this.getCacheKey(config);
    const cache = this.cacheMap.get(key);
    if (cache) {
      if (cacheCallBackType === 'success') {
        cache.res = res;
        cache.status = 'complete';
        for (let i = 0; i < cache.callback.length; i++) {
          cache.callback[i].resolve(res);
          cache.callback.splice(i, 1);
          i--;
        }
      } else if (cacheCallBackType === 'error') {
        for (let i = 0; i < cache.callback.length; i++) {
          cache.callback[i].reject(res);
          cache.callback.splice(i, 1);
          i--;
        }
        this.cacheMap.delete(key);
      }
    }
  }
}
