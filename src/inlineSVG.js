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

exports.inlineSVG = inlineSVG
