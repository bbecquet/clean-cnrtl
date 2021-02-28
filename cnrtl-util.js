const request = require('request-promise');
const cheerio = require('cheerio');

function getDef(word) {
  return request(`http://www.cnrtl.fr/definition/${word}`).then(extract).then(transform);
}

function extract(html) {
  const $ = cheerio.load(html);
  return $('#contentbox').html();
}

function transform(html) {
  return html;
}

exports.getDef = getDef;
