const request = require('request-promise');
const cheerio = require('cheerio');

function getDef(word) {
    return request(`http://www.cnrtl.fr/definition/${word}`).then(strip);
}

function strip(html) {
    const $ = cheerio.load(html);
    return $('#contentbox').html();
}

exports.getDef = getDef;
