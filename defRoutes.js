const { inlineSVG } = require('./src/inlineSVG')
const { getDef, getCnrtlURL } = require('./src/cnrtl-util')

function getDefRoutes(router, handlebars, rootUrl) {
  handlebars.registerHelper('inlineSVG', inlineSVG)

  handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this)
  })

  router.get('/:word', function (req, res, next) {
    const word = req.params.word
    getDef(word)
      .then(defs => {
        res.render('def', {
          rootUrl,
          layout: 'tlfi',
          defs,
          word,
          cnrtlLink: getCnrtlURL(word),
          cookies: req.cookies,
        })
      })
      .catch(error => {
        console.error(error)
        next()
      })
  })

  router.get('/', function (req, res, next) {
    const word = req.query['word']
    if (word) {
      res.redirect(`${rootUrl}${word.trim()}`)
    } else {
      res.render('def', {
        rootUrl,
        layout: 'tlfi',
        cookies: req.cookies,
      })
    }
  })

  return router
}

module.exports = getDefRoutes
