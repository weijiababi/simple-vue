import Vue from './index.js'
import Watcher from './src/Watcher.js'

const vm = new Vue({
  el: '#app',
  data() {
    return {
      name: 'hello',
      count: 1,
    }
  },
  methods: {
    test() {
      console.log('test')
    },
  },
  computed: {
    totalName() {
      return this.name + ', world'
    },
  },
})

console.log(vm)
