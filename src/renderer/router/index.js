import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Problems from '../components/Problems.vue'
import Content from '../components/Content.vue'
import userHome from '../components/userHome.vue'


export default new Router({
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
