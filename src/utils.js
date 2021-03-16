const noComma = (str = '') => str.replace(/^,|,$/g, '')

// @TODO: find a better impl.
const removeFromEnd = (str = '', parts = []) => {
  let result = str
  let recheck = true
  while (recheck) {
    recheck = false
    parts.forEach(p => {
      if (result.endsWith(p)) {
        result = result.substring(0, result.length - p.length)
        recheck = true
      }
    })
  }
  return result
}

exports.noComma = noComma
exports.removeFromEnd = removeFromEnd
