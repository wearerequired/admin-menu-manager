module.exports = {
  dist: {
    options: {
      cwd            : '',
      domainPath     : '/languages',
      exclude        : [],
      include        : [],
      mainFile       : '',
      potComments    : '',
      potFilename    : 'admin-menu-manager.pot',
      potHeaders     : {
        poedit                 : true,
        'x-poedit-keywordslist': true,
        'report-msgid-bugs-to' : 'http://required.ch',
        'last-translator'      : 'required+',
        'language-team'        : 'required+'
      },
      processPot     : null,
      type           : 'wp-plugin',
      updateTimestamp: true
    }
  }
};