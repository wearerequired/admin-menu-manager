module.exports = {
  options: {
    livereload: true
  },

  config: {
    files: 'grunt/watch.js'
  },

  jsminify: {
    files: 'js/src/**/*.*',
    tasks: ['concat', 'uglify']
  }
}
