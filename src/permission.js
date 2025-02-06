import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  NProgress.start()
  document.title = getPageTitle(to.meta.title)
  const hasToken = getToken()
  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      try {
        console.log('store.getters.permission_routes:' + store.getters.permission_routes)
        console.log('store.getters.addRoutes:' + store.getters.addRoutes)
        const hasRoles = store.getters.roles && store.getters.roles.length > 0
        if (hasRoles) {
          next()
        }
        // 处理路由数据
        // 确保只在未添加路由时生成
        if (store.getters.addRoutes.length === 0) {
          const accessRoutes = await store.dispatch('permission/generateRoutes')
          router.addRoutes(accessRoutes)

          // 确保添加新路由后能正确匹配
          if (to.path === '/' && accessRoutes.length > 0) {
            next({ ...to, replace: true })
          } else {
            next()
          }
        }
        next()
      } catch (error) {
        await store.dispatch('user/resetToken')
        Message.error(error || '权限验证失败')
        next(`/login?redirect=${to.path}`)
        NProgress.done()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
