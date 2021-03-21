const fetch = require('node-fetch')
const cheerio = require('cheerio')

const { noComma, removeFromEnd } = require('./utils')

const getHTML = url => fetch(url).then(res => res.text())

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
  return getHTML(getCnrtlURL(word))
    .then(html => {
      const $ = cheerio.load(html)
      // make a request for each "tab" index, except the first one we already have
      const tabCount = $('#vtoolbar li a').length
      // a full HTML page is returned each time
      const htmls = [$.html()]
      for (let i = 1; i < tabCount; i++) {
        htmls.push(getHTML(`${getCnrtlURL(word)}//${i}`)) // urls on CNRTL have two slashes ¯\_(ツ)_/¯
      }
      return Promise.all(htmls)
    })
    .then(htmls => htmls.map(extractDefinitionPart))
}

function getCnrtlURL(word) {
  return encodeURI(`https://www.cnrtl.fr/definition/${word}`)
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

    let citationEnd = -1
    const citationEndTagClasses = ['tlf_cauteur', 'tlf_ctitre', 'tlf_cpublication', 'tlf_cdate']
    for (let i = 0; citationEnd === -1 && i < citationEndTagClasses.length; i++) {
      citationEnd = rawHTML.indexOf(`<span class="${citationEndTagClasses[i]}`)
    }
    if (citationEnd === -1) {
      citationEnd = rawHTML.length - 1
    }

    let citation = removeFromEnd(rawHTML.substring(0, citationEnd), ['(', ' '])
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
      author && `<span class="source-author">${noComma(author)}</span>`,
      title && `<cite>${noComma(title)}</cite>`,
      publi && `<span class="source-publi">${noComma(publi)}</span>`,
      date && `<span class="source-date">${noComma(date)}</span>`,
      page && `<span class="source-page">${noComma(page)}</span>`,
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
