import request from '@/utils/request'
export function login(data) {
  return request({
    url: 'api/Auth/Login',
    method: 'post',
    data
  })
}

export function refreshToken(token) {
  return request({
    url: 'api/Auth/RefreshToken',
    method: 'post',
    data: { 'token': token }
  })
}
// 原生接口
// export function login(data) {
//   return request({
//     url: '/vue-element-admin/user/login',
//     method: 'post',
//     data
//   })
// }

// export function getInfo(token) {
//   return request({
//     url: '/vue-element-admin/user/info',
//     method: 'get',
//     params: { token }
//   })
// }

export function logout() {
  return request({
    url: '/vue-element-admin/user/logout',
    method: 'post'
  })
}
