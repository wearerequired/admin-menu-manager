module.exports = {
  options: {
    banner   : '/*! <%= package.version %> */\n',
    separator: ';'
  },
  maps   : {
    src : ['js/src/admin-menu-manager.js'],
    dest: 'js/build/admin-menu-manager.js'
  }
};