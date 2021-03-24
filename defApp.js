const fs = require('fs')
const path = require('path')
const express = require('express')
const { inlineSVG } = require('./src/inlineSVG')
const { getDef, getCnrtlURL } = require('./src/cnrtl-util')
const handlebars = require('handlebars')
const { render } = require('sass')

function getDefRoutes(rootUrl = '/', rootPath = '.') {
  handlebars.registerPartial(
    'tlfi_layout',
    fs.readFileSync(path.join(rootPath, 'templates/tlfi.hbs'), 'utf8')
  )

  handlebars.registerHelper('inlineSVG', inlineSVG(rootPath))

  handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this)
  })

  const renderDef = handlebars.compile(
    fs.readFileSync(path.join(rootPath, 'templates/def.hbs'), 'utf8')
  )

  const router = express.Router()

  router.use(express.static(__dirname))

  router.get('/:word', function (req, res, next) {
    const word = req.params.word
    getDef(word)
      .then(defs => {
        res.send(
          renderDef({
            rootUrl,
            defs,
            word,
            cnrtlLink: getCnrtlURL(word),
            cookies: req.cookies,
          })
        )
      })
      .catch(error => {
        if (error === 'NO_DEF') {
          res.send(
            renderDef({
              rootUrl,
              defs: [],
              word,
              cookies: req.cookies,
            })
          )
        } else {
          console.error(error)
          next()
        }
      })
  })

  router.get('/', function (req, res, next) {
    const word = req.query['word']
    if (word) {
      res.redirect(`${rootUrl}${word.trim()}`)
    } else {
      res.send(
        renderDef({
          rootUrl,
          cookies: req.cookies,
        })
      )
    }
  })

  return router
}

module.exports = getDefRoutes
