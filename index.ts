import { HttpRequest } from './HttpRequest';
const http = new HttpRequest({
  baseURL: 'http://localhost:3000/api',
  timeout: 12000,
  ignoreRepeatRequests: true,
});
export default http;
