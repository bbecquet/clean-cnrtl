const fs = require('fs')
const path = require('path')

const inlineSVG = rootPath => iconName => {
  try {
    return fs.readFileSync(path.join(rootPath, iconName), 'utf8')
  } catch (err) {
    console.error(err)
    return ''
  }
}

exports.inlineSVG = inlineSVG
