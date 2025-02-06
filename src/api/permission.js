import request from '@/utils/request'
export function GetUserPermissions() {
  return request({
    url: 'api/Permission/GetUserPermissions',
    method: 'get'
  })
}
