import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import './style.css'

// 全局注册 Element UI，并设置默认尺寸为 small
Vue.use(ElementUI, { size: 'small' })

Vue.config.productionTip = false

new Vue({
  render: (h) => h(App)
}).$mount('#app')
