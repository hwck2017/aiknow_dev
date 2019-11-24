import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Login from '../components/Login.vue'
// import Register from '../components/Register.vue'
import Home from '../components/Home.vue'
import Problems from '../components/Problems.vue'
import Content from '../components/Content.vue'

import DashBoard from '../components/DashBoard.vue'
import user from '../components/user/user.vue'
import edit from '../components/user/edit.vue'
import security from '../components/user/security.vue'

import problem from '../components/user/problem.vue'
import contest from '../components/user/contest.vue'
import group from '../components/user/group.vue'
import profile from '../components/user/profile.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/login',
      component: Login
    },
    // {
    //   path: '/register',
    //   component: Register
    // },
    {
      path: '/home',
      component: Home,
      children: [{
        path: '/dashboard',
        component: DashBoard
      },
      {
        path: '/problems',
        component: Problems
      },
      {
        path: '/problem/:problemID',
        component: Content,
        name: 'problem'
      },
      {
        path: '/user',
        component: user,
        redirect: '/user/edit',
        children: [{
          path: '/user/edit',
          component: edit
        },
        {
          path: '/user/security',
          component: security
        },
        {
          path: '/user/problem',
          component: problem
        },
        {
          path: '/user/contest',
          component: contest
        },
        {
          path: '/user/group',
          component: group
        },
        {
          path: '/profile/:userID',
          component: profile,
          name: "profile"
        }
        ]
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

/**
 * 重写路由的push方法
 */
const routerPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error => error)
}

export default router


