const { handlebars } = require('hbs')
const fs = require('fs')

const inlineSVG = iconName => {
  let path = iconName
  try {
    return fs.readFileSync(path, 'utf8')
  } catch (err) {
    console.error(err)
    return ''
  }
}

function registerInlineSVG(handlebars) {
  handlebars.registerHelper('inlineSVG', inlineSVG)
}

exports.registerInlineSVG = registerInlineSVG
