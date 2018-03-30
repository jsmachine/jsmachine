import './stdlib'
import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

window.Vue = Vue

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
