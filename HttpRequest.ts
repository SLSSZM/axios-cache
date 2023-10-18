import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { AxiosCanceler } from './AxiosCanceler';
import type { AxiosCreateOption, RequestOptions, ResponseResult } from './http.interface';
import { CacheManager } from './CacheManger';

/**
 * @description 封装axios 调用getInstance获取实例
 */
export class HttpRequest {
  private axiosInstance: AxiosInstance;
  private createOptions: AxiosCreateOption;
  private axiosCanceler: AxiosCanceler = new AxiosCanceler();
  private cacheManager: CacheManager = new CacheManager();

  constructor(createOptions: AxiosCreateOption) {
    this.axiosInstance = axios.create(createOptions);
    this.createOptions = createOptions;
    this.setInterceports();
  }

  /**
   * @description 设置拦截器和取消请求
   */
  private setInterceports(): void {
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig & RequestOptions) => {
        // 判断是否开启重复请求
        let ignoreRepeatRequests = this.createOptions.ignoreRepeatRequests;
        ignoreRepeatRequests =
          config.ignoreRepeatRequests !== undefined
            ? config.ignoreRepeatRequests
            : ignoreRepeatRequests;
        ignoreRepeatRequests && this.axiosCanceler.addPending(config);

        if (this.createOptions.interceptors?.onRequest) {
          config = this.createOptions.interceptors.onRequest(config);
        }
        return config;
      },
      this.createOptions.interceptors?.onRequestError
    );

    this.axiosInstance.interceptors.response.use((res: AxiosResponse<ResponseResult>) => {
      this.axiosCanceler.removePending(res.config);
      if (this.createOptions.interceptors?.onResponse) {
        res = this.createOptions.interceptors.onResponse(res);
      }
      return res;
    }, this.createOptions.interceptors?.onResponseError);
  }

  /**
   * @description 移除所有请求
   */
  public allRequestCanceler(): void {
    this.axiosCanceler.removeAllPending();
  }

  /**
   * @param config axios请求数据
   */
  public request<T = any>(config: RequestOptions): Promise<ResponseResult<T>> {
    return new Promise(async (resolve, reject) => {
      // 判断是否开启缓存
      if (config.cache) {
        const cacheData = this.cacheManager.get<T>(config);
        // 不等于undefined意味着已经有正在pending状态了
        if (cacheData !== undefined) {
          try {
            return resolve(await cacheData);
          } catch (err) {
            return reject(err);
          }
        }
      }
      this.axiosInstance
        .request(config)
        .then((res: AxiosResponse<ResponseResult>) => {
          config.cache && this.cacheManager.set(config, res.data, 'success');
          resolve(res.data as ResponseResult<T>);
        })
        .catch((err: AxiosError<ResponseResult>) => {
          if (this.createOptions.interceptors?.onErrorCatch) {
            const newErr = this.createOptions.interceptors?.onErrorCatch(err);
            config.cache && this.cacheManager.set(config, newErr, 'error');
            return reject(newErr);
          }
          config.cache && this.cacheManager.set(config, err, 'error');
          reject(err);
        });
    });
  }
  public get<T = any>(
    url: string,
    config?: RequestOptions
  ): Promise<ResponseResult<T> | AxiosResponse<ResponseResult<T>>> {
    return this.request<T>({ ...config, url, method: 'get' });
  }
  public post<T = any>(
    url: string,
    data?: any,
    config?: RequestOptions
  ): Promise<ResponseResult<T> | AxiosResponse<ResponseResult<T>>> {
    return this.request<T>({ ...config, url, data, method: 'post' });
  }
  public put<T = any>(
    url: string,
    data?: any,
    config?: RequestOptions
  ): Promise<ResponseResult<T> | AxiosResponse<ResponseResult<T>>> {
    return this.request<T>({ ...config, url, data, method: 'put' });
  }
  public delete<T = any>(
    url: string,
    config?: RequestOptions
  ): Promise<ResponseResult<T> | AxiosResponse<ResponseResult<T>>> {
    return this.request<T>({ ...config, url, method: 'delete' });
  }
  public upload<T = any>(
    url: string,
    data?: any,
    config?: RequestOptions
  ): Promise<ResponseResult<T> | AxiosResponse<ResponseResult<T>>> {
    return this.request<T>({
      ...config,
      url,
      data,
      method: 'post',
      headers: { 'Content-Type': 'multipart/form-data', ...config?.headers },
    });
  }
}
