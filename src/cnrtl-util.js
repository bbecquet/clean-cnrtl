const request = require('request-promise');
const cheerio = require('cheerio');

const { noComma } = require('./utils');

function getDef(word) {
  return fetchDefinitions(word).then(transform);
}

/**
 * Fetches all definitions of a word, even when different ones are supposed to be fetched asynchronously
 * @param {string} word the word to look for
 */
function fetchDefinitions(word) {
  return (
    request(getCnrtlURL(word))
      .then(html => {
        const $ = cheerio.load(html);
        // the number of tabs on the first result page gives the index of requests to be made
        return $('#vtoolbar li a')
          .map(index => `${getCnrtlURL(word)}//${index}`)
          .get();
      })
      .then(urls => Promise.all(urls.map(request)))
      // a full HTML page is returned each time
      .then(htmls => htmls.map(extractDefinitionPart))
      .then(defs => defs.join(''))
  );
}

function getCnrtlURL(word) {
  return `https://www.cnrtl.fr/definition/${word}`;
}

function extractDefinitionPart(html) {
  const $ = cheerio.load(html);
  return $('#contentbox').html();
}

function transform(html) {
  const $ = cheerio.load(html);
  transformExamples($);
  return $.html();
}

function transformExamples($) {
  $('.tlf_cexemple').replaceWith((_, node) => {
    const $node = $(node);
    // @TODO: composite texts with multiple <i> (ex: happens when the text includes [])
    const citation = $node.children('i').first().text();
    const author = $node.children('.tlf_cauteur').first().text();
    const source = $node.children('.tlf_ctitre').first().text();
    const date = $node.children('.tlf_cdate').first().text();

    // @TODO: extract page information
    return `<figure class="example">
      <blockquote>${citation}</blockquote>
      <figcaption>${noComma(author)}, <cite>${noComma(source)}</cite>, ${noComma(date)}</figcaption>
    </figure>`;
  });
}

exports.getDef = getDef;
exports.getCnrtlURL = getCnrtlURL;
