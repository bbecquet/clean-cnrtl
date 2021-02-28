const request = require('request-promise');
const cheerio = require('cheerio');

const { noComma } = require('./src/utils');

function getDef(word) {
  return request(`http://www.cnrtl.fr/definition/${word}`).then(transform);
}

function transform(html) {
  const $ = cheerio.load(html);
  transformExamples($);
  return $('#contentbox').html();
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
