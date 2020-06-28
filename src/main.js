import Vue from 'vue'
import App from './App.vue'

import 'materialize-css'
import 'materialize-css/dist/css/materialize.min.css'
import 'materialize-css/dist/js/materialize.min.js'
import '../Assets/css/baseStyles.css'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
