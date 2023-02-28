import Vue from './vue'

const vm = new Vue({
  el: '#app',
  data() {
    return {
      name: 'name',
      count: 1,
      selected: 'b',
    }
  },
  methods: {
    show() {
      console.log(`show ${this.name}!!! `)
    },
    test(arg) {
      this.$nextTick(() => {
        console.log(document.querySelector('input').value)
      })
      this.name += 'name'
      this.count++
      this.$nextTick(() => {
        console.log(document.querySelector('input').value)
      })
    },
  },
  computed: {
    fullName() {
      return 'hello ' + this.name
    },
    fullName2() {
      return 'hello ' + this.name + '!'
    },
    fullName3() {
      return 'hello ' + this.name + '!!'
    },
  },
})

console.log(vm)
