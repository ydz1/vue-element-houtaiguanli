import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '../components/Login'
const Login = () => import(/* webpackChunkName: login */'../components/Login')
// import Home from '../components/home'
const Home = () => import(/* webpackChunkName: home */'../components/home')
// import Welcome from '../components/Welcome'
const Welcome = () => import(/* webpackChunkName: welcome */'../components/Welcome')
// import Users from '../components/Users/Users'
const Users = () => import(/* webpackChunkName: users */'../components/Users/Users')
// import Rights from '../components/Power/Rights'
const Rights = () => import(/* webpackChunkName: rights */'../components/Power/Rights')
// import Roles from '../components/Power/Roles'
const Roles = () => import(/* webpackChunkName: roles */'../components/Power/Roles')
// import Cate from '../components/Goods/Cate'
const Cate = () => import(/* webpackChunkName: cate */'../components/Goods/Cate')
// import Params from '../components/Goods/Params'
const Params = () => import(/* webpackChunkName: param */'../components/Goods/Params')
// import List from '../components/Goods/List'
const List = () => import(/* webpackChunkName: list */'../components/Goods/List')
// import AddGoods from '../components/Goods/AddGoods'
const AddGoods = () => import(/* webpackChunkName: addgoods */'../components/Goods/AddGoods')
// import Order from '../components/Order/Order'
const Order = () => import(/* webpackChunkName: order */'../components/Order/Order')
// import Reports from '../components/Report/Reports'
const Reports = () => import(/* webpackChunkName: reports */'../components/Report/Reports')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/Roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: AddGoods },
      { path: '/orders', component: Order },
      { path: '/reports', component: Reports }
    ]
  }
]

const router = new VueRouter({
  routes
})
router.beforeEach((to, from, next) => {
  // 如果访问登陆页面，则放行
  if (to.path === '/login') {
    return next()
  }
  // 从sessionStorage中获取保存的token
  const tokenStr = window.sessionStorage.getItem('token')
  // 若没有token，则证明未登录，强制转到登录界面
  if (!tokenStr) {
    return next('/login')
  }
  next()
})

export default router
