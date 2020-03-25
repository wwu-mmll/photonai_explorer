import Vue from 'vue'
import App from './App.vue'

import 'materialize-css'
import 'materialize-css/dist/css/materialize.min.css'
import 'materialize-css/dist/js/materialize.min.js'
import '../Assets/photonStyle.css'

Vue.config.productionTip = false

Vue.filter('jsonInfo', (file) => {
  let jsonfile = {'name': 'This is not the name you are looking for'}
  let str = 'default'
  file.text().then((text) => {
    window.console.log('Ayy')
    jsonfile = JSON.parse(text)
    str = `${file.name} - Project: ${jsonfile["name"]}`
  })
  window.console.log('Lmao')
  return str
})

new Vue({
  render: h => h(App),
}).$mount('#app')
