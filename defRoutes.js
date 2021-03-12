const express = require('express');
const { handlebars } = require('hbs');
const { getDef, getCnrtlURL } = require('./src/cnrtl-util');
const { registerInlineSVG } = require('./src/inlineSVG');
registerInlineSVG(handlebars);

const router = express.Router();

router.get('/:word', function (req, res, next) {
  const word = req.params.word;
  getDef(word)
    .then(defs => {
      res.render('def', {
        defs,
        word,
        cnrtlLink: getCnrtlURL(word),
      });
    })
    .catch(error => {
      console.error(error);
      next();
    });
});

router.get('/', function (req, res, next) {
  const word = req.query['word'];
  if (word) {
    res.redirect(`/def/${word}`);
  } else {
    res.render('def');
  }
});

module.exports = router;
