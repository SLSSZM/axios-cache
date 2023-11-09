import axios, { type AxiosRequestConfig, type Canceler } from 'axios';

export class AxiosCanceler {
  private pendingMap: Map<string, Canceler> = new Map<string, Canceler>();
  /**
   * 获取存放map的key值
   * @param config axios请求
   */
  private getCancelerKey(config: AxiosRequestConfig): string {
    if (config.params) {
      return [config.method, config.url, ...Object.keys(config.params)].join('&');
    } else if (config.data) {
      return [config.method, config.url, ...Object.keys(config.data)].join('&');
    }
    return [config.method, config.url].join('&');
  }
  /**
   * 增加请求
   * @param config axios请求
   */
  public addPending(config: AxiosRequestConfig): void {
    // 取消重复请求
    this.removePending(config);
    config.cancelToken = new axios.CancelToken((cancel: Canceler) => {
      const key = this.getCancelerKey(config);
      if (!this.pendingMap.has(key)) {
        this.pendingMap.set(key, cancel);
      }
    });
  }
  /**
   * 移除请求
   * @param config axios请求
   */
  public removePending(config: AxiosRequestConfig): void {
    const key = this.getCancelerKey(config);
    const cancel = this.pendingMap.get(key);
    cancel && cancel(key + '!cancel');
    this.pendingMap.delete(key);
  }
  /**
   *  移除所有请求
   */
  public removeAllPending(): void {
    this.pendingMap.forEach((cancel: Canceler) => {
      cancel && cancel('cancel');
    });
    this.pendingMap.clear();
  }
}
