import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Problems from '../components/Problems.vue'
import Content from '../components/Content.vue'
import userHome from '../components/userHome.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      component: Home,
      children: [{
        path: '/problems',
        component: Problems
      },
      {
        path: '/problem/:problemID',
        component: Content
      },
      {
        path: '/user-home',
        component: userHome
      }]
    },
    {
      path: '*',
      redirect: '/login'
    }
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  //     next()  放行    next('/login')  强制跳转
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router