import { constantRoutes } from '@/router'// 注意：确保在项目中正确引入 Layout 组件
import { GetUserPermissions } from '@/api/permission'
import Layout from '@/layout'

// function loadComponent(component) {

// const componentPath = `../${component}` // 方式1
// const componentPath = `src/${component}` // 方式2
// const componentPath = `/src/${component}` // 方式3
// const componentPath = `@/${component}` // 方式4

// const componentPath = `../${component}.vue` // 方式5
// const componentPath = `src/${component}.vue` // 方式6
// const componentPath = `/src/${component}.vue` // 方式7
// const componentPath = `@/${component}` // 方式8

// return resolve => require.ensure([], () => resolve(require(componentPath)))
// return () => import(`@/views/${component}.vue`)
//   var aa = require(`@/views/${component}.vue`).default
//   var bb = (resolve) => require([`@/views/${component}.vue`], resolve)
//   return aa
// }

/**
 * 处理接口返回的动态路由数据
 * 将接口数据中的 component 字段解析为对应组件，同时递归处理子路由
 * @param {Array} routes 接口返回的路由数据数组
 * @returns {Array} 处理后的路由数组
 */
export function processDynamicRoutes(routes) {
  console.log('routes', routes)
  const res = []
  routes.forEach(route => {
    try {
      const {
        path,
        component,
        children,
        redirect,
        name,
        meta,
        alwaysShow,
        hidden
      } = route

      if (!component) return null

      let _temp_component // Use let so it can be reassigned
      // 判断是否为 Layout 组件
      if (component === 'layout/Layout' || component === 'Layout') {
        _temp_component = Layout
      } else {
        _temp_component = require(`@/views/${component}.vue`).default
      }
      // 构造新的路由对象
      const processedRoute = {
        path: path,
        // 解析组件：若 component 不存在则为 null
        component: _temp_component,
        // 处理重定向，如果 redirect 为 null 则可不设置或设置为 undefined
        redirect: redirect || undefined,
        name: name,
        meta: meta || {},
        alwaysShow: alwaysShow,
        // 对隐藏属性统一存放到 meta.hidden 中（可根据项目需求调整）
        hidden: hidden
      }

      console.log('processedRoute', processedRoute)
      // 如果存在子路由，并且 children 为数组，则递归处理
      if (children && Array.isArray(children) && children.length > 0) {
        processedRoute.children = processDynamicRoutes(children)
      }
      res.push(processedRoute)
    } catch (error) {
      console.log(error)
    }
  })
  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = { // 使用 async/await 重写 generateRoutes 方法
  async generateRoutes({ commit, state }) {
    // 如果已经生成过路由，直接返回
    if (state.addRoutes.length > 0) {
      return state.addRoutes
    }
    // 调用接口获取用户权限对应的路由数据
    const apiRoutes = await GetUserPermissions()

    // 假设 apiRoutes 为接口返回的数据，
    // 调用处理函数将接口数据转换为前端路由格式
    const processedRoutes = processDynamicRoutes(apiRoutes)
    // 保存处理后的路由数据
    commit('SET_ROUTES', processedRoutes)
    return processedRoutes
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
