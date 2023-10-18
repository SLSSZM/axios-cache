import type { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

/**
 * @interface 创建实例参数
 */
export interface AxiosCreateOption extends AxiosRequestConfig {
  interceptors?: Interceptors;
  /**
   * @description 是否开启重复请求
   */
  ignoreRepeatRequests?: boolean;
}

/**
 * @interface 拦截器
 */
export interface Interceptors {
  /**
   * @description 请求拦截
   */
  onRequest?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;

  /**
   * @description 响应拦截
   */
  onResponse?: (res: AxiosResponse<ResponseResult>) => AxiosResponse<ResponseResult>;

  /**
   * @description: 请求拦截错误处理
   */
  onRequestError?: (error: AxiosError) => void;

  /**
   * @description: 响应拦截错误处理
   */
  onResponseError?: (error: AxiosError) => void;

  /**
   * @description 请求失败处理
   */
  onErrorCatch?: (err: AxiosError<ResponseResult>) => AxiosError | ResponseResult | undefined;
}

/**
 * @interface 请求数据参数
 */
export interface RequestOptions extends AxiosRequestConfig {
  /**
   * @description 是否开启缓存
   */
  cache?: boolean;
  /**
   * @description 是否开启重复请求
   */
  ignoreRepeatRequests?: boolean;
}

/**
 * @interface 响应数据格式
 */
export interface ResponseResult<T = any> {
  code: number;
  method: string;
  time: string;
  path: string;
  data: T;
  token?: string;
  message?: string;
}
