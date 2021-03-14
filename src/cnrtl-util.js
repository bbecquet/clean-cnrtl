const request = require('request-promise')
const cheerio = require('cheerio')

const { noComma } = require('./utils')

function getDef(word) {
  return fetchDefinitions(word).then(defs =>
    defs.map(({ def, homograph }) => ({
      homograph: transformHomograph(homograph),
      def: transformDef(def),
    }))
  )
}

/**
 * Fetches all definitions of a word, even when different ones are supposed to be fetched asynchronously
 * @param {string} word the word to look for
 */
function fetchDefinitions(word) {
  return (
    request(getCnrtlURL(word))
      .then(html => {
        const $ = cheerio.load(html)
        // the number of tabs on the first result page gives the index of requests to be made
        return $('#vtoolbar li a')
          .map(index => `${getCnrtlURL(word)}//${index}`)
          .get()
      })
      .then(urls => Promise.all(urls.map(request)))
      // a full HTML page is returned each time
      .then(htmls => htmls.map(extractDefinitionPart))
  )
}

function getCnrtlURL(word) {
  return `https://www.cnrtl.fr/definition/${word}`
}

function extractDefinitionPart(html) {
  const $ = cheerio.load(html)
  return {
    homograph: $('#vitemselected a').html(),
    def: $('#lexicontent').html(),
  }
}

function transformHomograph(html) {
  const $ = cheerio.load(html)
  const wordForm = $('span').first().html()
  const wordClass = $('span').last()[0].nextSibling.nodeValue
  return { wordForm, wordClass: noComma(wordClass).trim() }
}

function transformDef(html) {
  // @TODO: chain à la lodash/ramda
  let transformed = html
  transformed = transformStruct(transformed)
  transformed = transformNumbering(transformed)
  transformed = transformTypography(transformed)
  return transformed
}

function transformTypography(html) {
  const NBSP = '&nbsp;' // use normal instead of narrow NBSP for now, until we increase the parsing robustness…
  return html
    .replace(/\.{3}/g, '…') // replace three dots by the real ellipsis character
    .replace(/(\S)([;:])/g, `$1${NBSP}$2`) // space before :;
    .replace(/\.([\w])/g, '. $1') // space after dot
    .replace(/« /g, `«${NBSP}`) // nbsp before/after quotes
    .replace(/ »/g, `${NBSP}»`)
    .replace(/,,(.*)``/g, `«${NBSP}$1${NBSP}»`)
}

function transformNumbering(html) {
  return html.replace(/♦/g, '⬩') // replace diamond characters that are rendered as red in Mobile Chrome
}

function transformStruct(html) {
  const $ = cheerio.load(html)
  transformHeadings($)
  transformExamples($)
  return $.html()
}

function transformHeadings($) {
  $('.tlf_cvedette').replaceWith((_, node) => {
    const $node = $(node)
    return `<h2 class="defWord">${$node.html()}</h2>`
  })
}

function transformExamples($) {
  $('.tlf_cexemple').replaceWith((_, node) => {
    const $node = $(node)
    const rawHTML = $node.html()
    // @TODO: increase robustness of all extraction rules
    const citation = rawHTML
      .split(/\((?!\.)/)[0] // most citations end with the '(' opening the source part
      .split('<span')[0] // except some that don't put the source in '()'…
      .replace(/ <\/i>$/, '</i>')
      .trim()
    const author = $node.children('.tlf_cauteur').first().text()
    const title = $node.children('.tlf_ctitre').first().text()
    const publi = $node.children('.tlf_cpublication').first().text()
    const date = $node.children('.tlf_cdate').first().text()
    let page = $node.children('span').last()[0].nextSibling.nodeValue
    page = page || ''
    page = page.slice(0, page.lastIndexOf(')'))

    const sourceFields = [
      noComma(author),
      title && `<cite>${noComma(title)}</cite>`,
      noComma(publi),
      noComma(date),
      noComma(page),
    ]
      .filter(s => s)
      .join(', ')

    return `<figure class="example">
      <blockquote>${citation}</blockquote>
      <figcaption>${sourceFields}.</figcaption>
    </figure>`
  })
}

exports.getDef = getDef
exports.getCnrtlURL = getCnrtlURL
