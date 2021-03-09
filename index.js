const express = require('express');
const { handlebars } = require('hbs');
const { getDef, getCnrtlURL } = require('./src/cnrtl-util');
const { registerInlineSVG } = require('./src/inlineSVG');
registerInlineSVG(handlebars);

const app = express();
app.set('view engine', 'hbs');
app.set('views', __dirname + '/templates');

app.use(function (req, _res, next) {
  console.log(new Date().toISOString(), req.originalUrl);
  next();
});

app.get('/def/:word', function (req, res, next) {
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

app.get('/def', function (req, res, next) {
  const word = req.query['word'];
  if (word) {
    res.redirect(`/def/${word}`);
  } else {
    res.render('def');
  }
});

app.use(express.static(__dirname));

// Handle 404
app.use(function (req, res) {
  res.status(404);
  res.send('Not found');
});

const port = process.env.PORT || 3666;
app.listen(port);
console.log('-----\nSite served on http://localhost:' + port + '\n-----');
