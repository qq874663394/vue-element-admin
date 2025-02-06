import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken, setToken } from '@/utils/auth'
import { refreshToken } from '@/api/user' // 确保导入 refreshToken

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

let isRefreshing = false
// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    console.log('request.js store.getters.token:' + store.getters.token)
    if (store.getters.token) {
      // if (store.getters['user/token']) {
      // let each request carry token
      // ['Authorization'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Authorization'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log('request.js error:' + error) // for debug
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => response.data,
  async error => {
    const { config, response } = error
    if (response?.status === 401 && !config._retry) {
      if (!isRefreshing) {
        isRefreshing = true
        config._retry = true

        try {
          const { accessToken } = await refreshToken(getToken())
          setToken(accessToken)
          store.commit('user/SET_TOKEN', accessToken) // 新增此行
          return service(config)
        } catch (e) {
          MessageBox.confirm('Token 已过期，请重新登录', '确认登出', {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            store.dispatch('user/logout').then(() => {
              location.reload()
            })
          })
          return Promise.reject(e)
        } finally {
          // eslint-disable-next-line require-atomic-updates
          isRefreshing = false
        }
      }
    }
    Message.error(error.message || '请求错误')
    return Promise.reject(error)
  }
)

export default service
