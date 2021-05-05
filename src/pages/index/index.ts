import * as computed from 'miniprogram-computed'

Component({
  data: {
    a: 1,
    b: 2,
    sum: 2,
  },
  behaviors: [computed.behavior],
  watch: {
    'a, b': function (a, b) {
      this.setData({
        sum: a + b,
      })
    },
  },
  computed: {
    sumc: function (data) {
      return data.a + data.b
    },
  },
})
