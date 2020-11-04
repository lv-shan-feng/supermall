import axios from 'axios'

// 方法4
export function request(config) {
  // 1.创建axios的实例
  const instance = axios.create({
    baseURL: 'http://152.136.185.210:8000/api/w6',
    timeout: 5000
  })

  // 2.axios的拦截器
  // 2.1请求拦截的作用
  instance.interceptors.request.use(config => {
    return config; //拦截后需要将拦截的数据返回
  }, err => {
    console.log(err);
  });

  // 2.2响应拦截
  instance.interceptors.response.use(res => {
    return res.data; //拦截后需要将拦截的数据返回
  }, err => {
    console.log(err);
  })

  // 3.发送真正的网络请求
  return instance(config)
}


