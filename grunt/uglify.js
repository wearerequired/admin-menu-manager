module.exports = {
  options: {
    banner   : '/*! <%= package.name %> - v<%= package.version %> - ' +
    '<%= grunt.template.today("yyyy-mm-dd") %> */\n',
    mangle   : {
      except: ['jQuery']
    },
    sourceMap: true,
    compress : {
      global_defs : {
        "DEBUG": false
      },
      dead_code   : true,
      drop_console: true
    },
    beautify : false
  },

  dist: {
    files: {
      'js/build/admin-menu-manager.min.js': ['js/src/admin-menu-manager.js']
    }
  }
}
