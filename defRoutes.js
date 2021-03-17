const express = require('express')
const { handlebars } = require('hbs')
const { inlineSVG } = require('./src/inlineSVG')
handlebars.registerHelper('inlineSVG', inlineSVG)

handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this)
})

const { getDef, getCnrtlURL } = require('./src/cnrtl-util')

const router = express.Router()

router.get('/:word', function (req, res, next) {
  const word = req.params.word
  getDef(word)
    .then(defs => {
      res.render('def', {
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
    res.redirect(`/def/${word.trim()}`)
  } else {
    res.render('def', {
      cookies: req.cookies,
    })
  }
})

module.exports = router
