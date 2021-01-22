import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import './assets/css/index.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
import '../public/mock/mockServer.js'
// 引入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css'
// 导入nprogress的js和css
import Nprogress from 'nprogress'
import 'nprogress/nprogress.css' // for bubble theme
Vue.use(VueQuillEditor)

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use((config) => {
  Nprogress.start()
  console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
axios.interceptors.response.use(config => {
  Nprogress.done()
  return config
})

Vue.config.productionTip = false
Vue.prototype.$http = axios
Vue.component('tree-table', TreeTable)
// 时间戳的过滤器
Vue.filter('dateFormat', function (value) {
  const dt = new Date(value)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
