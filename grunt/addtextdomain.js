module.exports = {
  dist: {
    options: {
      textdomain   : 'admin-menu-manager',
      updateDomains: []
    },
    target : {
      files: {
        src: ['*.php', '**/*.php', '!node_modules/**', '!tests/**']
      }
    }
  }
};