import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'element-ui/lib/theme-chalk/display.css'
import 'element-ui/lib/theme-chalk/base.css'
import CollapseTransition from 'element-ui/lib/transitions/collapse-transition'
import 'highlight.js/styles/github.css'

import App from './App.vue'
import './style.css'
import './element-docs/styles/element-doc.scss'
import DemoBlock from './element-docs/components/DemoBlock.vue'
import icon from './element-docs/icon.json'

Vue.use(ElementUI)
Vue.component(CollapseTransition.name, CollapseTransition)
Vue.component('demo-block', DemoBlock)
Vue.prototype.$icon = icon

Vue.config.productionTip = false

new Vue({
  render: (h) => h(App)
}).$mount('#app')
