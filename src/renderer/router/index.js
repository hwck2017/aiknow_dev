import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import Home from '../components/Home.vue'
import Problems from '../components/Problems.vue'
import problemDetail from '../components/problem/problemDetail.vue'
import Submission from '../components/submission/Submission.vue'
import submissionDetail from '../components/submission/submissionDetail.vue'

import DashBoard from '../components/DashBoard.vue'
import Contest from '../components/Contest.vue'
import contestDetail from '../components/contest/contestDetail.vue'
import contestProblems from '../components/contest/contestProblems.vue'
import user from '../components/user/user.vue'
import edit from '../components/user/edit.vue'
import Editor from '../components/Editor.vue'
import security from '../components/user/security.vue'

import problem from '../components/user/problem.vue'
import userContest from '../components/user/contest.vue'
import group from '../components/user/group.vue'
import profile from '../components/user/profile.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/home',
      component: Home,
      redirect: '/editor',
      children: [
        {
          path: '/login',
          component: Login
        },
        {
          path: '/register',
          component: Register
        },
        {
          path: '/dashboard',
          component: DashBoard
        },
        {
          path: '/contest',
          component: Contest
        },
        {
          path: "/contest/:cid/problems",
          component: contestProblems
        },
        {
          path: "/contest/:cid",
          component: contestDetail
        },
        {
          path: '/problems',
          component: Problems
        },
        {
          path: '/problem/:pid',
          component: problemDetail
        },
        {
          path: '/submission/:id',
          component: submissionDetail
        },
        {
          path: '/submission',
          component: Submission
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
            component: userContest
          },
          {
            path: '/user/group',
            component: group
          }
          ]
        },
        {
          path: '/profile/:uid',
          component: profile
        },
        {
          path: '/editor',
          component: Editor
        }]
    },
    {
      path: '*',
      redirect: '/editor'
    }
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  //     next()  放行    next('/login')  强制跳转
  if (to.path === '/login' || to.path === '/register' || to.path === '/editor') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) {
    return next({ path: `/login?redirect=${to.path}` })
  }
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


